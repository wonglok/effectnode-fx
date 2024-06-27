import { useEffect, useMemo, useState } from "react";
import { allProjects } from "./tools/allProjects";
// import { getID } from "./tools/getID";
import { RunnerRuntime } from "./RunnerRuntime";
import { RunnerToolBox } from "./RunnerToolBox";
import md5 from "md5";

export function EffectNode({
  useStore,
  projectName, //

  // optional for toolbox
  node = { title: false },
  mode = "runtime",
}) {
  let graph = useStore((r) => r.graph) || {};
  let nodes = graph.nodes || [];
  let [api, setDisplay] = useState({ domElement: false });
  let currentProject = allProjects.find((r) => r.projectName === projectName);

  let codes = currentProject?.codes || [];
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

  //
  // console.log(codes);
  //

  return (
    <>
      <div id={randID}></div>

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
                key={code._id}
                code={code}
                useStore={useStore}
                project={currentProject}
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
                key={code._id}
                code={code}
                useStore={useStore}
                project={currentProject}
                domElement={api.domElement}
              ></RunnerToolBox>
            );
          })}
    </>
  );
}
