import { useEffect, useMemo, useState } from "react";
import { CENTER, MeshBVH } from "three-mesh-bvh";
import {
  Box3,
  BoxGeometry,
  Mesh,
  SphereGeometry,
  Vector3,
  MeshBasicMaterial,
  Matrix4,
  Color,
  BufferGeometry,
} from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { create } from "zustand";

export function ToolBox({}) {
  return <></>;
}

export function Runtime({ ui, useStore, io, files }) {
  const useCompute = useMemo(() => {
    return create(() => {
      return {
        io,
      };
    });
  }, [io]);

  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  let scene = useCompute((r) => r.scene);

  useEffect(() => {
    io.in(0, (scene) => {
      useCompute.setState({ scene });
    });
  }, [io, useCompute]);

  useEffect(() => {
    if (!scene) {
      return;
    }

    let mergeList = [];
    scene.position.y = 0;
    scene.updateMatrixWorld(true);
    scene.traverse((it) => {
      if (it.geometry && it.isMesh) {
        //
        let non = it.geometry.toNonIndexed();
        it.updateMatrixWorld(true);
        non.applyMatrix4(it.matrixWorld);

        let geo = new BufferGeometry();
        geo.setAttribute("position", non.attributes.position.clone());
        geo.setAttribute("normal", non.attributes.normal.clone());

        // geo.setAttribute("uv", non.attributes.uv.clone());
        mergeList.push(geo);
        //
        //
      }
      if (it.geometry && it.isInstancedMesh) {
        let n = it.count;
        for (let i = 0; i < n; i++) {
          let mesh = new Mesh(
            it.geometry.clone(),
            new MeshBasicMaterial({ color: 0xffffff, wireframe: true })
          );
          mesh.position.copy(it.position);
          mesh.scale.copy(it.scale);
          mesh.rotation.copy(it.rotation);

          it.getMatrixAt(i, m4);
          mesh.geometry.applyMatrix4(m4);

          mesh.name = it.name + "_" + i;

          mergeList.push(mesh);
        }
      }
    });

    let mergedGeo = BufferGeometryUtils.mergeGeometries(mergeList);

    let bvh = new MeshBVH(mergedGeo);

    let colliderMesh = new Mesh(
      mergedGeo,
      new MeshBasicMaterial({ wireframe: true, color: new Color("#ff0000") })
    );

    useCompute.setState({
      bvh: bvh,
      colliderMesh: colliderMesh,
    });
  }, [scene, useCompute]);

  let colliderMesh = useCompute((r) => r.colliderMesh);
  useEffect(() => {
    if (colliderMesh) {
      colliderMesh.material.color = new Color(ui.baseColor);
    }
  }, [colliderMesh, ui.baseColor]);

  let bvh = useCompute((r) => r.bvh);
  useEffect(() => {
    if (colliderMesh) {
      io.out(0, colliderMesh);
      io.out(1, bvh);
    }
  }, [colliderMesh, bvh, io]);

  return (
    <>
      <Insert3D></Insert3D>
    </>
  );
}
