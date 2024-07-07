import { useEffect } from "react";
import { getAllProjects } from "./tools/allProjects";
import { getSignature } from "./tools/getSignature";
import { LastCache } from "./tools/LastCache";

export function Emit({ onData = () => {} }) {
  useEffect(() => {
    let hh = ({ detail: { projects } }) => {
      //
      onData({ projects });
    };
    window.addEventListener("effectnode", hh);
    return () => {
      window.removeEventListener("effectnode", hh);
    };
  }, []);

  useEffect(() => {
    let i = "";
    getAllProjects({}).then(async (data) => {
      let { text } = await getSignature(data);

      if (text !== i) {
        i = text;
        window.dispatchEvent(
          new CustomEvent("effectnode", { detail: { projects: data } })
        );
      }
    });

    return () => {};
  }, []);

  return null;
}
