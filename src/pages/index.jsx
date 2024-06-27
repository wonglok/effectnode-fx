import { useMemo } from "react";
import { EffectNode } from "effectnode-developer-tools/runtime/EffectNode";
import { create } from "zustand";
import json from "../effectnode/projects/new-space/graph.json";
export default function Home() {
  let useStore = useMemo(() => {
    return create((set, get) => {
      return {
        //
        settings: json.settings,
        graph: json.graph,
      };
    });
  }, []);

  return (
    <div className="w-full h-full">
      <EffectNode projectName={json.title} useStore={useStore}></EffectNode>
    </div>
  );
}
