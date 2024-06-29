import { useMemo } from "react";
import { EffectNode } from "src/effectnode/runtime/EffectNode";
import { create } from "zustand";
import json from "../effectnode/projects/production-webgpu/graph.json";
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
    <div className="w-full h-full select-none no-sel-sub">
      <EffectNode projectName={json.title} useStore={useStore}></EffectNode>
    </div>
  );
}

//
