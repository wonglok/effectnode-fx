import { Sky } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { createXRStore, XR, XROrigin } from "@react-three/xr";
import { Suspense, useEffect } from "react";
// import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
import tunnel from "tunnel-rat";
export function ToolBox({}) {
  return (
    <>
      {/*  */}
      {/*  */}
    </>
  );
}

export let xrStore = createXRStore({
  //
});

let t3d = tunnel();
let t2d = tunnel();

export function Insert3D({ children }) {
  return <t3d.In>{children}</t3d.In>;
}

export function InsertHTML({ children }) {
  return <t2d.In>{children}</t2d.In>;
}

export function Runtime({ ui, useStore, io }) {
  return (
    <>
      <Canvas gl={{ antialias: true }}>
        <XR store={xrStore}>
          <t3d.Out></t3d.Out>
        </XR>
      </Canvas>
      <t2d.Out></t2d.Out>

      {/*  */}
      <div className=" absolute bottom-3 left-[35%] w-[30%] text-center">
        <div
          onClick={() => {
            //
            xrStore.enterVR();
          }}
          className="bg-gray-600 text-white border rounded-2xl inline-block p-3 px-6"
        >
          Enter Immersive World
        </div>
      </div>
    </>
  );
}
