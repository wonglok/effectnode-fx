import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import md5 from "md5";
import { create } from "zustand";
import { Emit } from "./Emit";
import { getSignature } from "./tools/getSignature";
import { usePopStore } from "./tools/usePopStore";
import { CodeRun } from "./CodeRun";

export function EffectNode({
  projectName, //

  // optional for toolbox
  mode = "runtime",
  nodeID = false,
  useEditorStore = false,
}) {
  //
  // projectName = projectName.toLowerCase();
  //

  let [api, setDisplay] = useState({ domElement: false });

  let useRuntime = useMemo(() => {
    return create((set, get) => {
      //
      return {
        socketMap: create(() => ({})),

        codes: false,
        settings: [],

        projectName: projectName,
        files: false,
        graph: false,
      };
      //
    });
  }, [projectName]);

  // let files = useRuntime((r) => r.files);
  let socketMap = useRuntime((r) => r.socketMap);
  let codes = useRuntime((r) => r.codes) || [];
  let graph = useRuntime((r) => r.graph);
  let edges = graph.edges || [];
  let nodes = graph.nodes || [];
  let node = nodes.find((r) => r._id === nodeID);
  let codeImple = codes.find((r) => r.codeName === node?.title);

  useEffect(() => {
    if (!useRuntime) {
      return;
    }
    if (!useEditorStore) {
      return;
    }

    let last = "";
    return useEditorStore.subscribe((state, before) => {
      let now = JSON.stringify({
        settings: state.settings,
      });
      if (now !== last) {
        last = now;
        useRuntime.setState({
          settings: JSON.parse(JSON.stringify(state.settings)),
        });
      }
    });
  }, [useRuntime, useEditorStore]);

  // Graph Editor
  useEffect(() => {
    if (!useRuntime) {
      return;
    }
    if (!useEditorStore) {
      return;
    }

    let last = "";
    return useEditorStore.subscribe((state, before) => {
      let now = JSON.stringify({
        graph: {
          nodes: state.graph.nodes.map((r) => {
            return {
              ...r,
              position: [0, 0, 0],
            };
          }),
          edges: state.graph.edges,
        },
      });
      if (now !== last) {
        last = now;
        useRuntime.setState({
          socketMap: create(() => {
            return {};
          }),
          graph: JSON.parse(JSON.stringify(state.graph)),
        });
      }
    });
  }, [useRuntime, useEditorStore]);

  let randID = useMemo(() => {
    return `_${md5(projectName)}${mode}${nodeID || ""}`;
  }, [projectName, mode, nodeID]);

  useEffect(() => {
    let tt = setInterval(() => {
      //
      let domElement = document.querySelector(`#${randID}`);
      //
      if (domElement) {
        //
        clearInterval(tt);
        //
        setDisplay({
          domElement,
        });
      }
    }, 0);

    return () => {
      clearInterval(tt);
    };
  }, [randID]);

  let [{ onLoop }, setAPI] = useState({
    onLoop: () => {},
  });

  useEffect(() => {
    let api = {
      tsk: [],
      onLoop: (v) => {
        api.tsk.push(v);
      },
    };

    setAPI(api);

    let rAFID = 0;
    let rAF = async () => {
      for (let t of api.tsk) {
        await t();
      }
      rAFID = requestAnimationFrame(rAF);
    };
    rAFID = requestAnimationFrame(rAF);

    return () => {
      cancelAnimationFrame(rAFID);
    };
  }, []);

  let onData = useCallback(
    async (data) => {
      //
      let projects = data.projects;
      let project = projects.find((r) => r.projectName === projectName);

      if (project) {
        let files = {};
        project.assets.forEach((ac) => {
          files[ac._id.split("/assets")[1]] = ac.assetURL;
        });

        if (useEditorStore) {
          useRuntime.setState({
            files: files,
            project: project,
            codes: project.codes,
          });
        } else {
          useRuntime.setState({
            socketMap: create(() => {
              return {};
            }),
            files: files,
            project: project,
            codes: project.codes,
            settings: project.settings,
            graph: project.graph,
          });
        }
      }
    },

    [projectName, useRuntime, useEditorStore]
  );

  let projects = usePopStore((s) => s.projects);

  useEffect(() => {
    onData({ projects: usePopStore.getState().projects });

    return usePopStore.subscribe(async (now, b4) => {
      let nowSig = await getSignature(now.projects);
      let b4Sig = await getSignature(b4.projects);
      if (nowSig.text !== b4Sig.text) {
        onData({ projects: projects });
      }
    });
  }, [onData, projects]);

  return (
    <>
      {socketMap && useRuntime && (
        // <div id={randID} className="w-full h-full overflow-hidden relative">
        <>
          {mode === "runtime" &&
            // api.domElement &&
            nodes
              .filter((node) => {
                return codes.some((code) => node.title === code.codeName);
              })
              .map((node) => {
                let codeImple = codes.find((r) => r.codeName === node.title);

                return (
                  <CodeRun
                    mode={"runtime"}
                    key={node?._id + codeImple?._id}
                    onLoop={onLoop}
                    nodeID={node._id}
                    socketMap={socketMap}
                    // domElement={api.domElement}
                    useStore={useRuntime}
                    Algorithm={codeImple?.mod?.Runtime}
                    useEditorStore={useEditorStore}
                  ></CodeRun>
                );
              })}

          {mode === "toolbox" && nodeID && (
            <CodeRun
              mode={"toolbox"}
              key={nodeID + codeImple?._id}
              onLoop={onLoop}
              nodeID={nodeID}
              socketMap={socketMap}
              // domElement={api.domElement}
              useStore={useRuntime}
              Algorithm={codeImple?.mod?.ToolBox}
              useEditorStore={useEditorStore}
            ></CodeRun>
          )}
        </>
      )}

      <Emit projectName={projectName}></Emit>

      {/*  */}

      {/*  */}
    </>
  );
}
