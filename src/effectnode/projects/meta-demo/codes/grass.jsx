// import {
//   Box,
//   Environment,
//   EnvironmentMap,
//   EnvironmentPortal,
// } from "@react-three/drei";
// import { useEffect } from "react";

export function ToolBox({ nodeID, useEditorStore }) {
  let settings = useEditorStore((r) => r.settings);
  let setting = settings.find((r) => r.nodeID === nodeID);

  //
  return (
    <>
      {/*  */}
      {JSON.stringify(setting)}
      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io, files }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  return (
    <>
      <Insert3D>
        {/*  */}

        {/*  */}
      </Insert3D>
    </>
  );
}

//

//

//
