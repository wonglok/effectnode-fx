import { useCallback, useEffect, useMemo, useState } from "react";
import { Add3D, useGPU } from "../codes/main";
import { useFrame, useThree } from "@react-three/fiber";
import { CircleGeometry, Clock, GridHelper, Object3D, Vector3 } from "three";
import { Mesh } from "three";
import { resolveCollisions } from "../loklok/resolveCollisions";

import {
  uv,
  vec4,
  color,
  mix,
  range,
  pass,
  timerLocal,
  add,
  timerDelta,
  positionLocal,
  attribute,
  buffer,
  tslFn,
  uniform,
  texture,
  instanceIndex,
  float,
  vec3,
  storage,
  SpriteNodeMaterial,
  If,
  mat4,
  cos,
  sin,
  mat3,
  abs,
  sign,
} from "three/examples/jsm/nodes/Nodes";
import StorageInstancedBufferAttribute from "three/examples/jsm/renderers/common/StorageInstancedBufferAttribute";

export function AppRun({ useStore, io }) {
  let renderer = useThree((r) => r.gl);
  let works = useMemo(() => [], []);
  useFrame((st, dt) => {
    works.forEach((t) => t(st, dt));
  }, 1);

  let onLoop = useCallback(
    (v) => {
      works.push(v);
    },
    [works]
  );
  //

  let { show, mounter } = useMemo(() => {
    let mounter = new Object3D();
    return {
      mounter,
      show: <primitive object={mounter}></primitive>,
    };
  }, []);

  let scene = useThree((r) => r.scene);

  useEffect(() => {
    if (!StorageInstancedBufferAttribute) {
      return;
    }
    //
    async function runApp() {
      const particleCount = 64;

      const particleSize = float(0.05);

      const boundSizeMax = vec3(2, 5, 2);
      const boundSizeMin = vec3(-2, 0, -2);

      const createBuffer = ({ itemSize = 3, type = "vec3" }) => {
        /** @type {import('three/examples/jsm/renderers/common/StorageInstancedBufferAttribute')} */
        let attr = new StorageInstancedBufferAttribute(particleCount, itemSize);

        let node = storage(attr, type, particleCount);
        return {
          node,
          attr,
        };
      };

      let gravity = uniform(-1.5);
      let delta = uniform();
      let clock = new Clock();
      onLoop(() => {
        delta.value = clock.getDelta();
      });

      const birthPositionBuffer = createBuffer({ itemSize: 3, type: "vec3" });
      const positionBuffer = createBuffer({ itemSize: 3, type: "vec3" });
      const velocityBuffer = createBuffer({ itemSize: 3, type: "vec3" });

      {
        for (let i = 0; i < particleCount; i++) {
          let x = (Math.random() * 2.0 - 1.0) * 3.0;
          let y = (Math.random() * 2.0 - 1.0) * 3.0 + 3;
          let z = (Math.random() * 2.0 - 1.0) * 3.0;
          birthPositionBuffer.attr.setXYZ(i, x, y, z);
          birthPositionBuffer.attr.needsUpdate = true;

          positionBuffer.attr.setXYZ(i, x, y, z);
          positionBuffer.attr.needsUpdate = true;

          //
          velocityBuffer.attr.setXYZ(i, 0.0, 0.0, 0.0);
          velocityBuffer.attr.needsUpdate = true;
        }
      }

      let computeUpdate = tslFn(() => {
        //

        const position = positionBuffer.node.element(instanceIndex);
        const velocity = velocityBuffer.node.element(instanceIndex);

        velocity.addAssign(vec3(0, float(gravity).mul(delta), 0));

        position.addAssign(velocity);

        // const wind = vec3(0.01, 0.0, 0.0);
        // position.addAssign(wind);

        resolveCollisions({
          boundSizeMax,
          boundSizeMin,
          position,
          velocity,
          particleSize,
        });
        //

        //
      });

      let computeParticles = computeUpdate().compute(particleCount);

      onLoop(() => {
        renderer.computeAsync(computeParticles);
      });

      // render

      {
        const particleMaterial = new SpriteNodeMaterial();
        let posAttr = positionBuffer.node.toAttribute();
        particleMaterial.positionNode = posAttr;
        particleMaterial.colorNode = vec3(0.0, 1.0, 0.0);

        particleMaterial.depthTest = true;
        particleMaterial.depthWrite = false;
        particleMaterial.transparent = true;

        const particles = new Mesh(
          new CircleGeometry(particleSize.value, 24),
          particleMaterial
        );
        particles.isInstancedMesh = true;
        particles.count = particleCount;
        particles.frustumCulled = false;

        mounter.add(particles);

        const helper = new GridHelper(100, 100, 0xff3030, 0x005555);
        mounter.add(helper);
      }

      ///
      ///
      ///
      ///
      ///
      ///
    }
    runApp();

    return () => {
      mounter.clear();
    };
  }, [scene, onLoop, renderer, mounter]);

  //
  //
  useFrame(({ gl, scene, camera }) => {
    gl.renderAsync(scene, camera);
  }, 100);
  //

  return (
    <>
      {/*  */}
      {show}
      {/*  */}
    </>
  );
}

// export const
export function Runtime({ io, useStore }) {
  return (
    <>
      <Add3D>
        <AppRun io={io} useStore={useStore}></AppRun>
      </Add3D>
    </>
  );
}

export function ToolBox() {
  return <></>;
}
