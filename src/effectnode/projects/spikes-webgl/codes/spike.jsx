// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Spike, gpgpu as spikeGPU } from "../modules/spikes/spikes";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

export function ToolBox({ ui, io, useStore, onLoop }) {
  return (
    <>
      {/*  */}
      123123123
      {/*  */}
    </>
  );
}

export function Runtime({ ui, io, useStore, onLoop }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Content key={[spikeGPU].join("___")} ui={ui}></Content>
      </Insert3D>
    </>
  );
}

function Content({ ui }) {
  let gl = useThree((r) => r.gl);
  let [api, setDisplay] = useState({ display: null });
  let pointer = useThree((r) => r.pointer);

  useEffect(() => {
    gl.domElement.addEventListener(
      "touchstart",
      (ev) => {
        ev.preventDefault();
      },
      {
        passive: false,
      }
    );

    gl.domElement.addEventListener(
      "touchmove",
      (ev) => {
        ev.preventDefault();
      },
      {
        passive: false,
      }
    );

    //

    let spike = new Spike({
      ui,
      renderer: gl,
      pointer,
    });

    setDisplay({
      spike,
      display: (
        <>
          <group position={[0, 0, 0]} scale={0.065}>
            <primitive object={spike}></primitive>
          </group>
        </>
      ),
    });
  }, [gl, pointer, ui]);

  useFrame(() => {
    if (api && api.spike) {
      api.spike.compute();
    }
  });

  return (
    <>
      {/*  */}
      {api.display}
      {/*  */}
    </>
  );
}
//

//

//
