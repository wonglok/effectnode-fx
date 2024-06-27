export function ToolBox({ ui, useStore, domElement }) {
  return <>light</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <pointLight
          position={[-1, 0, 1]}
          color={ui.pointLightColor}
          intensity={50}
        ></pointLight>
      </Insert3D>
    </>
  );
}

//
