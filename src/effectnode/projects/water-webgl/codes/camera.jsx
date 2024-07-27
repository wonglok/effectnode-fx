import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { XROrigin } from "@react-three/xr";
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
        <PerspectiveCamera
          makeDefault
          position={[0, 1.87 + 0.5, 0 + 15.01]}
        ></PerspectiveCamera>

        <OrbitControls
          object-position={[0, 1.87 + 0.5, 0.01 + 15]}
          target={[0, 1.87 + 0.5, 15]}
          makeDefault
          rotateSpeed={1}
        ></OrbitControls>

        <XROrigin position={new Vector3(0, 10, 10)}></XROrigin>
      </Insert3D>
    </>
  );
}
