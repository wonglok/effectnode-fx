/** @license <MIT></MIT>
 * 
 * Copyright (c) 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
import { useEffect, useMemo } from "react";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

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
import hdr from "../assets/hdr/symmetrical_garden_02_1k.hdr";
import { EquirectangularReflectionMapping } from "three";

export function Runtime({ domElement, ui, useStore, io, onLoop }) {
  //

  useEffect(() => {
    ui.provide({
      label: "service",
      type: "text",
      defaultValue: "hdr",
    });
  }, [ui]);

  useEffect(() => {
    let clean = () => {};

    let setup = async () => {
      //
      let rgbe = new RGBELoader();
      let { scene } = await io.request(0, {});
      let tex = await rgbe.loadAsync(`${hdr}`);
      tex.mapping = EquirectangularReflectionMapping;
      scene.background = tex;
      scene.environment = tex;
      //
    };

    setup();

    return () => {
      clean();
    };
  }, [io, onLoop]);

  //
  return <></>;
}

//
