import { Canvas, useThree } from "@react-three/fiber";
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

let t3d = tunnel();
let t2d = tunnel();
export function Runtime({ useStore, ui, io }) {
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
        <color attach={"background"} args={["#000000"]}></color>
        <State3D useStore={useStore}></State3D>
        <OutH3D useStore={useStore}></OutH3D>
      </Canvas>
      <OutHTML useStore={useStore}></OutHTML>
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

//
function State3D({ useStore }) {
  let get = useThree((r) => r.get);

  useEffect(() => {
    let st = get();
    for (let kn in st) {
      if (kn === "get") {
        continue;
      }
      useStore.setState({ [kn]: st[kn] });
    }

    useStore.setState({ ___ready: true });
  }, [get, useStore]);

  return null;
}
