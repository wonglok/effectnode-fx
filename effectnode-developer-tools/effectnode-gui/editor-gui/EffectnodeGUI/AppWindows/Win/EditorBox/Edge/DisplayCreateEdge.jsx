import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RenderLine } from "./RenderLine";
// import { Box } from "@react-three/drei";

export function DisplayCreateEdge({ useStore }) {
  let graphCursorState = useStore((r) => r.graphCursorState);

  let [{ start, end }, set] = useState({ start: [0, 0, 0], end: [0, 0, 0] });

  useFrame(({ raycaster, scene, camera, pointer }) => {
    raycaster.setFromCamera(pointer, camera);
    let floor = scene.getObjectByName("floor");
    if (floor) {
      let results = raycaster.intersectObject(floor);
      if (results) {
        let first = results[0];
        if (first) {
          set({
            start: graphCursorState.ts.toArray(),
            end: first.point.toArray(),
          });
        }
      }
    }
  });

  //

  return <RenderLine start={start} end={end}></RenderLine>;
}

//

//

//
