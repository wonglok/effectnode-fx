import { useEffect, useState } from "react";

export function ToolboxEditor({ code, useEditorStore }) {
  let [st, setSt] = useState(false);

  useEffect(() => {
    if (!code) {
      return;
    }
    if (!useEditorStore) {
      return;
    }

    code.loadCode().then((mod) => {
      setSt(<mod.ToolBox useEditorStore={useEditorStore}></mod.ToolBox>);
    });
  }, [code, useEditorStore]);
  return <>{st}</>;
}
