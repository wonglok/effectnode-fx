import { useRouter } from "next/router";
import { EditorRoot } from "./editor-gui/EffectnodeGUI/EditorRoot.jsx";
import { useEffect, useState } from "react";
import { useDeveloper } from "./store/useDeveloper.js";

export function Editor() {
  let router = useRouter();
  let query = router.query || {};
  let projectID = query.projectID;

  let title = `${projectID}`;

  let [hasFile, setHasFile] = useState("loading");

  useEffect(() => {
    //
    if (!title) {
      return;
    }

    setHasFile("loading");

    let load = ({ i = 15 }) => {
      console.log(i);
      useDeveloper
        .getState()
        .hasOne({
          title,
        })
        .then((r) => {
          console.log(r);
          if (r?.hasOne) {
            setHasFile("has");
          } else {
            setHasFile("donthave");
          }
        });
    };

    load({ i: 15 });

    return () => {
      setHasFile("loading");
    };
  }, [title]);

  return (
    <>
      {hasFile === "has" && <EditorRoot title={title}></EditorRoot>}
      {hasFile === "loading" && <>Loading...</>}
      {hasFile === "donthave" && <>Missing Project</>}
    </>
  );
}

//
