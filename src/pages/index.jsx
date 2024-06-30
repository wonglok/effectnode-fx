import { useMemo } from "react";
import { EffectNode } from "src/effectnode/runtime/EffectNode";
import { create } from "zustand";
import json from "../effectnode/projects/production-webgl/graph.json";
import gpu from "../effectnode/projects/examples-0001-webgpu-components/graph.json";
export default function Home() {
  let useStore1 = useMemo(() => {
    return create((set, get) => {
      return {
        //
        settings: json.settings,
        graph: json.graph,
      };
    });
  }, []);

  let useStore2 = useMemo(() => {
    return create((set, get) => {
      return {
        //
        settings: gpu.settings,
        graph: gpu.graph,
      };
    });
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-2 h-full">
      <div className="w-full h-full select-none no-sel-sub relative">
        <EffectNode projectName={json.title} useStore={useStore1}></EffectNode>
      </div>
      <div className="w-full h-full select-none no-sel-sub relative">
        <EffectNode projectName={gpu.title} useStore={useStore2}></EffectNode>
      </div>
    </div>
  );
}

//
