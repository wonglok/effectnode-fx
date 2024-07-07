// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, gpgpu as sphereGPU } from "../modules/sphere/sphere";

export function ToolBox({}) {
  //

  return (
    <>
      <Canvas className="bg-gray-800">
        <Content ui={ui}></Content>
      </Canvas>
    </>
  );
}

export function Runtime({ ui, io, useStore, onLoop }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Content
          key={[sphereGPU, Sphere.toString()].join("___")}
          ui={ui}
        ></Content>
      </Insert3D>
    </>
  );
}

function Content({ ui }) {
  let gl = useThree((r) => r.gl);
  let [api, setDisplay] = useState({ display: null });
  let pointer = useThree((r) => r.pointer);

  //
  useEffect(() => {
    let sphere = new Sphere({
      ui,
      //
      renderer: gl,
      pointer,
    });

    setDisplay({
      sphere,
      display: (
        <>
          <group position={[0, 0, 0]} scale={0.065}>
            <primitive object={sphere}></primitive>
          </group>
        </>
      ),
    });
  }, [gl, pointer, ui]);

  useFrame(() => {
    if (api && api.sphere) {
      api.sphere.compute();
    }
  });

  return (
    <>
      {/*  */}
      {api.display}
    </>
  );
}
//

//

//
