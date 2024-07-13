import {
  OrbitControls,
  PerspectiveCamera,
  Plane,
  useTexture,
} from "@react-three/drei";
import { Suspense, useMemo } from "react";
import {
  BufferGeometry,
  CatmullRomCurve3,
  DoubleSide,
  Matrix4,
  MeshPhysicalMaterial,
  Vector3,
} from "three";
import {
  MeshPhysicalNodeMaterial,
  positionLocal,
  positionWorld,
  tslFn,
} from "three/examples/jsm/nodes/Nodes";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
export function ToolBox({}) {
  return <>Flower</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Suspense fallback={null}>
          <Loader ui={ui} useStore={useStore}></Loader>
        </Suspense>
      </Insert3D>
    </>
  );
}

function Loader({ ui, useStore }) {
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

  let mat0 = useMemo(() => {
    let idX = 0;
    let idY = 1;

    let tex2 = {};
    for (let kn in tex) {
      let texture = tex[kn].clone();
      texture.repeat.set(1 / ui.width, 1 / ui.height);
      texture.offset.set(idX / ui.width, idY / ui.height);
      tex2[kn] = texture;
    }

    return new MeshPhysicalMaterial({
      transparent: true,
      roughness: 0.5,
      metalness: 0.5,
      bumpScale: 3,
      alphaTest: 0.5,
      ...tex2,
      side: DoubleSide,
    });
  }, [tex, ui.height, ui.width]);

  //
  //
  var cpX = (radius, angle) => radius * Math.cos((Math.PI * 1 * angle) / 180);
  var cpY = (radius, angle) => radius * Math.sin((Math.PI * 1 * angle) / 180);
  let pts = [];

  let curve = new CatmullRomCurve3(pts, false, "catmullrom");

  let geo = useMemo(() => {
    let getOne = ({ angle, bao, radius, scale }) => {
      let inter = new Vector3();

      let fnc = (u, v, target) => {
        let initPlaneX = u * 2.0 - 1.0;
        let initPlaneY = v * 2.0 - 1.0;
        let initPlaneZ = 0;

        target.x = initPlaneX;
        target.y = initPlaneY;
        target.z = initPlaneZ + cpY(0.5, (initPlaneX * 0.5 + 0.5) * 180);

        inter.copy(target);
        inter.z += Math.sin((target.y * 0.5 + 0.5) * 3.141592 * bao * 1.4);

        target.copy(inter);
      };

      let param = new ParametricGeometry(fnc, 50, 50);

      param.center();
      param.rotateX(Math.PI * 0.1);
      param.computeBoundingSphere();
      param.computeBoundingBox();

      param.rotateY(0.1 * Math.PI);
      param.translate(0, 0, radius);
      param.rotateY(angle);

      param.scale(scale, scale, scale);

      return param;
    };
    let arr = [];

    let totalRings = 5;
    for (let ring = 0; ring < totalRings; ring++) {
      let bao = Math.PI * (0.3 - (0.15 * ring) / totalRings);
      let total = 3.5 + ring / totalRings;

      for (let i = 0; i < total; i++) {
        //
        arr.push(
          getOne({
            radius: ring * 0.02,
            angle: (ring / totalRings) * Math.PI + (i / total) * 3.141592 * 2.0,
            bao: bao,
            scale: Math.pow(ring / totalRings, 1),
          })
        );
      }
    }

    return mergeGeometries(arr, true);
  }, []);
  //
  //

  let mat1 = useMemo(() => {
    let gps = geo.groups;

    let getOne = ({ x = 2, y = 2 }) => {
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

    return gps.map((v, i) => {
      return getOne({
        x: 3,
        y: 2,
      });
    });
  }, [tex, ui.height, ui.width, geo]);

  return (
    <>
      <mesh scale={5} geometry={geo} material={mat1}></mesh>
    </>
  );
}
