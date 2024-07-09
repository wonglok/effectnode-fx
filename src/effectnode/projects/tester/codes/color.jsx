import { useEffect } from "react";

export function ToolBox({}) {
  return (
    <>
      {/*  */}

      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  //
  useEffect(() => {
    io.output(0, ui.baseColor);
  });

  return (
    <>
      <Insert3D></Insert3D>
    </>
  );
}
