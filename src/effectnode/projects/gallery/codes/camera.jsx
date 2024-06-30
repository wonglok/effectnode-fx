import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

export function ToolBox({ ui, useStore, domElement }) {
  return <>camera</>;
}

export function Runtime({ ui, useStore, io, domElement }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  let camera = useStore((r) => r.camera);
  return (
    <>
      <Insert3D>
        <PerspectiveCamera makeDefault position={[0, 0, 2]}></PerspectiveCamera>
        <OrbitControls
          makeDefault
          enableZoom={false}
          enableRotate={false}
          args={[camera, domElement]}
        ></OrbitControls>
      </Insert3D>
    </>
  );
}
