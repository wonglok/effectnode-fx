import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
// import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";

export function ToolBox({ ui, useStore, domElement }) {
  return (
    <>
      Note: {ui.name}
      {/*  */}
      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io }) {
  useEffect(() => {
    //
    useStore.setState({});
  }, [useStore]);

  return <></>;
}

//
