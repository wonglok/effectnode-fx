/** @license <MIT></MIT>
 * 
 * Copyright (c) 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
import { useEffect, useMemo } from "react";

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
      defaultValue: "postproc",
    });
  }, [ui]);

  useEffect(() => {
    //

    let yo = {};
    io.in(0, ({ renderer }) => {
      yo.renderer = renderer;
    });
    io.in(1, ({ camera }) => {
      yo.camera = camera;
    });
    io.in(2, (scene) => {
      yo.scene = scene;
    });

    let run = true;

    let rAFID = 0;
    let render = async () => {
      rAFID = requestAnimationFrame(render);
      let { renderer, camera, scene } = yo;

      if (renderer && camera && scene && run) {
        try {
          renderer.render(scene, camera);
        } catch (e) {
          console.log(e);
        }
      }
    };
    rAFID = requestAnimationFrame(render);

    return () => {
      run = false;

      cancelAnimationFrame(rAFID);
    };
  }, [io]);

  //
  return <></>;
}

//
