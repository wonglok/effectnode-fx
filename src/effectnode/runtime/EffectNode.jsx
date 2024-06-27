import { useEffect, useMemo, useRef, useState } from "react";
import { allProjects } from "./tools/allProjects";
import { getID } from "./tools/getID";
import { RunnerOne } from "./RunnerOne";

export function EffectNode({ useStore, projectName }) {
  let [api, setDisplay] = useState({ domElement: false });
  let currentProject = allProjects.find((r) => r.projectName === projectName);

  let codes = currentProject?.codes || [];
  let randID = useMemo(() => {
    return getID();
  }, []);

  useEffect(() => {
    let tt = setInterval(() => {
      //
      let domElement = document.querySelector(`#${randID}`);
      if (domElement) {
        setDisplay({
          domElement,
        });
        clearInterval(tt);
      }
    }, 0);

    return () => {
      clearInterval(tt);
    };
  }, [randID]);

  return (
    <>
      <div id={randID}></div>

      {codes.map((code) => {
        return (
          <RunnerOne
            key={code._id}
            code={code}
            useStore={useStore}
            project={currentProject}
            domElement={api.domElement}
          ></RunnerOne>
        );
      })}
    </>
  );
}
