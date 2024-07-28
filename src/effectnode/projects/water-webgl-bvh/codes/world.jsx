// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// useEffect, useRef, useState
import { Suspense } from "react";
import { WorldMouse } from "src/components/CursorTrackerTail/WorldMouse";
import { Insert3D } from "./main";

export function ToolBox({}) {
  return (
    <>
      {/*  */}

      {/*  */}
    </>
  );
}

export function Runtime({ ui, io, useStore, files }) {
  return (
    <>
      <Insert3D>
        <Suspense fallback={null}>
          {
            <WorldMouse
              useStore={useStore}
              src={files["/places/church-2.glb"]}
            ></WorldMouse>
          }
        </Suspense>
      </Insert3D>
    </>
  );
}

//
