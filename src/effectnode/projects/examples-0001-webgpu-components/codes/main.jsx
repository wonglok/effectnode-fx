import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
// import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
import tunnel from "tunnel-rat";
export function ToolBox({ ui, useStore, domElement }) {
  return (
    <>
      Note: {ui.name}
      {/*  */}
      {/*  */}
    </>
  );
}

let t3d = tunnel();
export function Runtime({ ui, useStore, io }) {
  useEffect(() => {
    //
    useStore.setState({
      Insert3D: function Insert3D({ children }) {
        return <t3d.In>{children}</t3d.In>;
      },
    });
  }, [useStore]);

  return (
    <>
      <Canvas
        gl={(canvas) =>
          new WebGPURenderer({ canvas, antialias: true, multisampling: 4 })
        }
      >
        <RenderStuff useStore={useStore}></RenderStuff>
        <t3d.Out></t3d.Out>
      </Canvas>
    </>
  );
}

function RenderStuff({ children, useStore }) {
  //
  let get = useThree((r) => r.get);

  useEffect(() => {
    let st = get();
    for (let kn in st) {
      useStore.setState({ [kn]: st[kn] });
    }
  }, [get, useStore]);

  return <>{children}</>;
}

//
