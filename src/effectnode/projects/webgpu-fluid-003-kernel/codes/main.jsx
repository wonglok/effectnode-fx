/** @license <MIT></MIT>
 * 
 * Copyright (c) 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

"use strict";

import { Suspense, useEffect } from "react";

import { create } from "zustand";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import tunnel from "tunnel-rat";

export function ToolBox() {
  //
  //
  //
  return <>ToolBox</>;
}

const t3d = tunnel();
const t2d = tunnel();

export const Add3D = ({ children }) => {
  return <t3d.In>{children}</t3d.In>;
};

export const AddHTML = ({ children }) => {
  return <t2d.In>{children}</t2d.In>;
};

export let useGPU = create(() => {
  return {};
});

export function Runtime({ useStore, io, ui }) {
  return (
    <>
      {/*  */}

      <WebGPUCanvasLoader
        //
        useStore={useStore}
        io={io}
        ui={ui}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 125, 125]}
        ></PerspectiveCamera>

        <OrbitControls
          object-position={[0, 125, 125]}
          target={[0, 0, 0]}
          makeDefault
          enableRotate={!("ontouchstart" in window)}
        ></OrbitControls>

        <t3d.Out></t3d.Out>

        {/*  */}
      </WebGPUCanvasLoader>

      <t2d.Out></t2d.Out>

      {/*  */}
    </>
  );
}

function WebGPUCanvasLoader({ useStore, io, ui, children }) {
  useEffect(() => {
    async function RunWebGPU() {
      let WebGPURenderer = await import(
        "three/examples/jsm/renderers/webgpu/WebGPURenderer"
      ).then((r) => r.default);

      let Nodes = await import("three/examples/jsm/nodes/Nodes.js");

      let WebGPU = await import(
        "three/examples/jsm/capabilities/WebGPU.js"
      ).then((r) => r.default);

      let hasWebGPU = WebGPU.isAvailable();

      useStore.setState({
        hasWebGPU,
      });
      useGPU.setState({
        hasWebGPU,
        ready: false,
        Nodes,
        WebGPU,
        WebGPURenderer,
      });
    }
    RunWebGPU();
  }, [useStore]);

  let WebGPURenderer = useGPU((r) => r.WebGPURenderer);
  let Nodes = useGPU((r) => r.Nodes);
  let ready = useGPU((r) => r.ready);
  let WebGPU = useGPU((r) => r.WebGPU);

  return (
    <>
      {WebGPURenderer && WebGPU && Nodes && (
        <Canvas
          gl={(canvas) => {
            let gl = new WebGPURenderer({ canvas });

            gl.init().then(() => {
              useGPU.setState({ ready: true });
            });
            return gl;
          }}
        >
          <Suspense fallback={null}>
            {/*  */}

            {ready && children}
          </Suspense>
        </Canvas>
      )}
    </>
  );
}
