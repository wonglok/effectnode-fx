// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// useCallback,
import { Editor } from "@monaco-editor/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Vector2 } from "three";
import { setupGLSL } from "../ai/opengl";

const BackupCode = `
#define TAU 6.28318530718
#define MAX_ITER 15
#define FLUCTUATION 0.1


vec4 waterwaves(in vec2 uv) {
    float time = sin(iTime * 0.05) * 2.5;
    vec2 p = mod(uv * TAU * 2.0, TAU) - 250.0;

    // Introduce a fluctuation factor for more realistic wave patterns
    float fluc = sin(time / FLUCTUATION);
    time *= 1.0 + sin(time / FLUCTUATION);

    vec2 i = vec2(p), o;
    float c = 0.1, inten = 0.0035; // Wave intensity factor

    for (int n = 0; n < MAX_ITER; n++) {
        time -= float(n) * 0.5;
        i = p + vec2(cos(time - i.x) + sin(time + i.y), sin(time - i.y) + cos(time + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + time) / inten), p.y / (cos(i.y + time) / inten)));
    }
    // Average cumulative length over all iterations
    c /= float(MAX_ITER);
    c = 1.17 - pow(c, 2.0);

    float colour = sin(pow(abs(c), 8.0));
    colour = clamp(colour, 0.0, 1.0);

    return vec4(clamp(vec3(colour), 0.0, 1.0), 1.0);
}
#define FLAT_TOP_HEXAGON

// Helper vector. If you're doing anything that involves regular triangles or hexagons, the
// 30-60-90 triangle will be involved in some way, which has sides of 1, sqrt(3) and 2.
#ifdef FLAT_TOP_HEXAGON
const vec2 s = vec2(1.7320508, 1);
#else
const vec2 s = vec2(1, 1.7320508);
#endif

float hash21(vec2 p)
{
    return fract(sin(dot(p, vec2(141.13, 289.97)))*43758.5453);
}

// The 2D hexagonal isosuface function: If you were to render a horizontal line and one that
// slopes at 60 degrees, mirror, then combine them, you'd arrive at the following. As an aside,
// the function is a bound -- as opposed to a Euclidean distance representation, but either
// way, the result is hexagonal boundary lines.
float hex(in vec2 p)
{    
    p = abs(p);
    
    #ifdef FLAT_TOP_HEXAGON
    return max(dot(p, s*.5), p.y); // Hexagon.
    #else
    return max(dot(p, s*.5), p.x); // Hexagon.
    #endif    
}

// This function returns the hexagonal grid coordinate for the grid cell, and the corresponding 
// hexagon cell ID -- in the form of the central hexagonal point. That's basically all you need to 
// produce a hexagonal grid.
//
// When working with 2D, I guess it's not that important to streamline this particular function.
// However, if you need to raymarch a hexagonal grid, the number of operations tend to matter.
// This one has minimal setup, one "floor" call, a couple of "dot" calls, a ternary operator, etc.
// To use it to raymarch, you'd have to double up on everything -- in order to deal with 
// overlapping fields from neighboring cells, so the fewer operations the better.
vec4 getHex(vec2 p)
{    
    // The hexagon centers: Two sets of repeat hexagons are required to fill in the space, and
    // the two sets are stored in a "vec4" in order to group some calculations together. The hexagon
    // center we'll eventually use will depend upon which is closest to the current point. Since 
    // the central hexagon point is unique, it doubles as the unique hexagon ID.
    
    #ifdef FLAT_TOP_HEXAGON
    vec4 hC = floor(vec4(p, p - vec2(1, .5))/s.xyxy) + .5;
    #else
    vec4 hC = floor(vec4(p, p - vec2(.5, 1))/s.xyxy) + .5;
    #endif
    
    // Centering the coordinates with the hexagon centers above.
    vec4 h = vec4(p - hC.xy*s, p - (hC.zw + .5)*s);
    
    
    // Nearest hexagon center (with respect to p) to the current point. In other words, when
    // "h.xy" is zero, we're at the center. We're also returning the corresponding hexagon ID -
    // in the form of the hexagonal central point.
    //
    // On a side note, I sometimes compare hex distances, but I noticed that Iomateron compared
    // the squared Euclidian version, which seems neater, so I've adopted that.
    return dot(h.xy, h.xy) < dot(h.zw, h.zw) 
        ? vec4(h.xy, hC.xy) 
        : vec4(h.zw, hC.zw + .5);
}


void mainImage(out vec4 mainColor, in vec2 uv) {
    vec4 water = getHex(vec2(5.0 * uv.y, 10.0 * uv.x));

    vec4 eDist = waterwaves(vec2(hex(water.xy)));

    vec3 color = vec3(0.0, 1.0, 1.0);
    mainColor = vec4(
        pow(eDist.x, 1.0),
        pow(eDist.y, 1.0),
        pow(eDist.z, 1.0), 
        water.a
    ) * vec4(color, 1.0);
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

  let clock = useMemo(() => new Clock(), []);
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
                shader.uniforms.iTime = {
                  get value() {
                    return clock.getElapsedTime();
                  },
                };

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
