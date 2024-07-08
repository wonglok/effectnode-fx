import { Box, Gltf, useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { CursorTrackerTail } from "src/components/CursorTrackerTail/CursorTrackerTail";
import { Mini } from "src/components/CursorTrackerTail/Mini";
import {
  Box3,
  BufferGeometry,
  Color,
  DoubleSide,
  MathUtils,
  Object3D,
  Vector3,
} from "three";

import cursorGLBURL from "./cursor.glb";
import { MeshBVH } from "three-mesh-bvh";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

export function WorldMouse({ src }) {
  //
  let glb = useGLTF(`${src}`, true);

  // let box3 = useMemo(() => {
  //   let box3 = new Box3();
  //   let v3 = new Vector3();
  //   box3.expandByObject(glb.scene);
  //   box3.getSize(v3);
  //   glb.scene.position.y = v3.y;
  //   glb.scene.updateMatrixWorld(true);
  //   return box3;
  // }, [glb]);

  let { bvh, geo } = useMemo(() => {
    let arr = [];
    glb.scene.position.y = 0;
    glb.scene.updateMatrixWorld(true);
    glb.scene.traverse((it) => {
      if (it.geometry) {
        //
        let non = it.geometry.toNonIndexed();
        it.updateMatrixWorld(true);
        non.applyMatrix4(it.matrixWorld);

        let geo = new BufferGeometry();
        geo.setAttribute("position", non.attributes.position.clone());

        // geo.setAttribute("uv", non.attributes.uv.clone());
        // geo.setAttribute("normal", non.attributes.normal.clone());
        arr.push(geo);
        //
      }
    });

    let mergedGeo = mergeGeometries(arr);
    return {
      geo: mergedGeo,
      bvh: new MeshBVH(mergedGeo),
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

    mini.onLoop(({ raycaster, scene, camera }) => {
      //
      // console.log(raycaster);
      raycaster.setFromCamera({ x: 0, y: 0 }, camera);

      let res = bvh.raycastFirst(raycaster.ray, DoubleSide);

      // console.log(res.point);

      if (res) {
        cursor.position.lerp(res.point, 1);
        cursor.lookAt(camera.position);

        let dist = res.point.distanceTo(camera.position);
        if (dist >= 10) {
          dist = 10;
        }

        let distanceLooker = scene.getObjectByName("distanceLooker");
        if (distanceLooker) {
          distanceLooker.position.z = MathUtils.lerp(
            distanceLooker.position.z,
            dist * -0.8,
            0.1
          );
        }
        // arr[0].faces[0].normal
      } else {
        let distanceLooker = scene.getObjectByName("distanceLooker");
        if (distanceLooker) {
          distanceLooker.getWorldPosition(cursor.position);
        }
      }
    });

    new CursorTrackerTail({
      mini,
      mounter: mounter,
      cursor: cursor,
      color: new Color("#ffffff"),
    });

    setMount(
      <>
        {createPortal(
          <group position={[0, 0, 0]}>
            <group name="distanceLooker">
              <Gltf src={cursorGLBURL}></Gltf>
            </group>
          </group>,
          camera
        )}

        <primitive object={cursor}></primitive>
        <primitive object={camera}></primitive>
        <primitive object={mounter}></primitive>
      </>
    );
    //
  }, [get, camera, mini, bvh]);

  return (
    <>
      {/* <Box></Box> */}
      {/*  */}
      <primitive object={glb.scene}></primitive>

      {mount}

      {/* <mesh geometry={geo}>
        <meshBasicMaterial wireframe={true}></meshBasicMaterial>
      </mesh> */}
      {/*  */}
    </>
  );
}
