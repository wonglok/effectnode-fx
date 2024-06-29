import { useEffect, useMemo, useState } from "react";
import { getAllProjects } from "./tools/allProjects";
// import { getID } from "./tools/getID";
import { RunnerRuntime } from "./RunnerRuntime";
import { RunnerToolBox } from "./RunnerToolBox";
import md5 from "md5";
import { getSignature } from "./tools/getSignature";

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

  let [allProjects, setProjects] = useState([]);
  let currentProject = allProjects.find((r) => r.projectName === projectName);
  useEffect(() => {
    //
    if (process.env.NODE_ENV === "development") {
      //
      getAllProjects().then((pjs) => {
        setProjects((old) => {
          let newStr = getSignature(pjs);
          let oldStr = getSignature(old);

          if (newStr === oldStr) {
            return old;
          } else {
            return pjs;
          }
        });
      });
    } else {
      getAllProjects().then((pjs) => {
        setProjects(pjs);
      });
    }
  }, []);

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
                  win={win}
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
                  win={win}
                  key={code._id}
                  code={code}
                  useStore={useStore}
                  project={currentProject}
                  domElement={api.domElement}
                ></RunnerToolBox>
              );
            })}
      </div>
    </>
  );
}
