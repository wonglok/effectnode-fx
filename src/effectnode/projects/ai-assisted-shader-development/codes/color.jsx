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

  // useEffect(() => {
  //
  //   return io.response(0, async (value) => {
  //     console.log(value);
  //     return ui.baseColor;
  //   });
  //
  // }, [io, ui]);

  return (
    <>
      <Insert3D></Insert3D>
    </>
  );
}

//
