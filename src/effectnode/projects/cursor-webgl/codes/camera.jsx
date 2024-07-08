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
          position={[0, 1.5, ui.positionZ]}
        ></PerspectiveCamera>
        <OrbitControls
          object-position={[0, 1.5, ui.positionZ]}
          target={[0, 1.5, 0]}
          makeDefault
          rotateSpeed={1}
        ></OrbitControls>

        {/* <Mouse></Mouse> */}
      </Insert3D>
    </>
  );
}
