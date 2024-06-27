import { useEffect } from "react";
export function ToolBox({ ui, useStore, domElement }) {
  return (
    <>
      {/*  */}
      {/*  */}
      toolbox main
      {/*  */}
      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io }) {
  useEffect(() => {
    let tt = setInterval(() => {
      io.out0(ui.speed);
    });
    return () => {
      clearInterval(tt);
    };
  }, [io, ui]);

  return (
    <>
      {/*  */}

      {/*  */}
    </>
  );
}

//
