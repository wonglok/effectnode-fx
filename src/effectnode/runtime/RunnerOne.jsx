import { useEffect, useMemo, useState } from "react";

export function RunnerOne({ project, code, useStore, domElement }) {
  //
  let [mounted, setMount] = useState(null);
  //
  let codePromise = useMemo(() => {
    return code.loadCode();
  }, [code]);
  //
  let codeName = code.codeName;

  useEffect(() => {
    codePromise.then((mod) => {
      function Run() {
        let settings = useStore((r) => r.settings);
        let graph = useStore((r) => r.graph);
        let nodes = graph.nodes;
        let nodeID = nodes.find((r) => r.title === codeName);

        let ui = {};
        settings
          .filter((r) => nodes.some((n) => n._id === nodeID))
          .forEach((set) => {
            ui[set.label] = set.value;
          });

        return <mod.Runtime ui={ui}></mod.Runtime>;
      }
      setMount(<Run></Run>);
    });
  }, [codeName, codePromise, useStore]);

  //
  //
  //
  return (
    <>
      {/*  */}

      {mounted}

      {/*  */}
    </>
  );
}
