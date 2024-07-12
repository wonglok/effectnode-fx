// import {
//   Box,
//   Environment,
//   EnvironmentMap,
//   EnvironmentPortal,
// } from "@react-three/drei";
// import { useEffect } from "react";

import { Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";

export function ToolBox({ boxData, saveBoxData, useStore }) {
  // useEditorStore
  //

  return (
    <>
      {/*  */}
      <div className="w-full" style={{ height: `calc(40px)` }}>
        <button
          onClick={() => {
            boxData.happy = Math.random().toString(36).slice(2, 9) + "-lok";
            saveBoxData();
          }}
        >
          SetData
        </button>
      </div>
      <div className="w-full" style={{ height: `calc(100% - 40px)` }}>
        <Canvas>
          <Text color={"black"} position={[0, 1, 0]}>
            {boxData.happy}
          </Text>
        </Canvas>
      </div>
    </>
  );
}

export function Runtime({ ui, useStore, io, files, boxData }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  useEffect(() => {
    // useStore
  }, []);
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
