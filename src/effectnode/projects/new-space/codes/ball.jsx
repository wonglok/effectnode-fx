import { Box, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Clock } from "three";

export function ToolBox({ ui }) {
  return <>Toolbox HA {ui.baseColor}</>;
}

export function Runtime({ ui, io, useStore, onLoop }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  let ref = useRef();
  let input = useRef({
    ["in0"]: 0,
  });
  useEffect(() => {
    return io.in0((v) => {
      console.log(v);
      input.current["in0"] = v;
    });
  }, [io]);

  useEffect(() => {
    let clock = new Clock();
    return onLoop(() => {
      let dt = clock.getDelta();
      if (ref.current) {
        ref.current.rotation.y += dt * 5;
      }
    });
  }, [onLoop]);

  return (
    <>
      <Insert3D>
        <group ref={ref}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry></boxGeometry>
            <meshStandardMaterial color={ui.baseColor}></meshStandardMaterial>
          </mesh>
        </group>

        <directionalLight
          position={[1, 1, 1]}
          color={"#ffffff"}
          intensity={1}
        ></directionalLight>

        <pointLight
          position={[-1, 0, 1]}
          color={"#ff0000"}
          intensity={50}
        ></pointLight>

        <PerspectiveCamera makeDefault position={[0, 0, 5]}></PerspectiveCamera>
      </Insert3D>

      {/* <span style={{ color: ui.baseColor }}>Runtime {ui.baseColor}</span> */}
    </>
  );
}

//
