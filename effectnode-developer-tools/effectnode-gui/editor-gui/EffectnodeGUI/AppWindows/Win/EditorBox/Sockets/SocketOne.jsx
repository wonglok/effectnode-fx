import { getID } from "effectnode-developer-tools/effectnode-gui/editor-gui/EffectnodeGUI/utils/getID";
import { Box, RoundedBox, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRef } from "react";

export function SocketOne({ idx, type, socket, node, useStore }) {
  let graphCursorState = useStore((r) => r.graphCursorState);
  let controls = useThree((s) => s.controls);
  return (
    <>
      <Text
        position={[0, 0.8, 0]}
        scale={[0.5, 0.5, 1]}
        color={"black"}
        rotation={[Math.PI * -0.5, 0, 0]}
      >
        {idx}
      </Text>

      <RoundedBox
        name={socket._id}
        radius={0.5}
        scale={[1, 0.5, 1]}
        position={[0, 0.5, 0]}
        onPointerDown={({ point }) => {
          //
          graphCursorState.nodeID = node._id;
          graphCursorState.isDown = true;
          graphCursorState.func = "createEdge";
          graphCursorState.ts.copy(point);
          graphCursorState.now.copy(point);
          graphCursorState.last.copy(point);
          graphCursorState.timer = performance.now();
          graphCursorState.accu.set(0, 0, 0);
          controls.enabled = false;

          graphCursorState.socketA = socket;

          //
          useStore.setState({
            graphCursorState: {
              ...graphCursorState,
            },
          });
        }}
        //
        onPointerUp={({ point }) => {
          //
          if (performance.now() - graphCursorState.timer <= 250) {
            //
            let graph = useStore.getState().graph;

            if (type === "output") {
              graph.edges = graph.edges.filter((ed) => {
                return ed.output._id !== socket._id;
              });
            }
            if (type === "input") {
              graph.edges = graph.edges.filter((ed) => {
                return ed.input._id !== socket._id;
              });
            }

            useStore.setState({
              graph: {
                ...graph,
              },
            });

            return;
          }

          // let start = graphCursorState.ts;
          // let end = point.end;
          // console.log(start, end);

          graphCursorState.socketB = socket;

          let ab = [graphCursorState.socketA, graphCursorState.socketB].filter(
            (r) => r
          );
          let hasInput = ab.some((r) => r.type === "input");
          let hasOutput = ab.some((r) => r.type === "output");

          if (hasInput && hasOutput) {
            graphCursorState.inputSocket = [
              graphCursorState.socketA,
              graphCursorState.socketB,
            ].find((r) => r.type === "input");
            graphCursorState.outputSocket = [
              graphCursorState.socketA,
              graphCursorState.socketB,
            ].find((r) => r.type === "output");

            let graph = useStore.getState().graph;

            graph.edges = graph.edges || [];

            graph.edges.push({
              id: getID(),
              input: graphCursorState.inputSocket,
              output: graphCursorState.outputSocket,
            });

            useStore.setState({
              graph: {
                ...graph,
              },
            });
          }
        }}
      >
        <meshStandardMaterial
          roughness={0.3}
          metalness={0.8}
          color={"#44ffff"}
        ></meshStandardMaterial>
      </RoundedBox>
    </>
  );
}
