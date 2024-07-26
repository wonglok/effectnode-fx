import { Canvas, useThree } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { useEffect } from "react";
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

let xrStore = createXRStore({
  //
  //
});
let t3d = tunnel();
let t2d = tunnel();
export function Runtime({ ui, useStore, io }) {
  //
  useEffect(() => {
    useStore.setState({
      Insert3D: function Insert3D({ children }) {
        return <t3d.In>{children}</t3d.In>;
      },
    });
    useStore.setState({
      InsertHTML: function InsertHTML({ children }) {
        return <t2d.In>{children}</t2d.In>;
      },
    });
  }, [useStore]);

  return (
    <>
      <Canvas gl={{ antialias: true }}>
        <XR store={xrStore}>
          <State3D useStore={useStore}></State3D>
          <OutH3D useStore={useStore}></OutH3D>
        </XR>
        {/*  */}
        {/* <color attach={"background"} args={["#ffffff"]}></color> */}
        {/*  */}
      </Canvas>
      <OutHTML useStore={useStore}></OutHTML>
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

function OutHTML({ useStore }) {
  let ___ready = useStore((r) => r.___ready);

  return <>{___ready && <t2d.Out></t2d.Out>}</>;
}

function OutH3D({ useStore }) {
  let ___ready = useStore((r) => r.___ready);

  return <>{___ready && <t3d.Out></t3d.Out>}</>;
}

function State3D({ useStore }) {
  let get = useThree((r) => r.get);

  useEffect(() => {
    let st = get();
    for (let kn in st) {
      useStore.setState({ [kn]: st[kn] });
    }

    useStore.setState({ ___ready: true });
  }, [get, useStore]);

  return null;
}
