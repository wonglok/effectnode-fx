// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// useCallback,
import { useEffect, useRef, useState } from "react";
import { Clock } from "three";
// import { getTags } from "../ai/tags";
// // import Editor from "@monaco-editor/react";
// import { pullModel } from "../ai/model";
// import { askGLSL } from "../ai/chat";
// import { Editor } from "@monaco-editor/react";
// import SplitPane, { Pane } from "split-pane-react";

export function ToolBox() {
  return null;
}

export function Runtime({ ui, io, useStore, onLoop }) {
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
            <sphereGeometry></sphereGeometry>
            <meshBasicMaterial
              color={color}
              key={"_" + Math.random()}
              onBeforeCompile={(shader) => {
                shader.uniforms.time = { value: 0 };
                setInterval(() => {
                  shader.uniforms.time = { value: window.performance.now() };
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
uniform float time;



// float rand(vec2 n) {
//   return fract(sin(dot(n, vec2(12.9898, 4.14159))) * 43758.5453);
// }

float perlinNoise(in vec2 uv) {
    // Perlin noise implementation based on https://github.com/ashima/webgl-noise
    vec2 i = floor(uv);
    vec2 f = fract(uv);

    float u = dot(i, vec2(1.0));
    float v = dot(i, vec2(0.0, 1.0));

    float noise = mix(
        mix(rand(vec2(u, 0.0)), rand(vec2(u, 1.0)), f.x),
        mix(rand(vec2(v, 0.0)), rand(vec2(v, 1.0)), f.x), 
        f.y);

    return noise;
}

float waterWavePulse(in vec2 uv, in float time) {
    float wave = perlinNoise(uv) + sin(uv.x * 0.1 * 200.0 + time * 0.003141592) * 0.5 + 0.5; 
    return wave;
}

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

diffuseColor.rgb = vec3(waterWavePulse(myUV, time));

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
