import { useEffect, useMemo, useState } from "react";
import { CodeRun } from "./CodeRun";

export function RunnerRuntime({ code, useStore, domElement }) {
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
    codePromise.then((mod) => {
      setMount(
        <CodeRun
          domElement={domElement}
          useStore={useStore}
          codeName={codeName}
          Algorithm={mod.Runtime}
        ></CodeRun>
      );
    });
  }, [codeName, codePromise, domElement, useStore]);

  //
  return (
    <>
      {/*  */}

      {mounted}

      {/*  */}
    </>
  );
}
