import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import {
  CatmullRomCurve3,
  DoubleSide,
  MeshPhysicalMaterial,
  Vector3,
} from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { useStore } from "zustand";

export function ToolBox({ useStore, ui }) {
  let files = useStore((r) => r.files);
  return (
    <>
      <Canvas>
        <Environment
          background
          files={[files[`/hdr/greenwich_park_02_1k.hdr`]]}
        ></Environment>
        <Content useStore={useStore} ui={ui}></Content>
        <OrbitControls makeDefault object-position={[0, 5, 10]}></OrbitControls>
      </Canvas>
    </>
  );
}
export const Content = ({ useStore, ui }) => {
  return (
    <Suspense fallback={null}>
      <FlowerExpress ui={ui} useStore={useStore}></FlowerExpress>
    </Suspense>
  );
};

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Suspense fallback={null}>
          <FlowerExpress ui={ui} useStore={useStore}></FlowerExpress>
        </Suspense>
      </Insert3D>
    </>
  );
}

function FlowerExpress({ ui, useStore }) {
  let files = useStore((r) => r.files) || {};
  let tex = useTexture({
    aoMap: files[ui.ao],
    map: files[ui.base],
    normalMap: files[ui.normal],
    metalnessMap: files[ui.metal],
    roughnessMap: files[ui.roughness],
    alphaMap: files[ui.opacity],
    bumpMap: files[ui.bump],
  });

  var cpX = (radius, angle) => radius * Math.cos((Math.PI * 1 * angle) / 180);
  var cpY = (radius, angle) => radius * Math.sin((Math.PI * 1 * angle) / 180);

  let curveBackbone = useMemo(() => {
    let pts = [
      //
      new Vector3(0, 0, 0),
      new Vector3(0.5, 1, 0),
      new Vector3(1.5, 2, 0),
      new Vector3(3, 3, 0),
    ];

    let curveBackbone = new CatmullRomCurve3(pts, false, "chordal");

    return curveBackbone;
  }, []);

  let curveBowl = useMemo(() => {
    let pts = [
      //
      new Vector3(0, 0, 0),
      new Vector3(0.5, 1, 0),
      new Vector3(1.5, 2, 0),
      new Vector3(3, 3, 0),
      new Vector3(1.5, 2, 0),
      new Vector3(0.5, 1, 0),
      new Vector3(0, 0, 0),
    ];

    let curveBowl = new CatmullRomCurve3(pts, false, "chordal");

    return curveBowl;
  }, []);

  let { geo, mats } = useMemo(() => {
    let getOneGeo = ({ eachPetal, totalPetals, eachRing, totalRings }) => {
      let progRings = eachRing / totalRings;

      let petalAngle = (eachPetal / totalPetals) * 3.141592 * 2.0;

      let scale = Math.pow(eachRing / totalRings, 1);

      let temp = new Vector3();
      let init = new Vector3();

      let backboneU = new Vector3();
      let backboneV = new Vector3();

      let bowlU = new Vector3();
      let bowlV = new Vector3();
      let fnc = (u, v, output) => {
        curveBackbone.getPointAt(u, backboneU);
        curveBackbone.getPointAt(v, backboneV);

        curveBowl.getPointAt(u, bowlU);
        curveBowl.getPointAt(v, bowlV);

        //

        init.set(u * 2.0 - 1.0, v * 2.0 - 1.0, 0);

        //

        temp.copy(init);

        temp.z += cpY(ui.cruvePetal, u * 180);

        let wrap = 0.7;

        temp.z += Math.sin(v * Math.PI * wrap);

        temp.multiplyScalar(scale);

        temp.applyAxisAngle(new Vector3(1, 0, 0), progRings * 0.1);

        temp.y += progRings * 0.5;

        temp.applyAxisAngle(new Vector3(1, 0, 0), progRings * 0.3);

        temp.z += -0.5 * progRings;

        temp.applyAxisAngle(new Vector3(0, 1, 0), petalAngle);

        temp.y *= 1.5;

        temp.multiplyScalar(progRings);

        temp.y -= progRings * 0.5;

        output.copy(temp);
      };

      let param = new ParametricGeometry(fnc, 25, 25);
      // param.center();
      // param.computeBoundingSphere();
      // param.translate(0, 0, radius * 3);
      // param.rotateY(petalAngle);

      return param;
    };
    let getMaterial = ({ x = 2, y = 2 }) => {
      let idX = x;
      let idY = y;

      let tex2 = {};
      for (let kn in tex) {
        let texture = tex[kn].clone();
        texture.repeat.set(1 / ui.width, 1 / ui.height);
        texture.offset.set(idX / ui.width, idY / ui.height);
        tex2[kn] = texture;
      }

      return new MeshPhysicalMaterial({
        transparent: true,
        roughness: 0.25,
        metalness: 1,
        bumpScale: 1,
        alphaTest: 0.5,
        ...tex2,
        side: DoubleSide,
      });
    };

    let arr = [];

    let totalRings = 7;
    for (let eachRing = 0; eachRing < totalRings; eachRing++) {
      let totalPetals = 3 + eachRing / 1.5;

      for (let eachPetal = 0; eachPetal < totalPetals; eachPetal++) {
        arr.push({
          //
          geo: getOneGeo({
            totalPetals,
            eachPetal,
            totalRings,
            eachRing,
          }),

          //
          material: getMaterial({
            x: (eachRing + 2) % 1,
            y: (eachPetal + 3) % 1,
          }),
        });
      }
    }

    let geo = mergeGeometries(
      arr.map((r) => r.geo),
      true
    );
    return {
      geo: geo,
      mats: arr.map((r) => r.material),
    };
  }, [curveBackbone, curveBowl, tex, ui.height, ui.radius, ui.width]);
  //
  //

  return (
    <>
      <mesh scale={5} geometry={geo} material={mats}></mesh>
    </>
  );
}
