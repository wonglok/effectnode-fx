// import {
//   Box,
//   Environment,
//   EnvironmentMap,
//   EnvironmentPortal,
// } from "@react-three/drei";
// import { useEffect } from "react";

import { Text } from "@react-three/drei";

export function ToolBox({ boxData, saveBoxData }) {
  // useEditorStore
  //

  return (
    <>
      {/*  */}

      {/*  */}

      <button
        onClick={() => {
          boxData.happy = Math.random().toString(36).slice(2, 9);
          saveBoxData();
        }}
      >
        SetData
      </button>

      {/*  */}

      <br />

      {/*  */}

      {JSON.stringify(boxData)}

      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io, files, boxData }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  return (
    <>
      <Insert3D>
        {/*  */}
        <Text color={"black"} position={[0, 1, 0]}>
          {boxData.happy}
        </Text>

        {/*  */}
      </Insert3D>
    </>
  );
}

//

//

//
