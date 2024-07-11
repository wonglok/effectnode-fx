import {
  Box,
  Environment,
  EnvironmentMap,
  EnvironmentPortal,
} from "@react-three/drei";
import { useEffect } from "react";

export function ToolBox({}) {
  return <></>;
}

export function Runtime({ ui, useStore, io, files }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  return (
    <>
      <Insert3D>
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
