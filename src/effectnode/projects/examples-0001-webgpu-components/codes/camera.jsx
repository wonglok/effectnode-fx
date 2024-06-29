import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

export function ToolBox({ ui, useStore, domElement }) {
  return <>camera</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <PerspectiveCamera
          makeDefault
          position={[0, 0, ui.positionZ]}
        ></PerspectiveCamera>
        <OrbitControls
          makeDefault
          target={[0, 0.4, 0]}
          object-position={[0, 0, ui.positionZ]}
        ></OrbitControls>
      </Insert3D>
    </>
  );
}
