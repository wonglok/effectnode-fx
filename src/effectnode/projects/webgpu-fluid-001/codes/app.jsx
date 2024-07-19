import { useCallback, useEffect, useMemo, useState } from "react";
import { Add3D, useGPU } from "./main";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CircleGeometry,
  Clock,
  GridHelper,
  InstancedBufferGeometry,
  Object3D,
  RingGeometry,
  SphereGeometry,
  TextureLoader,
  Vector3,
} from "three";
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
  normalLocal,
  MeshPhysicalNodeMaterial,
} from "three/examples/jsm/nodes/Nodes";
import StorageInstancedBufferAttribute from "three/examples/jsm/renderers/common/StorageInstancedBufferAttribute";
import { calculateDensity } from "../loklok/calculateDensity";
import { distanceTo } from "../loklok/distanceTo";
import { smoothinKernel } from "../loklok/smoothKernel";

export function AppRun({ useStore, io }) {
  let files = useStore((r) => r.files);
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

      let COUNT = 1000;

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

      const dimension = 15;

      const boundSizeMax = vec3(dimension, dimension * 4, dimension);
      const boundSizeMin = vec3(-dimension, 0, -dimension);

      const particleSize = float(0.5);

      const smoothingRadius = float(particleSize.mul(10));

      const mass = float(1);

      const gravity = float(-0.4);

      const pressureFactor = float(3.5);

      let delta = uniform();
      let clock = new Clock();

      onLoop(() => {
        delta.value = clock.getDelta();
        if (delta.value >= 1 / 30) {
          delta.value = 1 / 30;
        }
      });

      {
        //
        let oneThird = 10;
        let i = 0;
        let full = COUNT;

        for (let z = 0.5; z <= oneThird; z++) {
          //
          for (let y = 0.5; y <= oneThird; y++) {
            //
            for (let x = 0.5; x <= oneThird; x++) {
              //

              //
              if (i < full) {
                positionBuffer.attr.setXYZ(
                  i,
                  2.5 * (x - oneThird / 2),
                  2.5 * (y - oneThird / 2) + oneThird * 2,
                  2.5 * (z - oneThird / 2)
                );
                positionBuffer.attr.needsUpdate = true;

                //
                velocityBuffer.attr.setXYZ(i, 0.0, 0.0, 0.0);
                velocityBuffer.attr.needsUpdate = true;

                i++;
              }
              //
            }

            //
          }

          //
        }
      }

      let calcReset = tslFn(() => {
        //

        // const indexII = instanceIndex.remainder(COUNT);
        // const indexJJ = instanceIndex.div(COUNT);

        // const density = densityBuffer.node.element(instanceIndex);
        const pressureForce = pressureForceBuffer.node.element(instanceIndex);
        pressureForce.mulAssign(0.5);

        // pressureForce.mulAssign(0.15);
        // pressureForce.mulAssign(0);
        // density.mulAssign(0);

        //
      });
      let calcResetComputeNode = calcReset().compute(COUNT);

      let calcRelated = tslFn(() => {
        //
        const indexII = instanceIndex.remainder(COUNT);
        const indexJJ = instanceIndex.div(COUNT);
        const index00 = instanceIndex.mul(0);

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
        //

        const force = diffDir.mul(influence).mul(pressureFactor).mul(mass);
        pressureForceII.addAssign(force);

        If(
          dist.lessThanEqual(smoothingRadius),
          () => {},
          () => {}
        );

        //
      });

      let calcRelatedComputeNode = calcRelated().compute(COUNT * COUNT);

      calcRelatedComputeNode.onObjectUpdate(() => {
        renderer.compute(calcResetComputeNode);
      });
      //

      let calcIdle = tslFn(() => {
        //
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
        renderer.compute(calcRelatedComputeNode);
        renderer.compute(calcIdleComputeNode);
      });

      // render //
      {
        // const particleMaterial = new SpriteNodeMaterial();
        const particleMaterial = new SpriteNodeMaterial();
        let posAttr = positionBuffer.node.toAttribute();
        particleMaterial.positionNode = posAttr;

        const velocity = velocityBuffer.node.toAttribute();
        const size = velocity.length().mul(5);
        //
        //
        let tex = new TextureLoader().load(files[`/sprite1.png`]);
        particleMaterial.colorNode = mix(vec3(0, 1, 0), vec3(0, 0.5, 1), size);
        particleMaterial.scaleNode = size.add(0.0);

        //

        particleMaterial.depthTest = true;
        particleMaterial.depthWrite = true;
        particleMaterial.transparent = true;
        particleMaterial.alphaTest = 0.8;
        particleMaterial.opacity = 1;

        const particles = new Mesh(
          new RingGeometry(
            particleSize.value,
            particleSize.value * 1.15,
            32,
            32
          ),
          particleMaterial
        );
        particles.isInstancedMesh = true;
        particles.count = COUNT;
        particles.frustumCulled = false;

        mounter.add(particles);

        const helper = new GridHelper(100, 100, 0xff3030, 0x005555);

        mounter.add(helper);

        //
      }
    }
    runApp();

    return () => {
      mounter.clear();
    };
  }, [scene, onLoop, renderer, mounter, files]);

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
