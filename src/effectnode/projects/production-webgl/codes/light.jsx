import { useEffect } from "react";

export function ToolBox({ ui, useStore, domElement }) {
  return <>light</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <pointLight
          position={[-2.0, 1.3, 1]}
          color={ui.pointLightColor}
          intensity={ui.intensity}
        ></pointLight>
      </Insert3D>
    </>
  );
}

//

//
