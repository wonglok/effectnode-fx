import { useEffect } from "react";
import "./tools/allProjects";

export function Emit({ onData = () => {} }) {
  useEffect(() => {
    let tt = ({ detail }) => {
      //
      //
      onData(detail);

      //
    };
    window.addEventListener("effectNode", tt);

    window.dispatchEvent(
      new CustomEvent("requestEffectNodeProjectJSON", { detail: {} })
    );

    return () => {
      window.removeEventListener("effectNode", tt);
    };
  });
  return null;
}
