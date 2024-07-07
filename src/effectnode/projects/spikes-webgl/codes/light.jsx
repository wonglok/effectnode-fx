import { Environment } from "@react-three/drei";
import { useEffect } from "react";

import hdr from "../assets/hdr/symmetrical_garden_02_1k.hdr";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
export function ToolBox({}) {
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

        <Environment files={[hdr]}></Environment>
        <EffectComposer enableNormalPass={false}>
          <Bloom
            intensity={10}
            luminanceThreshold={0.5}
            mipmapBlur={true}
          ></Bloom>
        </EffectComposer>
      </Insert3D>
    </>
  );
}

//

//
