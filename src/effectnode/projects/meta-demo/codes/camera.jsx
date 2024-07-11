import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

export function ToolBox({}) {
  return <>camera</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        {/*  */}
        <PerspectiveCamera
          makeDefault
          position={[0, 1, ui.positionZ]}
        ></PerspectiveCamera>

        <OrbitControls
          makeDefault
          object-position={[0, 1, ui.positionZ]}
          target={[0, 1, 0]}
        ></OrbitControls>
        {/*  */}
      </Insert3D>
    </>
  );
}
