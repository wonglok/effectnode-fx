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
  int,
  uint,
  pow,
  distance,
  min,
  max,
} from "three/examples/jsm/nodes/Nodes";
import StorageInstancedBufferAttribute from "three/examples/jsm/renderers/common/StorageInstancedBufferAttribute";
import { calculateDensity } from "../loklok/calculateDensity";
import { distanceTo } from "../loklok/distanceTo";
import { smoothinKernel } from "../loklok/smoothKernel";

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
    async function runApp() {
      const createBuffer = ({ itemSize = 3, type = "vec3", count }) => {
        let attr = new StorageInstancedBufferAttribute(count, itemSize);

        let node = storage(attr, type, count);
        return {
          node,
          attr,
        };
      };

      //

      let COUNT = 1024;

      // let h = 16;

      // let VISCOUSITY = 900 * 5;
      // let PARTICLE_MASS = 500 * 0.13;
      // let STIFFNESS = 400 * 5;
      // let GRAVITY_CONST = 120000 * 9.82;
      // let dt = 0.0004;

      // // UI
      // const START_OFFSET_X = 100;
      // const START_OFFSET_Y = 256;
      // const OFFSET_Z = 750;
      // const SQUARE_SIZE = 512;
      // const LINEWIDTH = 10;
      // const PARTICLE_RADIUS = h / 2;

      const positionBuffer = createBuffer({
        itemSize: 3,
        type: "vec3",
        count: COUNT,
      });

      const velocityBuffer = createBuffer({
        itemSize: 3,
        type: "vec3",
        count: COUNT,
      });

      const pressureForceBuffer = createBuffer({
        itemSize: 3,
        type: "vec3",
        count: COUNT,
      });

      const particleSize = float(0.1);
      const dimension = 7.5;
      const boundSizeMax = vec3(dimension, dimension * 2, dimension);
      const boundSizeMin = vec3(-dimension, 0, -dimension);
      const smoothingRadius = float(particleSize.value * 3);
      const mass = float(0.01);
      const gravity = float(-5);
      let delta = uniform();
      let clock = new Clock();

      onLoop(() => {
        delta.value = clock.getDelta();
        if (delta.value >= 1 / 60) {
          delta.value = 1 / 60;
        }
      });

      {
        for (let i = 0; i < COUNT; i++) {
          let x = (Math.random() * 2.0 - 1.0) * 3.0;
          let y = (Math.random() * 2.0 - 1.0) * 3.0 + 5.0;
          let z = (Math.random() * 2.0 - 1.0) * 3.0;

          positionBuffer.attr.setXYZ(i, x, y, z);
          positionBuffer.attr.needsUpdate = true;

          //
          velocityBuffer.attr.setXYZ(i, 0.0, 1.0, 0.0);
          velocityBuffer.attr.needsUpdate = true;
        }
      }

      let calcReset = tslFn(() => {
        //

        // const indexII = instanceIndex.remainder(COUNT);
        // const indexJJ = instanceIndex.div(COUNT);

        // const density = densityBuffer.node.element(instanceIndex);
        const pressureForce = pressureForceBuffer.node.element(instanceIndex);

        pressureForce.mulAssign(0);
        // density.mulAssign(0);

        //
      });
      let calcResetComputeNode = calcReset().compute(COUNT);

      let calcRelated = tslFn(() => {
        //
        const indexII = instanceIndex.remainder(COUNT);
        const indexJJ = instanceIndex.div(COUNT);

        const pressureForceII = pressureForceBuffer.node.element(indexII);
        const positionII = positionBuffer.node.element(indexII);
        const positionJJ = positionBuffer.node.element(indexJJ);

        const dist = distanceTo(positionII, positionJJ);

        const diffDir = vec3(positionII).sub(positionJJ);

        // const direction = vec3(diffDir).normalize();

        const influence = smoothinKernel({
          smoothingRadius: smoothingRadius,
          dist,
        });

        If(
          dist.lessThanEqual(smoothingRadius),
          () => {
            const force = diffDir.mul(influence).mul(mass);
            pressureForceII.addAssign(force);
          },
          () => {
            pressureForceII.mulAssign(0);
          }
        );

        //
        //
        //
      });

      let calcRelatedComputeNode = calcRelated().compute(COUNT * COUNT);

      let calcIdle = tslFn(() => {
        let position = positionBuffer.node.element(instanceIndex);
        let velocity = velocityBuffer.node.element(instanceIndex);
        let pressureForce = pressureForceBuffer.node.element(instanceIndex);

        velocity.addAssign(vec3(0.0, gravity.mul(mass).mul(delta), 0.0));

        velocity.addAssign(pressureForce);

        position.addAssign(velocity);

        //

        resolveCollisions({
          collisionDamping: 1,
          boundSizeMax,
          boundSizeMin,
          position,
          velocity,
          particleSize,
          delta,
        });

        //

        //
      });

      let calcIdleComputeNode = calcIdle().compute(COUNT);

      onLoop(() => {
        renderer.compute(calcResetComputeNode);
        renderer.compute(calcRelatedComputeNode);
        renderer.compute(calcIdleComputeNode);
      });

      // render //
      {
        const particleMaterial = new SpriteNodeMaterial();
        let posAttr = positionBuffer.node.toAttribute();
        particleMaterial.positionNode = posAttr;
        particleMaterial.colorNode = vec4(0.0, 1.0, 1.0, 1.0);

        particleMaterial.depthTest = true;
        particleMaterial.depthWrite = false;
        particleMaterial.transparent = true;

        const particles = new Mesh(
          new CircleGeometry(particleSize.value * 2, 12),
          particleMaterial
        );
        particles.isInstancedMesh = true;
        particles.count = COUNT;
        particles.frustumCulled = false;

        mounter.add(particles);

        const helper = new GridHelper(100, 100, 0xff3030, 0x005555);
        mounter.add(helper);
      }
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
