import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  IfSessionVisible,
  ShowIfInSessionMode,
  ShowIfSessionVisible,
  useXR,
  useXRStore,
  XROrigin,
} from "@react-three/xr";
import { Vector3 } from "three";
import { Insert3D } from "./main";
import { Suspense } from "react";
// import { Mouse } from "src/components/CursorTrackerTail/Mouse";

export function ToolBox({}) {
  return <>camera</>;
}

export function Runtime({ ui, useStore, io }) {
  //
  return (
    <>
      <Insert3D>
        <OrbitControls
          object-position={[0, 3.87 + 0.5 + 5, 0.01 + 5]}
          target={[0, 3.87 - 0.006 + 0.5 + 5, 5]}
          rotateSpeed={1}
          makeDefault
          enableRotate={false}
        ></OrbitControls>
        <CameraSetter></CameraSetter>
      </Insert3D>
    </>
  );
}

function CameraSetter() {
  return (
    <>
      <Suspense fallback={null}>
        <IfSessionVisible>
          <XROrigin position={new Vector3(0, 5, 10)}></XROrigin>
        </IfSessionVisible>
      </Suspense>
    </>
  );
}
