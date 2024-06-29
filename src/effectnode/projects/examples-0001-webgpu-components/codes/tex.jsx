/** @license <MIT></MIT>
 * 
 * Copyright (c) 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
import { useEffect, useMemo } from "react";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

//
import {
  Color,
  EquirectangularReflectionMapping,
  LinearFilter,
  LinearMipMapLinearFilter,
  LoadingManager,
  Mesh,
  NoColorSpace,
  RGBAFormat,
  RepeatWrapping,
  SRGBColorSpace,
  SphereGeometry,
  Texture,
  TextureLoader,
  UnsignedByteType,
} from "three";
import {
  MeshBasicNodeMaterial,
  cameraViewMatrix,
  normalView,
  pmremTexture,
  positionViewDirection,
  uniform,
  normalWorld,
  texture,
  uv,
} from "three/examples/jsm/nodes/Nodes";

import hdr from "../assets/hdr/symmetrical_garden_02_1k.hdr";
import sakura from "../assets/sakura.jpg";
import { sRGBEncoding } from "@react-three/drei/helpers/deprecated";
export function ToolBox({ ui, useStore, domElement }) {
  return (
    <>
      {/*  */}
      Note: {ui.service}
      {/*  */}
    </>
  );
}

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
    //
    let clean = () => {};

    let setup = async () => {
      let load = new TextureLoader();
      load.loadAsync(sakura).then((tex) => {
        tex.generateMipmaps = true;
        tex.anisotropy = 16;
        tex.colorSpace = sRGBEncoding;
        tex.mapping = EquirectangularReflectionMapping;

        io.out(0, tex);
        io.out(1, tex);
        io.out(2, tex);
        io.out(3, tex);
        io.out(4, tex);

        return tex;
      });
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
