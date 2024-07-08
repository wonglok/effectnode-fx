import { useEffect, useMemo, useState } from "react";
import { CodeRun } from "./CodeRun";

export function RunnerRuntime({
  onLoop,
  socketMap,
  code,
  useStore,
  domElement,
  mode,
}) {
  //

  let [mounted, setMount] = useState(null);
  //
  let codePromise = useMemo(() => {
    return code.loadCode();
  }, [code]);
  //
  let codeName = code.codeName;
  //

  useEffect(() => {
    ///

    ///
    codePromise.then((mod) => {
      if (mode === "runtime") {
        setMount(
          <CodeRun
            onLoop={onLoop}
            socketMap={socketMap}
            domElement={domElement}
            useStore={useStore}
            codeName={codeName}
            Algorithm={mod.Runtime}
          ></CodeRun>
        );
      }

      if (mode === "toolbox") {
        setMount(
          <CodeRun
            onLoop={onLoop}
            socketMap={socketMap}
            domElement={domElement}
            useStore={useStore}
            codeName={codeName}
            Algorithm={mod.ToolBox}
          ></CodeRun>
        );
      }
    });

    return () => {
      setMount(null);
    };
  }, [codeName, onLoop, socketMap, codePromise, domElement, useStore, mode]);

  //
  return (
    <>
      {/*  */}

      {mounted}

      {/*  */}
    </>
  );
}
