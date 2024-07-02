// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Clock } from "three";
import { Spike } from "../modules/spikes/spikes";
import { useFrame, useThree } from "@react-three/fiber";
import { Sphere } from "../modules/sphere/sphere";
import { getCanvasCube } from "../modules/CanvasCube/CanvasCube";

export function ToolBox({ ui, io, useStore, onLoop }) {
  //

  return <>Toolbox Abc {ui.baseColor}</>;
}

export function Runtime({ ui, io, useStore, onLoop }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  // useEffect(() => {
  //   let clock = new Clock();
  //   return onLoop(() => {
  //     let dt = clock.getDelta();

  //     if (ref.current) {
  //       ref.current.rotation.y += dt * ui.speed;
  //     }
  //   });
  // }, [onLoop, ui]);

  // let [color, setColor] = useState("#ffffff");

  // useEffect(() => {
  //   io.in(0, (color) => {
  //     setColor(color);
  //   });
  // }, [ui, io]);

  return (
    <>
      <Insert3D>
        <Content ui={ui}></Content>
      </Insert3D>
    </>
  );
}

function Content({ ui }) {
  let gl = useThree((r) => r.gl);
  let [api, setDisplay] = useState({ display: null });
  let pointer = useThree((r) => r.pointer);
  useEffect(() => {
    let tCubeObj = getCanvasCube();

    ui.on("ballColor", (val) => {
      tCubeObj.tex.colorBG.set(val);
    });
    ui.on("spikeColor", (val) => {
      tCubeObj.tex.colorDot.set(val);
    });

    let spike = new Spike({
      //
      ui,
      renderer: gl,
      pointer,
      tCube: tCubeObj.tCube,
    });

    let sphere = new Sphere({
      //
      ui,
      renderer: gl,
      pointer,
      tCube: tCubeObj.tCube,
    });
    setDisplay({
      spike,
      sphere,
      tCubeObj,
      display: (
        <>
          <primitive object={sphere}></primitive>
          <primitive object={spike}></primitive>
        </>
      ),
    });
  }, [gl, pointer, ui]);

  useFrame(() => {
    if (api && api.spike) {
      api.spike.compute();
    }
    if (api && api.sphere) {
      api.sphere.compute();
    }
    if (api && api.tCubeObj) {
      api.tCubeObj.compute();
    }
  });

  return (
    <>
      {/*  */}
      {api.display}
    </>
  );
}
//

//

//
