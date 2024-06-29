import { useEffect, useMemo, useState } from "react";
import { CodeRun } from "./CodeRun";

export function RunnerToolBox({ map, code, useStore, domElement }) {
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
          map={map}
          domElement={domElement}
          useStore={useStore}
          codeName={codeName}
          Algorithm={mod.ToolBox}
        ></CodeRun>
      );
    });

    return () => {
      setMount(null);
    };
  }, [codeName, codePromise, map, domElement, useStore]);

  //
  return (
    <>
      {/*  */}

      {mounted}

      {/*  */}
    </>
  );
}
