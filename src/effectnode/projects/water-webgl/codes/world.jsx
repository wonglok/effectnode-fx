// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// useEffect, useRef, useState
import { Sky } from "@react-three/drei";
import { Suspense } from "react";
import { WorldMouse } from "src/components/CursorTrackerTail/WorldMouse";

export function ToolBox({}) {
  return (
    <>
      {/*  */}

      {/*  */}
    </>
  );
}

export function Runtime({ ui, io, useStore, onLoop }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  let InsertHTML = useStore((r) => r.InsertHTML) || (() => null);
  let files = useStore((r) => r.files);

  return (
    <>
      <Insert3D>
        {/* <InsertHTML>
          <div className=" absolute bottom-0 right-0 w-full p-3 bg-white bg-opacity-50">
            {`  "Mirror's Edge Apartment - Interior Scene" (https://skfb.ly/YZoC) by
        Aurélien Martel is licensed under Creative Commons
        Attribution-NonCommercial
        (http://creativecommons.org/licenses/by-nc/4.0/).`}
          </div>
        </InsertHTML> */}

        <Suspense fallback={null}>
          {files["/places/church-2.glb"] && (
            <WorldMouse
              useStore={useStore}
              src={files["/places/church-2.glb"]}
            ></WorldMouse>
          )}
        </Suspense>
        <Sky></Sky>
      </Insert3D>
    </>
  );
}

//
