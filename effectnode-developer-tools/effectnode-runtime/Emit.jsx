//

import { useEffect, useMemo } from "react";
import "./tools/allProjects";
import { getSignature } from "./tools/getSignature";
import { LastCache } from "./tools/LastCache";
export function Emit({ onData = () => {} }) {
  let id = useMemo(() => {
    return "_" + Math.floor(Math.random() * 1000000000);
  }, []);

  useEffect(() => {
    let hh = ({ detail: { projects } }) => {
      //
      getSignature(projects).then(({ text }) => {
        if (text !== LastCache[id]) {
          LastCache[id] = text;
          onData({ projects });
        }
      });
    };
    window.addEventListener("effectnode-signal", hh);

    window.dispatchEvent(new CustomEvent("request-effectnode-signal"));

    return () => {
      window.removeEventListener("effectnode-signal", hh);
    };
  }, []);

  return null;
}
