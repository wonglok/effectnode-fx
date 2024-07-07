import { useEffect } from "react";

export function ToolBox({ useEditorStore }) {
  // let editorStoree = useEditorStore
  return (
    <>
      {/*  */}
      123
      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  useEffect(() => {
    io.output(0, ui.baseColor);
  }, [io, ui.baseColor]);

  return (
    <>
      <Insert3D></Insert3D>
    </>
  );
}
