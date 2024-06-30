import { useMemo } from "react";
import { EffectNode } from "src/effectnode/runtime/EffectNode";
import { create } from "zustand";
import json from "../effectnode/projects/gallery/graph.json";
export default function Home() {
  let useStoreWebGL = useMemo(() => {
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
      <div className="w-full h-full select-none no-sel-sub relative">
        <EffectNode
          projectName={json.title}
          useStore={useStoreWebGL}
        ></EffectNode>
      </div>
    </div>
  );
}

//
