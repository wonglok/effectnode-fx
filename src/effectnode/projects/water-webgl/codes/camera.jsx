import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
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
          position={[0, 1.87, 0.0333 + 20]}
        ></PerspectiveCamera>
        {/*  */}
        <OrbitControls
          object-position={[0, 1.87 + 1, 0.0333 + 20]}
          target={[0.01, 1.87 + 1, 0.0 + 20.0]}
          makeDefault
          rotateSpeed={1}
        ></OrbitControls>
      </Insert3D>
    </>
  );
}
