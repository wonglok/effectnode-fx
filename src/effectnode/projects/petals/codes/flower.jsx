import { Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import {
  BackSide,
  FrontSide,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
} from "three";
import { CatmullRomCurve3, DoubleSide, Vector3 } from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter";
import BezierEditor from "bezier-easing-editor";
import bezier from "bezier-easing";

export function ToolBox({ boxData, saveBoxData, useStore, ui, io }) {
  let files = useStore((r) => r.files);

  let tt0, tt1;
  return (
    <>
      <div className="w-full h-full overflow-scroll">
        <div className="w-full">
          <button
            className=""
            onClick={() => {
              //
              useStore.getState().api.download();
            }}
          >
            Download Flower
          </button>
        </div>
        <div className="w-full h-96 p-5">
          <Canvas>
            <OrbitControls
              object-position={[0, 1, 2]}
              makeDefault
            ></OrbitControls>
            <Environment
              files={[files["/hdr/greenwich_park_02_1k.hdr"]]}
            ></Environment>

            <Content
              onReady={(api) => {
                useStore.setState({
                  api: api,
                });
              }}
              boxData={boxData}
              ui={ui}
              useStore={useStore}
              io={io}
            ></Content>
          </Canvas>
        </div>

        <div>boxData.bezierCurveU</div>
        <BezierEditor
          defaultValue={
            boxData.bezierCurveU || [
              0.6895306859205776, 0.058374999999999955, 0.851985559566787,
              0.338375,
            ]
          }
          onChange={(value) => {
            clearTimeout(tt0);
            tt0 = setTimeout(() => {
              boxData.bezierCurveU = value;
              saveBoxData();
            }, 0);
          }}
        />

        <div>boxData.bezierCurveV</div>
        <BezierEditor
          defaultValue={
            boxData.bezierCurveV || [
              0.6895306859205776, 0.058374999999999955, 0.851985559566787,
              0.338375,
            ]
          }
          onChange={(value) => {
            clearTimeout(tt0);
            tt0 = setTimeout(() => {
              boxData.bezierCurveV = value;
              saveBoxData();
            }, 0);
          }}
        />
      </div>
    </>
  );
}

export function Runtime({ boxData, ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Content
          boxData={boxData}
          ui={ui}
          useStore={useStore}
          io={io}
        ></Content>
      </Insert3D>
    </>
  );
}

function Content({ boxData, ui, useStore, io, onReady = () => {} }) {
  return (
    <Suspense fallback={null}>
      <FlowerExpress
        onReady={onReady}
        boxData={boxData}
        at={"runtime"}
        ui={ui}
        useStore={useStore}
      ></FlowerExpress>
    </Suspense>
  );
}

function FlowerExpress({ boxData, at, ui, useStore, onReady }) {
  // console.log(boxData);

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
  let { geo, mats, meshes } = useMemo(() => {
    let getMaterial = ({ x = 2, y = 2 }) => {
      let idX = x;
      let idY = y;

      let tex2 = {};
      for (let kn in texWrap) {
        let texture = texWrap[kn].clone();
        if (kn === "map") {
          texture.colorSpace = SRGBColorSpace;
        }
        texture.repeat.set(1 / ui.width, 1 / ui.height);
        texture.offset.set(idX / ui.width, idY / ui.height);
        tex2[kn] = texture;
      }

      return new MeshStandardMaterial({
        transparent: true,
        roughness: 0.25,
        metalness: 1,
        bumpScale: 1,
        alphaTest: 0.5,

        ...tex2,
        side: FrontSide,
      });
    };

    let getOneGeo = ({ eachPetal, totalPetals, eachRing, totalRings }) => {
      let progRings = eachRing / totalRings;
      let progPetla = eachPetal / totalPetals;
      let petalAngle = progPetla * 3.141592 * 2.0;

      let init = new Vector3();

      let val = [
        0.6895306859205776, 0.058374999999999955, 0.851985559566787, 0.338375,
      ];

      var easingU = bezier(...(boxData.bezierCurveU || val));
      var easingV = bezier(...(boxData.bezierCurveV || val));

      // let cpX = (radius, angle) => radius * Math.cos((Math.PI * angle) / 180);
      // let cpY = (radius, angle) => radius * Math.sin((Math.PI * angle) / 180);

      let vertex = new Object3D();
      let translate = new Object3D();
      let rotate = new Object3D();
      let scale = new Object3D();

      let fnc = (u, v, output = new Vector3()) => {
        init.set(u * 2.0 - 1.0, v * 2.0 - 1.0, 0);
        vertex.position.copy(init);

        vertex.position.z = easingU(u) * 2.0 - 1.0;
        vertex.position.z *= easingV(v) * 2.0 - 1.0;

        translate.rotation.y = Math.PI * -0.5;
        translate.position.z = 1;
        // translate.rotation.x = 0.5 * Math.PI;
        // translate.rotation.z = 0.5 * Math.PI;

        translate.add(vertex);
        rotate.add(translate);
        scale.add(rotate);

        rotate.rotation.y = petalAngle;

        scale.scale.setScalar(progRings);

        vertex.getWorldPosition(output);

        output.applyAxisAngle(new Vector3(0, 1, 0), progRings * Math.PI * 2.0);
      };

      let param = new ParametricGeometry(fnc, 25, 25);

      param.computeBoundingBox();

      param.translate(0, param.boundingBox.max.y / 2, 0);

      //

      let cloned = param.clone();

      cloned.index.array.reverse();

      // cloned.scale(1, 1, 1);
      //

      return mergeGeometries([param, cloned], false);
    };

    let arr = [];

    let totalRings = 7;
    for (let eachRing = 0; eachRing < totalRings; eachRing++) {
      let totalPetals = 7;

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
            y: eachRing % 3,
          }),
        });
      }
    }

    // let geo = mergeGeometries(
    //   arr.map((r) => r.geo),
    //   true
    // );

    // return {
    //   geo: geo,
    //   mats: arr.map((r) => r.material),
    // };

    let meshes = arr.map((item, i) => {
      return (
        <group key={"flower-" + i}>
          <primitive object={new Mesh(item.geo, item.material)}></primitive>
        </group>
      );
    });

    return {
      meshes: meshes,
    };
  }, [boxData, texWrap, ui.height, ui.width]);

  let scene = useThree((r) => r.scene);
  useEffect(() => {
    let api = {
      download: () => {
        //

        let exp = new USDZExporter();

        exp.parse(
          scene.getObjectByName("flower"),
          (resulltBuff) => {
            let b = new Blob([resulltBuff], {
              type: "vnd.usd+zip",
            });
            let url = URL.createObjectURL(b);
            let an = document.createElement("a");
            an.href = url;
            an.download = "AR-Flower.usdz";
            an.click();
          },
          (err) => {
            console.log(err);
          },
          {
            ar: { anchoring: "plane", planeAnchoring: { alignment: "any" } },
            quickLookCompatible: true,
            // includeAnchoringProperties: true,
            // maxTextureSize: 2048,
          }
        );
        // sceneTF
      },
    };
    onReady(api);
  }, [scene, onReady]);
  return (
    <>
      <group name="flower">
        {meshes}
        {/* <mesh scale={5} geometry={geo} material={mats}></mesh> */}
      </group>
    </>
  );
}
