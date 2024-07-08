import { Environment } from "@react-three/drei";

export function ToolBox({}) {
  return <></>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  let files = useStore((r) => r.files);

  console.log(files["/hdr/studiolighting.hdr"]);
  return (
    <>
      <Insert3D>
        {/* <pointLight
          position={[-1.5, 0.5, 1]}
          color={ui.pointLightColor}
          intensity={ui.intensity}
        ></pointLight> */}
        <Environment files={[files["/hdr/studiolighting.hdr"]]}></Environment>
      </Insert3D>
    </>
  );
}

//

//

//
