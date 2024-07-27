import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  IfSessionVisible,
  ShowIfInSessionMode,
  ShowIfSessionVisible,
  useXR,
  useXRStore,
  XROrigin,
} from "@react-three/xr";
import { useEffect, useState } from "react";
import { Vector3 } from "three";
// import { Mouse } from "src/components/CursorTrackerTail/Mouse";

export function ToolBox({}) {
  return <>camera</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  //
  return (
    <>
      <Insert3D>
        <OrbitControls
          object-position={[0, 3.87 + 0.5, 0.01 + 5]}
          target={[0, 3.87 - 0.004 + 0.5, 5]}
          rotateSpeed={1}
        ></OrbitControls>
        <CameraSetter></CameraSetter>
      </Insert3D>
    </>
  );
}

function CameraSetter() {
  return (
    <>
      <IfSessionVisible>
        <XROrigin position={new Vector3(0, 5, 10)}></XROrigin>
      </IfSessionVisible>
    </>
  );
}
