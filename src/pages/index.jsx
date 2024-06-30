import { useMemo } from "react";
import { EffectNode } from "src/effectnode/runtime/EffectNode";
import { create } from "zustand";
import json from "../effectnode/projects/production-webgl/graph.json";
import gpu from "../effectnode/projects/examples-0001-webgpu-components/graph.json";
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

  let useStoreWebGPU = useMemo(() => {
    return create((set, get) => {
      return {
        //
        settings: gpu.settings,
        graph: gpu.graph,
      };
    });
  }, []);

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-2 h-full">
        <video
          controls
          autoPlay
          muted
          src={`/docs/yo-720p.mp4`}
          className=""
        ></video>

        <div className="w-full h-full select-none no-sel-sub relative">
          <EffectNode
            projectName={gpu.title}
            useStore={useStoreWebGPU}
          ></EffectNode>
        </div>
        {/* <div className="w-full h-full select-none no-sel-sub relative">
          <EffectNode
            projectName={json.title}
            useStore={useStoreWebGL}
          ></EffectNode>
        </div> */}
      </div>
    </div>
  );
}

//
