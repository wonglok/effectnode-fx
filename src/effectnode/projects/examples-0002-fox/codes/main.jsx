import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
//
import WebGPUBackend from "three/examples/jsm/renderers/webgpu/WebGPUBackend";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
// import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
import tunnel from "tunnel-rat";

export function ToolBox({}) {
  return (
    <>
      {/*  */}
      Note Yo
      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io }) {
  let t3d = useMemo(() => tunnel(), []);
  //

  useEffect(() => {
    useStore.setState({
      Insert3D: function Insert3D({ children }) {
        return <t3d.In>{children}</t3d.In>;
      },
    });

    return () => {};
  }, [useStore]);

  return (
    <>
      <Canvas
        gl={(canvas) => {
          let renderer = new WebGPURenderer({ canvas });
          return renderer;
        }}
      >
        <Render>{<t3d.Out></t3d.Out>}</Render>
      </Canvas>
    </>
  );
}

function Render({ children }) {
  //
  useFrame(({ gl, scene, camera }) => {
    gl.renderAsync(scene, camera);
  }, 100);

  return (
    <>
      {/*  */}
      {children}
      {/*  */}
    </>
  );
}
