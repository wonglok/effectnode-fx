// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// useCallback,
import { Editor } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { Clock, Vector2 } from "three";
import { setupGLSL } from "../ai/opengl";

const BackupCode = `

#define TAU 6.28318530718
#define MAX_ITER 15
#define FLUCTUATION 0.1

vec4 waterwaves(in vec2 uv) {
    float time = iTime * 0.05;
    vec2 p = mod(uv * TAU * 2.0, TAU) - 250.0;

    // Introduce a fluctuation factor for more realistic wave patterns
    float fluc = sin(time / FLUCTUATION);
    time *= 1.0 + sin(time / FLUCTUATION);

    vec2 i = vec2(p), o;
    float c = 0.0, inten = 0.01; // Wave intensity factor

    for (int n = 0; n < MAX_ITER; n++) {
        time -= float(n) * 0.5;
        i = p + vec2(cos(time - i.x) + sin(time + i.y), sin(time - i.y) + cos(time + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + time) / inten), p.y / (cos(i.y + time) / inten)));
    }
    // Average cumulative length over all iterations
    c /= float(MAX_ITER);
    c = 1.17 - pow(c, 1.4);

    float colour = sin(pow(abs(c), 8.0));
    colour = clamp(colour, 0.0, 1.0);

    return vec4(clamp(vec3(colour), 0.0, 1.0), 1.0);
}

void mainImage(out vec4 mainColor, in vec2 uv) {
    vec4 water = waterwaves(uv);

    vec3 color = vec3(0.0, 1.0, 1.0);
    mainColor = vec4(
        vec3(pow(water.x, 4.0),
        pow(water.y, 4.0),
        pow(water.z, 4.0)) * (0.2 + color),
        water.a
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
            <button
              className=" underline"
              onClick={() => {
                if (window.prompt("reset to backup code?", "no") === "yes") {
                  boxData.shaderBox = BackupCode;
                }
              }}
            >
              Factory Reset to backup code?
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
                  shader.uniforms.iTime.value = window.performance.now() / 1000;
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
