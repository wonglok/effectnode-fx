import { Box, Image, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { createRef, useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Clock, Vector2, Vector3 } from "three";
import { DragGesture, Gesture } from "@use-gesture/vanilla";

import chung001 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_32357164197_o.jpg";
import chung002 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_32357164497_o.jpg";
import chung003 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_32357164597_o.jpg";
import chung004 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_32357164677_o.jpg";
import chung005 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_32357164737_o.jpg";
import chung006 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_32357165007_o.jpg";
import chung007 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_32357165237_o.jpg";
import chung008 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575706904_o.jpg";
import chung009 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575707624_o.jpg";
import chung010 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575707754_o.jpg";
import chung011 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575707964_o.jpg";
import chung012 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575708084_o.jpg";
import chung013 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575708254_o.jpg";
import chung014 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575708444_o.jpg";
import chung015 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575708594_o.jpg";
import chung016 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575708724_o.jpg";
import chung017 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575708804_o.jpg";
import chung018 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709034_o.jpg";
import chung019 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709124_o.jpg";
import chung020 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709224_o.jpg";
import chung021 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709314_o.jpg";
import chung022 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709424_o.jpg";
import chung023 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709494_o.jpg";
import chung024 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709594_o.jpg";
import chung025 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709664_o.jpg";
import chung026 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709764_o.jpg";
import chung027 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709874_o.jpg";
import chung028 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575709954_o.jpg";
import chung029 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575710044_o.jpg";
import chung030 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575710184_o.jpg";
import chung031 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_46575710594_o.jpg";
import chung032 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_47298826101_o.jpg";
import chung033 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_47298827011_o.jpg";
import chung034 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_47298827121_o.jpg";
import chung035 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_47298827201_o.jpg";
import chung036 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_47298827301_o.jpg";
import chung037 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_47298827481_o.jpg";
import chung038 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_47298827541_o.jpg";
import chung039 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_47298827631_o.jpg";
import chung040 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_47298827781_o.jpg";
import chung041 from "../assets/ahchung/high-resolution-1080px-x-1920px-smartphone-wallpaper_47298827851_o.jpg";
import md5 from "md5";

let chungs = [
  chung001,
  chung002,
  chung003,
  chung004,
  chung005,
  chung006,
  chung007,
  chung008,
  chung009,
  chung010,
  chung011,
  chung012,
  chung013,
  chung014,
  chung015,
  chung016,
  chung017,
  chung018,
  chung019,
  chung020,
  chung021,
  chung022,
  chung023,
  chung024,
  chung025,
  chung026,
  chung027,
  chung028,
  chung029,
  chung030,
  chung031,
  chung032,
  chung033,
  chung034,
  chung035,
  chung036,
  chung037,
  chung038,
  chung039,
  chung040,
  chung041,
];

export function FlowGallery({}) {
  let list = useMemo(() => {
    return chungs.map((url, idx) => {
      let r = {};
      r._id = `_${md5(url)}`;
      r.url = `${url}`;
      r.idx = idx;
      r.e = idx / chungs.length;
      r.n = chungs.length;
      return r;
    });
  }, []);

  let closed = false;

  let ptsPos = useMemo(
    () =>
      [
        [-20, 0, 0],
        [0, 0, 0],
        [20, 0, 0],
      ].map((r) => new Vector3().fromArray(r)),
    []
  );

  let ptsRot = useMemo(
    () =>
      [
        [0, 20, 0],
        [0, 0, 0],
        [0, -20, 0],
      ].map((r) => new Vector3().fromArray(r)),
    []
  );

  let ptsScale = useMemo(
    () =>
      [
        [0.0, 0.0, 0.0],
        [1, 1, 1],
        [0.0, 0.0, 0.0],
      ].map((r) => new Vector3().fromArray(r)),
    []
  );

  let curvePos = useMemo(
    () => new CatmullRomCurve3(ptsPos, closed, "chordal"),
    [closed, ptsPos]
  );
  let curveScale = useMemo(
    () => new CatmullRomCurve3(ptsScale, closed, "chordal"),
    [closed, ptsScale]
  );
  let curveRot = useMemo(
    () => new CatmullRomCurve3(ptsRot, closed, "chordal"),
    [closed, ptsRot]
  );

  let refScroll = createRef(0);

  let floatDelta = useMemo(() => new Vector2(), []);
  let floatAcc = useMemo(() => new Vector2(), []);

  useFrame((st, dt) => {
    if (dt >= 1000 / 60) {
      dt = 1000 / 60;
    }
    floatAcc.x += floatDelta.x * dt;
    floatAcc.y += floatDelta.y * dt;

    floatDelta.multiplyScalar(0.976);
  });

  let gl = useThree(({ gl }) => gl);
  useEffect(() => {
    let clock = new Clock();
    let hh = (event) => {
      let dt = clock.getDelta();
      if (dt >= 1000 / 60) {
        dt = 1000 / 60;
      }
      floatDelta.y += (event.deltaY / -2) * dt;
      floatDelta.x += (event.deltaX / -2) * dt;
    };

    window.addEventListener("wheel", hh);
    let ges = new DragGesture(
      gl.domElement,
      (state) => {
        const {
          event, // the source event
          xy, // [x,y] values (pointer position or scroll offset)
          initial, // xy value when the gesture started
          intentional, // is the gesture intentional
          delta, // movement delta (movement - previous movement)
          offset, // offset since the first gesture
          lastOffset, // offset when the last gesture started
          movement, // displacement between offset and lastOffset
          velocity, // momentum of the gesture per axis (in px/ms)
          distance, // offset distance per axis
          direction, // direction per axis
          overflow, // whether the offset is overflowing bounds (per axis)
          startTime, // gesture start time (ms)
          timeDelta, // Time delta (ms) with the previous event
          elapsedTime, // gesture elapsed time (ms)
          timeStamp, // timestamp of the event
          type, // event type
          target, // event target
          currentTarget, // event currentTarget
          first, // true when it's the first event
          last, // true when it's the last event
          active, // true when the gesture is active
          memo, // value returned by your handler on its previous run
          cancel, // function you can call to interrupt some gestures
          canceled, // whether the gesture was canceled (drag and pinch)
          down, // true when a mouse button or touch is down
          buttons, // number of buttons pressed
          touches, // number of fingers touching the screen
          args, // arguments you passed to bind (React only)
          ctrlKey, // true when control key is pressed
          altKey, // "      "  alt     "      "
          shiftKey, // "      "  shift   "      "
          metaKey, // "      "  meta    "      "
          locked, // whether document.pointerLockElement is set
          dragging, // is the component currently being dragged
          moving, // "              "              "  moved
          scrolling, // "              "              "  scrolled
          wheeling, // "              "              "  wheeled
          pinching, // "              "              "  pinched
        } = state;

        floatDelta.x += delta[0] / 50 / 1.8;
        floatDelta.y += delta[1] / 50 / 1.8;
      },
      {
        eventOptions: { passive: false },
        preventDefault: false,
      }
    );
    gl.domElement.style.touchAction = "none";

    return () => {
      ges.destroy();
      window.removeEventListener("wheel", hh);
    };
  }, [floatDelta, floatAcc, gl.domElement]);

  // console.log(list);

  return (
    <group>
      {list.map((each) => {
        return (
          <OneItem
            key={each._id}
            refScroll={refScroll}
            curveScale={curveScale}
            each={each}
            curvePos={curvePos}
            floatAcc={floatAcc}
            curveRot={curveRot}
          ></OneItem>
        );
      })}
    </group>
  );
}

function OneItem({ floatAcc, each, curveScale, curveRot, curvePos }) {
  let ref = useRef();
  let v3 = useMemo(() => new Vector3(), []);
  let acc = 0;
  useFrame((st, dt) => {
    acc += dt / 600;
    let idx = each.idx;
    let num = each.n;
    let progress = (floatAcc.y + floatAcc.x + idx / num) % 1;
    if (progress <= 0) {
      floatAcc.y += 1.01;
    }
    if (progress <= 0) {
      floatAcc.x += 1.01;
    }
    progress = (floatAcc.y + floatAcc.x + idx / num + acc) % 1;
    try {
      curvePos.getPoint(progress, ref.current.position);
      curveRot.getPoint(progress, v3);
      ref.current.rotation.set(v3.x, v3.y, v3.z);

      curveScale.getPoint(progress, ref.current.scale);
    } catch (e) {
      console.log(e);
    }

    // curvePos.getPoint(progress, ref.current.position);
  });

  let tex = useTexture(each.url);

  return (
    <group>
      <group ref={ref}>
        <mesh>
          <planeGeometry
            args={[1, 1 / (tex.image.width / tex.image.height), 1]}
          ></planeGeometry>
          <meshStandardMaterial
            emissive={"#ffffff"}
            emissiveMap={tex}
          ></meshStandardMaterial>
        </mesh>
      </group>
    </group>
  );
}
