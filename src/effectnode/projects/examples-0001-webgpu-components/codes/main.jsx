import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
// import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
import tunnel from "tunnel-rat";
export function ToolBox({}) {
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
  //

  //
  useEffect(() => {
    useStore.setState({
      Insert3D: function Insert3D({ children }) {
        return <t3d.In>{children}</t3d.In>;
      },
    });
  }, [useStore]);
  //

  //
  return (
    <>
      <Canvas
        gl={(canvas) => new WebGPURenderer({ canvas, forceWebGL: false })}
      >
        <RenderStuff useStore={useStore}>
          <t3d.Out></t3d.Out>
        </RenderStuff>
      </Canvas>
    </>
  );
}

function RenderStuff({ children, useStore }) {
  //
  let get = useThree((r) => r.get);
  let ___canShow = useStore((r) => r.___canShow);
  useEffect(() => {
    let st = get();
    for (let kn in st) {
      useStore.setState({ [kn]: st[kn] });
    }

    try {
      st.gl
        .init()
        .then(() => {
          useStore.setState({ ___canShow: true });
        })
        .catch(() => {});
    } catch (e) {
      useStore.setState({ ___canShow: true });
    }
  }, [get, useStore]);

  useFrame(({ gl, camera, scene }) => {
    gl.renderAsync(scene, camera);
  }, 100);

  return <>{___canShow && children}</>;
}

//
