import { EditorCanvas } from "./EditorCanvas";
// import { getID } from "effectnode-developer-tools/effectnode-gui/editor-gui/EffectnodeGUI/utils/getID";
// import { myWins } from "effectnode-developer-tools/effectnode-gui/editor-gui/EffectnodeGUI/utils/myApps";
import { useEffect, useMemo } from "react";
import { Object3D, Vector3 } from "three";
import { makeCode, makeGraphNode } from "../../../utils/myGraphNodes";

export function EditorBox({ useStore }) {
  //
  // let wins = useStore((r) => r.wins);
  // let apps = useStore((r) => r.apps);

  let settings = useStore((r) => r.settings) || [];
  let graph = useStore((r) => r.graph);
  let spaceID = useStore((r) => r.spaceID);

  let raycaster = useStore((r) => r._editor_raycaster);
  let pointer = useStore((r) => r._editor_pointer);
  let scene = useStore((r) => r._editor_scene);
  let camera = useStore((r) => r._editor_camera);

  let point3 = useMemo(() => new Vector3(), []);

  useEffect(() => {
    if (!raycaster) {
      return;
    }
    let empty = new Object3D();
    let center = new Vector3(0.0, 0.0, 0.0);
    let ttt = setInterval(() => {
      raycaster.setFromCamera(center, camera);
      let results =
        raycaster.intersectObject(
          scene.getObjectByName("floor") || empty,
          false
        ) || [];

      if (results) {
        let first = results[0];
        if (first) {
          first.point.y = 0;

          point3.copy(first.point);
        }
      }
    }, 100);

    return () => {
      clearInterval(ttt);
    };
  }, [camera, point3, pointer, raycaster, scene]);

  return (
    <>
      <div className=" absolute top-0 left-0 w-full h-full">
        <div
          className="w-full bg-gray-200 border-b border-gray-400 text-sm flex items-center "
          style={{ height: `calc(25px)` }}
        >
          {/*  */}

          <span
            className=" underline cursor-pointer px-2"
            onClick={() => {
              let newNodeItem = makeGraphNode({ spaceID: spaceID });
              newNodeItem.position = point3.toArray();

              let newCodeFile = makeCode({
                spaceID,
                nodeID: newNodeItem._id,
                nodeTitle: newNodeItem.title,
              });

              if (graph.nodes.length === 0) {
                newNodeItem.title = "main";
                newCodeFile.title = "main";
              } else {
                let title = window.prompt(
                  "Please name the module...",
                  "newNodeItem"
                );

                if (title) {
                  newNodeItem.title = title;
                  newCodeFile.title = title;
                }
              }

              graph.nodes.push(newNodeItem);
              useStore.setState({
                graph: { ...graph },
                settings: [...settings, newCodeFile],
              });

              window.dispatchEvent(
                new CustomEvent("editor-save", { detail: {} })
              );
            }}
          >
            Create Item
          </span>

          {/*  */}
        </div>
        <div className="w-full" style={{ height: `calc(100% - 25px)` }}>
          <EditorCanvas useStore={useStore}></EditorCanvas>
        </div>
      </div>
    </>
  );
}

//

//

//
