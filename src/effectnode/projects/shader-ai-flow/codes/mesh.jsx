// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// useCallback,
import { Editor } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { Clock, Vector2 } from "three";
import { language, setupGLSL } from "../ai/opengl";

const BackupCode = `
#define TAU 6.28318530718
#define MAX_ITER 15

vec4 waterwaves(in vec2 uv) {
  // Set a fixed time value, this value can be updated for animations or transitions
  float time = iTime * .5 + 23.0;

  #ifdef SHOW_TILING
  // Tiling function to make the waves appear tiled
  vec2 p = mod(uv * TAU * 2.0, TAU) - 250.0;
  #else
  vec2 p = mod(uv * TAU, TAU) - 250.0;
  #endif

  vec2 i = vec2(p); // Initialize the vector with the tile position
  float c = 1.0; // Initial intensity of the wave
  float inten = .005; // Amplitude of the wave's texture influence

  for (int n = 0; n < MAX_ITER; n++) {
    // Time dependent wavy displacement based on time and position
    float t = time * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    // Calculate the new texture coordinates based on the wave function
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
  }
  // Normalize the intensity values by the total iterations performed
  c /= float(MAX_ITER);
  c = 1.17 - pow(c, 1.4);

  vec3 colour = vec3(pow(abs(c), 3.5));
  colour = clamp(colour + vec3(0.0, 0.0, 0.0), 0.0, 1.0);
  
  // Tiling and border flashing (only shown when SHOW_TILING is defined)
  #ifdef SHOW_TILING
  // Convert the pixel coordinates to UV coordinates based on resolution.
  vec2 pixel = 2.0 / iResolution.xy;
  uv *= 2.0;

  float f = floor(mod(iTime * .5, 2.0)); 
  vec2 first = step(pixel, uv) * f; 
  // Create the border effect by adding pixels for every tile and flashing every other frame
  uv = step(fract(uv), pixel); 
  colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y);
  
  #endif

  return vec4(colour, 1.0);
}

void mainImage(out vec4 mainColor, in vec2 uv) {
  vec4 water = waterwaves(uv);

  mainColor = vec4(
    // Calculate the color by exponentiating the RGB intensity
    vec3(pow(water.r, 4.0), pow(water.g, 4.0), pow(water.b, 4.0)) * 1.1,
    1.0
  );
}
`;

const RunnerCode = `

vec4 outputColor;

mainImage(outputColor, myUV);

diffuseColor.rgba = outputColor.rgba;

`;

export const CodeThatWorks = BackupCode;

export function ToolBox({ boxData, saveBoxData, setToolboxFullScreen }) {
  // boxData
  useEffect(() => {
    // init

    setToolboxFullScreen(true);
  }, [setToolboxFullScreen]);
  //
  let [editor, setEditor] = useState();
  let [monaco, setMonaco] = useState();

  useEffect(() => {
    if (!boxData.shaderBox) {
      boxData.shaderBox = BackupCode;
      saveBoxData();
    }
  }, [saveBoxData, boxData]);

  return (
    <>
      <div className="w-full h-full ">
        <div
          className="w-full flex items-center bg-gray-600 text-white"
          style={{ height: "30px" }}
        >
          <div className="text-xs px-2">
            Mesh Shader{" "}
            <button
              className=" underline"
              onClick={() => {
                if (window.prompt("reset to backup code?", "no") === "yes") {
                  boxData.shaderBox = BackupCode;
                }
              }}
            >
              Reset to backup code?
            </button>
          </div>
        </div>
        <div
          onKeyDownCapture={(ev) => {
            if (ev.metaKey && ev.key === "s") {
              ev.preventDefault();
            }
            if (ev.ctrlKey && ev.key === "s") {
              ev.preventDefault();
            }
          }}
          className="w-full"
          style={{ height: "calc(100% - 30px)" }}
        >
          <Editor
            height={`100%`}
            defaultLanguage="glsl"
            defaultValue={`${boxData.shaderBox || ""}`}
            onMount={(editor, monaco) => {
              //
              setEditor(editor);
              //
              setMonaco(monaco);

              setupGLSL({ editor, monaco });
              //

              //

              editor.updateOptions({
                wordWrap: "on",
              });
            }}
            onChange={(text) => {
              boxData.shaderBox = text;
              saveBoxData();
            }}

            //
          ></Editor>
        </div>
      </div>
    </>
  );
}

export function Runtime({ ui, io, useStore, onLoop, boxData }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  let ref = useRef();

  useEffect(() => {
    let clock = new Clock();
    return onLoop(() => {
      let dt = clock.getDelta();

      if (ref.current) {
        ref.current.rotation.y += dt * ui.speed;
      }
    });
  }, [onLoop, ui]);

  let [color, setColor] = useState("#ffffff");

  useEffect(() => {
    io.in(0, (color) => {
      setColor(color);
    });
  }, [ui, io]);

  return (
    <>
      <Insert3D>
        <group ref={ref}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1, 64, 64]}></sphereGeometry>
            <meshBasicMaterial
              color={color}
              key={"_" + Math.random() + boxData.shaderBox}
              onBeforeCompile={(shader, gl) => {
                shader.uniforms.iTime = { value: 0 };
                setInterval(() => {
                  shader.uniforms.iTime = {
                    value: window.performance.now() / 1000,
                  };
                });
                shader.uniforms.iResolution = { value: new Vector2(512, 512) };
                setInterval(() => {
                  gl.getSize(shader.uniforms.iResolution.value);
                });
                shader.vertexShader = shader.vertexShader.replace(
                  "#include <color_pars_vertex>",
                  `
#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif 

varying vec2 myUV;
varying vec3 vPos;

                  `
                );

                shader.vertexShader = shader.vertexShader.replace(
                  "#include <color_vertex>",
                  `
#if defined( USE_COLOR_ALPHA )

	vColor = vec4( 1.0 );

#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )

	vColor = vec3( 1.0 );

#endif

#ifdef USE_COLOR

	vColor *= color;

#endif

#ifdef USE_INSTANCING_COLOR

	vColor.xyz *= instanceColor.xyz;

#endif

#ifdef USE_BATCHING_COLOR

	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );

	vColor.xyz *= batchingColor.xyz;

#endif

myUV = uv;

vPos = position;


                  `
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                  "#include <color_pars_fragment>",
                  `
#if defined( USE_COLOR_ALPHA )

	varying vec4 vColor;

#elif defined( USE_COLOR )

	varying vec3 vColor;

#endif

varying vec2 myUV;
uniform float iTime;
varying vec3 vPos;

uniform vec2 iResolution;

${boxData.shaderBox || ""}

  
`
                );

                shader.fragmentShader = shader.fragmentShader.replace(
                  "#include <color_fragment>",
                  `
#if defined( USE_COLOR_ALPHA )

	diffuseColor *= vColor;

#elif defined( USE_COLOR )

	diffuseColor.rgb *= vColor;

#endif



${
  boxData.shaderBox
    ? `
${RunnerCode}
`
    : ""
}


              `
                );
              }}
            ></meshBasicMaterial>
          </mesh>
        </group>
      </Insert3D>
    </>
  );
}

//

//

//

//
