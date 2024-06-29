/** @license <MIT></MIT>
 * 
 * Copyright (c) 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  Clock,
  Color,
  Group,
  Mesh,
  Scene,
  SphereGeometry,
} from "three";
import {
  MeshStandardNodeMaterial,
  color,
  uniform,
  uv,
} from "three/examples/jsm/nodes/Nodes";

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
      defaultValue: "box",
    });
  }, [ui]);
  let group = useMemo(() => {
    return new Group();
  }, []);

  useEffect(() => {
    let cleans = [];
    let setup = async () => {
      let geo = new SphereGeometry(1, 32, 32);
      let mat = new MeshStandardNodeMaterial({ color: "#000000" });
      mat.roughness = 0.5;
      mat.metalness = 1.0;

      let box = new Mesh(geo, mat);

      let clock = new Clock();

      onLoop(() => {
        let dt = clock.getDelta();
        box.rotation.y += dt;
      });
      group.clear();
      group.add(box);

      io.in(0, ({ scene }) => {
        scene.add(group);
      });

      mat.colorNode = uniform(new Color());
      ui.on("baseColor", (val) => {
        mat.colorNode.value.set(val);
      });

      cleans.push(() => {
        box.removeFromParent();
      });

      //
    };
    setup();

    return () => {
      cleans.forEach((r) => r());
    };
  }, [io, ui, onLoop, group]);

  //
  return <></>;
}

//
