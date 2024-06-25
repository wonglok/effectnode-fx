import { useRouter } from "next/router";
import { EditorRoot } from "./editor-gui/EffectnodeGUI/EditorRoot.jsx";
import { useEffect, useState } from "react";
import { useDeveloper } from "./store/useDeveloper.js";

export function Editor() {
  let router = useRouter();
  let query = router.query || {};
  let projectID = query.projectID;

  let title = `${projectID}`;

  let [hasFile, setHasFile] = useState(false);

  useEffect(() => {
    //
    if (!title) {
      return;
    }
    useDeveloper
      .getState()
      .hasOne({
        title,
      })
      .then((r) => {
        console.log(r);
        if (r?.hasOne) {
          setHasFile(true);
        }
      });
    //
  }, [title]);

  return <>{hasFile && <EditorRoot title={title}></EditorRoot>}</>;
}

//
