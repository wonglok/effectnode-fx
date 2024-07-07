import { Environment } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import hdr from "../assets/hdr/symmetrical_garden_02_1k.hdr";

export function ToolBox({}) {
  return <>light</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Suspense fallback={null}>
          <Environment files={[hdr]}></Environment>
        </Suspense>
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
