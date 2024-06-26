import { useFrame, useThree } from "@react-three/fiber";
import { RenderLine } from "./RenderLine";
import { Vector3 } from "three";

export function DisplayAllEdges({ useStore }) {
  let graphCursorState = useStore((r) => r.graphCursorState);
  let graph = useStore((r) => r.graph);
  let edges = graph.edges || [];
  //
  let scene = useThree((r) => r.scene);

  //

  //

  //
  return (
    <>
      {edges.map((ed) => {
        let start = new Vector3();
        let end = new Vector3();

        let input = scene.getObjectByName(ed.input._id);
        if (input) {
          input.getWorldPosition(end);
        }

        let output = scene.getObjectByName(ed.output._id);
        if (output) {
          output.getWorldPosition(start);
        }

        return (
          <EdgeLine
            key={ed._id + ed.input._id + ed.output._id}
            start={start.toArray()}
            end={end.toArray()}
          ></EdgeLine>
        );
      })}
    </>
  );
}

function EdgeLine({ start, end }) {
  return (
    <>
      <RenderLine start={start} end={end}></RenderLine>
    </>
  );
}
