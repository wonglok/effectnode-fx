/** @license <MIT></MIT>
 * 
 * Copyright (c) 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
import { useEffect, useMemo } from "react";
import { getID } from "src/effectnode/runtime/tools/getID";
import {
  Color,
  LinearSRGBColorSpace,
  PerspectiveCamera,
  SRGBColorSpace,
  Scene,
} from "three";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";

export function ToolBox({ ui, useStore, domElement }) {
  return (
    <>
      {/*  */}
      Note: {ui.service}
      {/*  */}
    </>
  );
}
//

export function Runtime({ domElement, ui, useStore, io, onLoop }) {
  //
  useEffect(() => {
    ui.provide({
      label: "service",
      type: "text",
      defaultValue: "canvas",
    });
  }, [ui]);

  useEffect(() => {
    let cleans = [];
    let setup = async ({ domElement }) => {
      domElement.innerHTML = "";
      let { width, height } = domElement.getBoundingClientRect();
      let renderer = new WebGPURenderer({
        antialias: true,
        sampleCount: 4,
        forceWebGL: true,
      });
      await renderer.init();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);

      let scene = new Scene();

      // useStore.setState({
      //   renderer: renderer,
      //   gl: renderer,
      //   scene: scene,
      // });

      scene.background = new Color().setHSL(
        0.3,
        0.5,
        Math.random() * 0.5 + 0.5
      );

      let onResize = () => {
        let { width, height } = domElement.getBoundingClientRect();
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
      };

      //
      window.addEventListener("resize", onResize);
      domElement.appendChild(renderer.domElement);

      let clean = () => {
        io.out(0, {
          renderer: null,
          gl: null,
          scene: null,
        });

        window.removeEventListener("resize", onResize);
        domElement.removeChild(renderer.domElement);
      };

      io.out(0, {
        renderer: renderer,
        gl: renderer,
        scene: scene,
      });

      cleans.push(clean);
    };

    let tt = setInterval(() => {
      if (domElement) {
        clearInterval(tt);
        setup({ domElement });
      }
    }, 0);

    return () => {
      clearInterval(tt);
      //
      cleans.forEach((tt) => tt());
    };
  }, [io, domElement, useStore]);

  //
  return <></>;
}

//
