import { useFrame, useThree } from "@react-three/fiber";
import { FastFlame } from "./FastFlame";
import { useEffect, useMemo, useState } from "react";

export function FastFlameCompo({ onAPI = () => {} }) {
  return (
    <>
      <FastFlameCode onAPI={onAPI} key={FastFlame.version}></FastFlameCode>
    </>
  );
}

function FastFlameCode({ onAPI = () => {} }) {
  let [{ display, api }, setST] = useState({ api: false, display: null });

  let { onLoop, work } = useMemo(() => {
    let tasks = [];
    let onLoop = (fnc) => {
      tasks.push(fnc);
    };
    let work = (st, dt) => {
      tasks.forEach((r) => {
        r(st, dt);
      });
    };
    return {
      onLoop,
      work,
    };
  }, []);

  let { onClean, cleanAll } = useMemo(() => {
    let cleanTasks = [];
    let onClean = (fnc) => {
      cleanTasks.push(fnc);
    };
    let cleanAll = () => {
      cleanTasks.forEach((r) => {
        r();
      });
    };
    return {
      onClean,
      cleanAll,
    };
  }, []);

  useEffect(() => {
    return () => {
      //
      cleanAll();
    };
  }, []);

  useFrame((st, dt) => {
    work(st, dt);
  });

  let gl = useThree((r) => r.gl);
  let camera = useThree((r) => r.camera);

  useEffect(() => {
    let resizeTasks = [];
    let onResize = (v) => {
      resizeTasks.push(v);
    };
    let hhResize = () => {
      resizeTasks.forEach((r) => {
        r();
      });
    };
    window.addEventListener("resize", hhResize);

    let visual = new FastFlame({
      renderer: gl,
      camera: camera,
      resX: 128,
      resY: 64,

      onLoop,
      onResize: onResize,
      onClean,
    });

    setST({
      api: visual,
      display: <primitive object={visual}></primitive>,
    });

    window.dispatchEvent(new Event("resize"));

    return () => {
      window.removeEventListener("resize", hhResize);
    };
  }, [gl, camera, onClean, onLoop]);

  useEffect(() => {
    if (!api) {
      return;
    }

    onAPI({ api: api });
  }, [api, onAPI]);

  return <>{display}</>;
}

//
