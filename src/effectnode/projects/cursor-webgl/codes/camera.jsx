import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
// import { Mouse } from "src/components/CursorTrackerTail/Mouse";

export function ToolBox({}) {
  return <>camera</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <PerspectiveCamera
          makeDefault
          position={[0, 1.87, ui.positionZ]}
        ></PerspectiveCamera>
        {/*  */}
        <OrbitControls
          object-position={[0, 1.87, ui.positionZ]}
          target={[0, 1.87, 0]}
          makeDefault
          rotateSpeed={1}
        ></OrbitControls>
      </Insert3D>
    </>
  );
}
