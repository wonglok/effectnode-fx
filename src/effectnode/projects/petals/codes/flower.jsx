import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { Matrix4, Object3D } from "three";
import {
  CatmullRomCurve3,
  DoubleSide,
  MeshPhysicalMaterial,
  Vector3,
} from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import BezierEditor from "bezier-easing-editor";
import bezier from "bezier-easing";

export function ToolBox({ boxData, saveBoxData, useStore, ui }) {
  let files = useStore((r) => r.files);
  return (
    <>
      <BezierEditor
        defaultValue={[
          0.6895306859205776, 0.058374999999999955, 0.851985559566787, 0.338375,
        ]}
        onChange={(value) => {
          boxData.bezierCurve = value;

          saveBoxData();
        }}
      />
    </>
  );
}

export function Runtime({ boxData, ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Suspense fallback={null}>
          <FlowerExpress
            boxData={boxData}
            at={"runtime"}
            ui={ui}
            useStore={useStore}
          ></FlowerExpress>
        </Suspense>
      </Insert3D>
    </>
  );
}

function FlowerExpress({ boxData, at, ui, useStore }) {
  console.log(boxData);

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

  let texWrap = useMemo(() => {
    return tex;
  }, []);

  // let eachAngle = ui.useSet("eachAngle", 0.2);

  // console.log(at, eachAngle);

  //
  let { geo, mats } = useMemo(() => {
    let getMaterial = ({ x = 2, y = 2 }) => {
      let idX = x;
      let idY = y;

      let tex2 = {};
      for (let kn in texWrap) {
        let texture = texWrap[kn].clone();
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

        //
        ...tex2,
        side: DoubleSide,
      });
    };

    let getOneGeo = ({ eachPetal, totalPetals, eachRing, totalRings }) => {
      let progRings = eachRing / totalRings;
      let progPetla = eachPetal / totalPetals;
      let petalAngle = progPetla * 3.141592 * 2.0;

      let init = new Vector3();

      var easing = bezier(...boxData.bezierCurve);

      let cpX = (radius, angle) => radius * Math.cos((Math.PI * angle) / 180);
      let cpY = (radius, angle) => radius * Math.sin((Math.PI * angle) / 180);

      let fnc = (u, v, output = new Vector3()) => {
        let vertex = new Object3D();
        let translate = new Object3D();
        let rotate = new Object3D();
        let scale = new Object3D();

        init.set(u * 2.0 - 1.0, v * 2.0 - 1.0, 0);
        vertex.position.copy(init);

        vertex.position.z = easing(u) * 2.0 - 1.0;
        vertex.position.z *= easing(v) * 2.0 - 1.0;

        translate.rotation.y = Math.PI * -0.5;
        translate.position.z = 1;

        translate.add(vertex);
        rotate.add(translate);
        scale.add(rotate);

        rotate.rotation.y = petalAngle;

        scale.scale.setScalar(progRings);

        vertex.getWorldPosition(output);

        output.applyAxisAngle(new Vector3(0, 1, 0), progRings * Math.PI * 2.0);
      };

      let param = new ParametricGeometry(fnc, 15, 15);

      param.computeBoundingBox();

      param.translate(0, param.boundingBox.max.y / 2, 0);

      // param

      return param;
    };

    let arr = [];

    let totalRings = 6;
    for (let eachRing = 0; eachRing < totalRings; eachRing++) {
      let totalPetals = 5;

      for (let eachPetal = 0; eachPetal < totalPetals; eachPetal++) {
        //

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
            x: 0,
            y: 0,
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
  }, [boxData.bezierCurve, texWrap, ui.height, ui.width]);

  return (
    <>
      <mesh scale={5} geometry={geo} material={mats}></mesh>
    </>
  );
}
