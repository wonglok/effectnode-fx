import { useEffect, useMemo, useState } from "react";
import { CodeRun } from "./CodeRun";

export function RunnerRuntime({ map, win, code, useStore, domElement }) {
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
          win={win}
          map={map}
          domElement={domElement}
          useStore={useStore}
          codeName={codeName}
          Algorithm={mod.Runtime}
        ></CodeRun>
      );
    });

    return () => {
      setMount(null);
    };
  }, [codeName, map, codePromise, domElement, win, useStore]);

  //
  return (
    <>
      {/*  */}

      {mounted}

      {/*  */}
    </>
  );
}
