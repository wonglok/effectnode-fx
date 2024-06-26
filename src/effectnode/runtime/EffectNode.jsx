import { useEffect, useRef, useState } from "react";
import { allProjects } from "./tools/allProjects";
import { getID } from "./tools/getID";

export function EffectNode({ projectName }) {
  let currentProject = allProjects.find((r) => r.projectName === projectName);

  console.log(currentProject);
  let [display, setDisplay] = useState(null);
  useEffect(() => {
    let randID = getID();

    setDisplay(<div id={randID}></div>);

    return;
  }, []);

  //
  return <>{display}</>;
}
