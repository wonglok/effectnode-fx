import { useEffect, useMemo, useState } from "react";

import { RunnerRuntime } from "./RunnerRuntime";
import { RunnerToolBox } from "./RunnerToolBox";
import md5 from "md5";
import { create } from "zustand";
import { getSignature } from "./tools/getSignature";
import { Emit } from "./Emit";

export function EffectNode({
  useStore,
  projectName, //

  // optional for toolbox
  win = false,
  node = { title: false },
  mode = "runtime",

  //
}) {
  let graph = useStore((r) => r.graph) || {};
  let nodes = graph.nodes || [];
  let [api, setDisplay] = useState({ domElement: false });

  let [{ socketMap, useRuntime }, setProjects] = useState({
    socketMap: create(() => {
      return {};
    }),
    useRuntime: create(() => {
      return {
        codes: [],
        project: false,
      };
    }),
  });
  let codes = useRuntime((r) => r.codes);
  let project = useRuntime((r) => r.project);

  useEffect(() => {
    if (!useRuntime) {
      return;
    }
    return useStore.subscribe((state, before) => {
      if (state.settings) {
        useRuntime.setState({
          settings: JSON.parse(JSON.stringify(state.settings)),
        });
      }
    });
  }, [useRuntime, useStore]);

  useEffect(() => {
    let lastText = "";
    let lastCode = "";

    window.addEventListener("effectNode", ({ detail }) => {
      let { projects } = detail;

      let { text, codes } = getSignature(projects);

      if (lastText !== text) {
        lastText = text;
        lastCode = codes;

        let project = projects.find((r) => r.projectName === projectName);

        if (project) {
          setProjects({
            useRuntime: create(() => {
              return {
                project: project,
                codes: project.codes,
                settings: project.settings,
                graph: project.graph,
              };
            }),
            socketMap: create(() => {
              return {};
            }),
          });
        }
      }
    });

    window.dispatchEvent(new CustomEvent("requestEffectNode", { detail: {} }));
  }, [projectName]);

  let randID = useMemo(() => {
    return `_${md5(projectName)}`;
  }, [projectName]);

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
    if (!socketMap) {
      return;
    }
    let api = {
      tsk: [],
      onLoop: (v) => {
        api.tsk.push(v);
      },
      workAll: () => {},
    };

    setAPI(api);

    let rAFID = 0;
    let rAF = () => {
      rAFID = requestAnimationFrame(rAF);
      api.tsk.forEach((t) => t());
    };
    rAFID = requestAnimationFrame(rAF);

    return () => {
      cancelAnimationFrame(rAFID);
    };
  }, [socketMap]);

  //
  // console.log(codes);
  //
  return (
    <>
      <Emit></Emit>
      {socketMap && useRuntime && (
        <div id={randID} className="w-full h-full overflow-hidden">
          {mode === "runtime" &&
            api.domElement &&
            codes
              .filter((code) => {
                //
                return nodes.some((node) => node.title === code.codeName);
              })
              .map((code) => {
                return (
                  <RunnerRuntime
                    onLoop={onLoop}
                    socketMap={socketMap}
                    win={win}
                    key={code._id}
                    code={code}
                    useStore={useRuntime}
                    project={project}
                    domElement={api.domElement}
                  ></RunnerRuntime>
                );
              })}

          {mode === "toolbox" &&
            api.domElement &&
            codes
              .filter((r) => {
                return r.codeName === node.title;
              })
              .map((code) => {
                return (
                  <RunnerToolBox
                    onLoop={onLoop}
                    win={win}
                    socketMap={socketMap}
                    key={code._id}
                    code={code}
                    useStore={useRuntime}
                    project={project}
                    domElement={api.domElement}
                  ></RunnerToolBox>
                );
              })}
        </div>
      )}
    </>
  );
}
