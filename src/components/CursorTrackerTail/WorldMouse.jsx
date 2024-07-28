import { Box, Gltf, Sphere, Text, useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CursorTrackerTail } from "src/components/CursorTrackerTail/CursorTrackerTail";
import { Mini } from "src/components/CursorTrackerTail/Mini";
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from "three";

import { MeshBVH } from "three-mesh-bvh";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import cursorGLBURL from "./cursor.glb";
export function WorldMouse({ src, useStore }) {
  //
  let glb = useGLTF(`${src}`);
  // let mouse = useGLTF(`${cursorGLBURL}`);
  // let box3 = useMemo(() => {
  //   let box3 = new Box3();
  //   let v3 = new Vector3();
  //   box3.expandByObject(glb.scene);
  //   box3.getSize(v3);
  //   glb.scene.position.y = v3.y;
  //   glb.scene.updateMatrixWorld(true);
  //   return box3;
  // }, [glb]);

  let { bvh, geo, infoMap } = useMemo(() => {
    let arr = [];
    glb.scene.position.y = 0;
    glb.scene.updateMatrixWorld(true);
    let infoMap = new Map();
    let idx = 0;
    glb.scene.traverse((it) => {
      if (it.geometry) {
        //
        let non = it.geometry.toNonIndexed();
        it.updateMatrixWorld(true);
        non.applyMatrix4(it.matrixWorld);

        let geo = new BufferGeometry();
        geo.setAttribute("position", non.attributes.position.clone());
        let data = [];
        for (let i = 0; i < non.attributes.position.count; i++) {
          data.push(idx);
        }
        let cloned = new BufferAttribute(new Float32Array(data), 1);
        geo.setAttribute("meshMap", cloned);

        infoMap.set(idx, it); // it = mesh

        // console.log(cloned.array[0], it.name);

        // geo.setAttribute("uv", non.attributes.uv.clone());
        // geo.setAttribute("normal", non.attributes.normal.clone());
        arr.push(geo);
        idx++;
      }
    });

    let mergedGeo = mergeGeometries(arr);
    return {
      geo: mergedGeo,
      bvh: new MeshBVH(mergedGeo),
      infoMap,
    };
  }, [glb]);

  let mini = useMemo(() => {
    return new Mini({});
  }, []);
  let get = useThree((r) => r.get);

  useFrame((st, dt) => {
    mini.work(st, dt);
  });

  let camera = useThree((r) => r.camera);

  let [mount, setMount] = useState(null);

  //files["/church/old_church_modeling_-_interior_scene.glb"]

  useEffect(() => {
    //
    let st = get();

    for (let key in st) {
      mini.set(key, st[key]);
    }

    let mounter = new Object3D();
    let cursor = new Object3D();

    let sphere = new Mesh(
      new SphereGeometry(32, 32, 32),
      new MeshBasicMaterial({
        //
        side: DoubleSide,
        //
        visible: false,
      })
    );

    mini.onLoop(({ raycaster, scene, camera }) => {
      //
      // console.log(raycaster);
      raycaster.setFromCamera({ x: 0, y: 0.15 }, camera);

      let res = bvh.raycastFirst(raycaster.ray, DoubleSide);

      // console.log(res.point);

      if (res) {
        //
        //
        let hoverName = infoMap.get(
          bvh.geometry.attributes.meshMap.array[res.face.a]
        )?.name;

        // console.log(hoverName);

        if (useStore.getState().bannerText !== hoverName) {
          useStore.setState({
            bannerText: hoverName,
          });
          // window.dispatchEvent(new CustomEvent("hover", { detail: "hover" }));
        }

        cursor.position.lerp(res.point, 1);
        cursor.lookAt(camera.position);

        //
        // let dist = res.point.distanceTo(camera.position);
        // if (dist >= 10) {
        //   dist = 10;
        // }
        //
        // let distanceLooker = scene.getObjectByName("distanceLooker");
        // if (distanceLooker) {
        //   distanceLooker.position.z = MathUtils.lerp(
        //     distanceLooker.position.z,
        //     dist * -0.8,
        //     0.1
        //   );
        // }
        //
      } else {
        let list = raycaster.intersectObject(sphere, false);

        if (list) {
          let res = list[0];
          if (res) {
            cursor.position.lerp(res.point, 1);
            cursor.lookAt(camera.position);
          }
        }

        // let distanceLooker = scene.getObjectByName("distanceLooker");
        // if (distanceLooker) {
        //   distanceLooker.getWorldPosition(cursor.position);
        // }
      }

      window.dispatchEvent(
        new CustomEvent("pointerWorld", { detail: cursor.position.toArray() })
      );
    });

    new CursorTrackerTail({
      mini,
      mounter: mounter,
      cursor: cursor,
      color: new Color("#ffffff"),
    });

    setMount(
      <>
        {/* {createPortal()} */}

        {createPortal(<primitive object={sphere}></primitive>, camera)}

        <primitive object={cursor}></primitive>
        <primitive object={camera}></primitive>
        <primitive object={mounter}></primitive>
      </>
    );
    //
  }, [get, camera, mini, bvh, infoMap, useStore]);

  return (
    <>
      {/* <Box></Box> */}
      {/*  */}

      {glb && <primitive object={glb.scene}></primitive>}

      {createPortal(
        <group position={[0, 0, -1]}>
          {/* <group name="distanceLooker">
              <Gltf src={cursorGLBURL}></Gltf>
            </group> */}
          <Suspense fallback={null}>
            <ShowInfo useStore={useStore}></ShowInfo>
          </Suspense>
        </group>,
        camera
      )}

      {mount}

      {/* {mouse && (
        <group scale={100}>
          <primitive object={mouse.scene}></primitive>
        </group>
      )} */}

      {/* <mesh geometry={geo}>
        <meshBasicMaterial wireframe={true}></meshBasicMaterial>
      </mesh> */}
      {/*  */}
    </>
  );
}

//
function ShowInfo({ useStore }) {
  let bannerText = useStore((r) => r.bannerText);
  return (
    <>
      <Text
        textAlign="text"
        anchorX={"left"}
        anchorY={"bottom-baseline"}
        scale={0.04}
        position={[0.025, 0.02, 0]}
        color={"#000000"}
        outlineColor={"#ffffff"}
        outlineWidth={0.05}
      >
        {(bannerText || "").toUpperCase()}
      </Text>

      <Gltf scale={0.15} position={[0, 0.075, 0]} src={cursorGLBURL}></Gltf>
    </>
  );
}
