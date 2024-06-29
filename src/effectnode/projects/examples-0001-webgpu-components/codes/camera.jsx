/** @license <MIT></MIT>
 * 
 * Copyright (c) 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
import { useEffect, useMemo } from "react";
import { PerspectiveCamera, Scene } from "three";

// import { mergeSkinnedMesh } from "../loklok/mergeSkinnedMesh.js";
// import { atan2 } from "three/examples/jsm/nodes/Nodes.js";
// import { ballify } from "../loklok/ballify.js";

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

  let service = useMemo(() => {
    return ui.provide({
      label: "service",
      type: "text",
      defaultValue: "camera",
    });
  }, [ui]);

  useEffect(() => {
    let { width, height } = domElement.getBoundingClientRect();
    let camera = new PerspectiveCamera(65, width / height, 0.1, 500);

    useStore.setState({
      camera,
    });

    //
    let onResize = () => {
      if (!domElement) {
        return;
      }
      let { width, height } = domElement.getBoundingClientRect();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [domElement, useStore]);

  //
  return <></>;
}

//
