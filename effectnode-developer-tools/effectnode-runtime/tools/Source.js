import { useEffect } from "react";
import { loadProjects } from "./allProjects";
import { getSignature } from "./getSignature";
import { usePopStore } from "./usePopStore";

export function Source({ projectName }) {
  useEffect(() => {
    //
    let dataProm = loadProjects({ projectName });
    dataProm.then(async (projects) => {
      //
      let nowSig = await getSignature(projects);
      let oldSig = await getSignature(usePopStore.getState().projects);

      if (nowSig.text !== oldSig.text) {
        usePopStore.setState({
          projects,
        });
      }
    });
  }, [projectName]);

  return null;
}
