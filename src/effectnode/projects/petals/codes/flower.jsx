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

  //
  var cpX = (radius, angle) => radius * Math.cos((Math.PI * 1 * angle) / 180);
  var cpY = (radius, angle) => radius * Math.sin((Math.PI * 1 * angle) / 180);
  let curve = useMemo(() => {
    let pts = [
      //
      new Vector3(0, 0, 0),
      new Vector3(0.5, 1, 0),
      new Vector3(1.5, 2, 0),
      new Vector3(3, 3, 0),
    ];

    let curve = new CatmullRomCurve3(pts, false, "catmullrom");

    return curve;
  }, []);

  let { geo, mats } = useMemo(() => {
    let getOneGeo = ({ petalID, totalRings, ring }) => {
      let wrap = Math.PI * (0.3 - (0.15 * ring) / totalRings) * 0.8;
      let petalsPerRing = 5 + ring;

      let radius = ring * 0.3;
      let petalAngle =
        (ring / totalRings) * Math.PI * 2 +
        0.5 +
        (petalID / petalsPerRing) * 3.141592 * 2.0;

      let scale = Math.pow(ring / totalRings, 1);

      let temp = new Vector3();
      let init = new Vector3();

      let ptInter = new Vector3();
      let fnc = (u, v, output) => {
        init.set(u * 2.0 - 1.0, v * 2.0 - 1.0, 0);

        curve.getPointAt(v, ptInter);

        temp.copy(init);

        temp.z =
          cpY(0.5, (init.x * 0.5 + 0.5) * 180) +
          cpX(0.5, (init.y * 0.5 + 0.5) * 180);

        temp.z += Math.sin((temp.y * 0.5 + 0.5) * 3.141592 * wrap * 1.4);

        temp.z += ptInter.y;

        temp.applyAxisAngle(new Vector3(1, 0, 0).normalize(), -0.5 * v);

        // temp.z += radius;
        temp.applyAxisAngle(new Vector3(0, 1, 0), petalAngle);

        temp.multiplyScalar(scale);

        output.copy(temp);
      };

      let param = new ParametricGeometry(fnc, 50, 50);

      // param.center();
      // param.computeBoundingSphere();
      // param.translate(0, param.boundingSphere.radius * 0.5, 0);

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
    for (let ring = 0; ring < totalRings; ring++) {
      let petalsPerRing = 5 + ring;

      for (let petalID = 0; petalID < petalsPerRing; petalID++) {
        arr.push({
          geo: getOneGeo({
            petalID,
            totalRings,
            ring,
          }),
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
  }, [curve, tex, ui.height, ui.width]);
  //
  //

  return (
    <>
      <mesh scale={5} geometry={geo} material={mats}></mesh>
    </>
  );
}
