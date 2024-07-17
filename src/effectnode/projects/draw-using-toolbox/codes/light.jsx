import { Environment } from "@react-three/drei";

export function ToolBox({}) {
  return <></>;
}

export function Runtime({ ui, useStore, io }) {
  let files = useStore((r) => r.files) || {};
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  return (
    <>
      <Insert3D>
        <color attach={"background"} args={[ui.baseColor]}></color>
        <pointLight
          position={[-1.5, 0.5, 1]}
          color={ui.pointLightColor}
          intensity={ui.intensity}
        ></pointLight>
        <Environment
          files={[files[`/hdr/greenwich_park_02_1k.hdr`]]}
        ></Environment>
      </Insert3D>
    </>
  );
}

//

//

//
