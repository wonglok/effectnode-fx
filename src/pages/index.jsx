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
    <div className="flex">
      <div className=" w-80 h-80">
        <div className="w-full h-full select-none no-sel-sub relative">
          <EffectNode
            projectName={json.title}
            useStore={useStore1}
          ></EffectNode>
        </div>
      </div>
      <div className=" w-80 h-80">
        <div className="w-full h-full select-none no-sel-sub relative">
          <EffectNode projectName={gpu.title} useStore={useStore2}></EffectNode>
        </div>
      </div>
    </div>
  );
}

//
