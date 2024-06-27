import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
// import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
import tunnel from "tunnel-rat";
export function ToolBox({ ui, useStore, domElement }) {
  return (
    <>
      {/*  */}
      Toolbox
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

  io.out0(ui.speed);

  return (
    <>
      <Canvas gl={{ antialias: true }}>{<t3d.Out></t3d.Out>}</Canvas>
      {/* <span style={{ color: ui.baseColor }}>Runtime {ui.baseColor}</span> */}
    </>
  );
}

//

//

//
