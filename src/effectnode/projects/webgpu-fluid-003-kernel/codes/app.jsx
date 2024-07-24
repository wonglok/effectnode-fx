/** @license <MIT></MIT>
 * 
 * Copyright (c) 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  floor,
  bool,
  clamp,
} from "three/examples/jsm/nodes/Nodes";
import StorageInstancedBufferAttribute from "three/examples/jsm/renderers/common/StorageInstancedBufferAttribute";
// import { calculateDensity } from "../loklok/calculateDensity";
// import { distanceTo } from "../loklok/distanceTo";
// import { smoothinKernel } from "../loklok/smoothKernel";
import {
  Plane,
  Sphere,
  useAnimations,
  useFBX,
  useGLTF,
} from "@react-three/drei";

export function AppRun({ useStore, io }) {
  let files = useStore((r) => r.files);
  let renderer = useThree((r) => r.gl);
  let works = useMemo(() => [], []);

  let uiPointer = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);

  let bonePointer1 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);
  let bonePointer2 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);
  let bonePointer3 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);
  let bonePointer4 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);
  let bonePointer5 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);

  const side = Math.floor(Math.pow(128 * 256, 1 / 3));
  const dimension = 50;
  const boundSizeMin = useMemo(() => vec3(0, 0, 0), []);
  const boundSizeMax = useMemo(
    () => vec3(dimension * 2, dimension * 6, dimension * 2),
    []
  );
  let ballRadius = useMemo(() => float(30), []);

  let uiOffset = useMemo(() => {
    return vec3(boundSizeMax.x.div(-2), 0, boundSizeMax.z.div(-2));
  }, [boundSizeMax.x, boundSizeMax.z]);

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
      let COUNT = side * side * side;

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

      const particleSize = float(0.5);

      const mass = float(1);

      const gravity = float(-0.56);

      const SLOT_COUNT = dimension * 2 * (dimension * 6) * (dimension * 2);

      //

      const spaceSlotCounter = createBuffer({
        itemSize: 1,
        type: "float",
        count: SLOT_COUNT,
      });

      // each center = floor each coord but add 0.5

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
        let i = 0;
        let full = COUNT;

        for (let z = 0; z < side; z++) {
          //
          for (let y = 0; y < side; y++) {
            //
            for (let x = 0; x < side; x++) {
              //

              //
              if (i < full) {
                positionBuffer.attr.setXYZ(
                  i,
                  (x - side / 2) * 0.5 + boundSizeMax.value.x / 2,
                  y - side / 2 + boundSizeMax.value.x / 2,
                  (z - side / 2) * 0.5 + boundSizeMax.value.z / 2
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
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      let getXYZFromIndex = ({ index }) => {
        let idx = uint(index);
        let maxX = uint(boundSizeMax.x);
        let maxY = uint(boundSizeMax.y);
        let maxZ = uint(boundSizeMax.z);

        let x = idx.div(maxY).div(maxZ); // / maxY / maxZ;
        let y = idx.div(maxZ).remainder(maxY); // / maxZ
        let z = idx.remainder(maxZ); //

        return {
          x,
          y,
          z,
        };
      };

      let getIndexWithPosition = ({ position }) => {
        let maxX = uint(boundSizeMax.x);
        let maxY = uint(boundSizeMax.y);
        let maxZ = uint(boundSizeMax.z);

        // position.assign(max(min(position, boundSizeMax), boundSizeMin));

        let x = uint(position.x);
        let y = uint(position.y);
        let z = uint(position.z);

        // index = z + y * maxZ + x * maxY * maxZ

        let index = z.add(y.mul(maxZ)).add(x.mul(maxY).mul(maxZ));

        return index;
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      let calcSlotCounter = tslFn(() => {
        let position = positionBuffer.node.element(instanceIndex);
        If(instanceIndex.equal(uint(0)), () => {
          //
          let index = getIndexWithPosition({ position: position });
          let space = spaceSlotCounter.node.element(index);
          space.assign(0);
        });

        // particle
        {
          let index = getIndexWithPosition({ position: position });
          let space = spaceSlotCounter.node.element(index);
          space.addAssign(1);
        }
      });

      let calcSlotCounterComp = calcSlotCounter().compute(COUNT);

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      let calcResetAllSpaceSlot = tslFn(() => {
        let slot = spaceSlotCounter.node.element(instanceIndex);
        slot.assign(0);
      }, []);

      let calcResetSpaceComp = calcResetAllSpaceSlot().compute(SLOT_COUNT);

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      /*
      float sdSphere( vec3 p, float s )
      {
        return length(p)-s;
      }
        
      */
      let calcIdle = tslFn(() => {
        //
        let position = positionBuffer.node.element(instanceIndex);
        let velocity = velocityBuffer.node.element(instanceIndex);
        // let pressureForce = pressureForceBuffer.node.element(instanceIndex);

        velocity.addAssign(
          vec3(0.0, gravity.mul(mass).mul(delta).mul(position.y.mul(0.1)), 0.0)
        );

        /// hand
        {
          let diff = position.sub(uiPointer.sub(uiOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.05);
            velocity.addAssign(normalDiff);
          });
        }

        /// left hand
        {
          let diff = position.sub(bonePointer1.sub(uiOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.05);
            velocity.addAssign(normalDiff);
          });
        }
        /// right hand
        {
          let diff = position.sub(bonePointer2.sub(uiOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.05);
            velocity.addAssign(normalDiff);
          });
        }

        /// left foot
        {
          let diff = position.sub(bonePointer3.sub(uiOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.05);
            velocity.addAssign(normalDiff);
          });
        }

        /// right foot
        {
          let diff = position.sub(bonePointer4.sub(uiOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.05);
            velocity.addAssign(normalDiff);
          });
        }

        /// head
        {
          let diff = position.sub(bonePointer5.sub(uiOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.05);
            velocity.addAssign(normalDiff);
          });
        }

        //
        // presure
        //
        {
          for (let z = -2; z <= 2; z++) {
            for (let y = -2; y <= 2; y++) {
              for (let x = -2; x <= 2; x++) {
                let index = getIndexWithPosition({
                  position: vec3(
                    //
                    position.x.add(x),
                    position.y.add(y),
                    position.z.add(z)
                  ),
                });

                let spaceCount = spaceSlotCounter.node.element(index);

                let center = vec3(
                  floor(position.x.add(x)).add(0.5),
                  floor(position.y.add(y)).add(0.5),
                  floor(position.z.add(z)).add(0.5)
                );

                let diff = position
                  .sub(center)
                  .normalize()
                  .mul(spaceCount)
                  .mul(mass)
                  .mul(delta)
                  .mul(pow(1 / 2, 1.5));
                velocity.addAssign(diff);
              }
            }
          }
        }

        //

        // velocity.addAssign(pressureForce);

        position.addAssign(velocity);

        resolveCollisions({
          collisionDamping: 1,
          boundSizeMax,
          boundSizeMin,
          position,
          velocity,
          particleSize,
          delta,
        });
      });

      let calcIdleComp = calcIdle().compute(COUNT);

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      onLoop(() => {
        renderer.compute(calcIdleComp);
        renderer.compute(calcResetSpaceComp);
        renderer.compute(calcSlotCounterComp);
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      // render //
      {
        const particleMaterial = new SpriteNodeMaterial();
        let posAttr = positionBuffer.node.toAttribute();

        // display different
        particleMaterial.positionNode = posAttr.add(uiOffset);

        const velocity = velocityBuffer.node.toAttribute();
        const size = clamp(velocity.length(), 0.0, 1.0);
        //
        //
        particleMaterial.colorNode = vec4(
          mix(vec3(0, 0, 1), vec3(0.3, 0.7, 1), float(size).mul(0.8)),
          float(1.0).sub(size.mul(0.9)).add(0.1)
        );
        particleMaterial.scaleNode = float(float(1.0).sub(size)).mul(3).add(2);

        //

        particleMaterial.depthTest = true;
        particleMaterial.depthWrite = false;
        particleMaterial.transparent = true;
        // particleMaterial.alphaTest = 0.8;
        // particleMaterial.opacityNode = float(0.8).add(size.mul(0.8));

        const particles = new Mesh(
          new CircleGeometry(particleSize.value / 2, 32),
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
  }, [
    scene,
    onLoop,
    renderer,
    mounter,
    files,
    boundSizeMax,
    boundSizeMin,
    uiOffset,
    uiPointer,
    side,
    ballRadius,
  ]);

  //
  //
  useFrame(({ gl, scene, camera }) => {
    gl.renderAsync(scene, camera);
  }, 100);
  //

  let ref = useRef();
  let refBox = useRef();

  useFrame(({ camera }) => {
    if (ref) {
      ref.current.lookAt(
        camera.position.x,
        ref.current.position.y,
        camera.position.z
      );
    }
    if (refBox) {
      refBox.current.position.copy(uiPointer.value);
    }
  });
  return (
    <>
      {/*  */}
      {show}

      <Sphere scale={ballRadius.value / 5} ref={refBox}>
        <meshNormalMaterial></meshNormalMaterial>
      </Sphere>
      <Plane
        ref={ref}
        scale={500}
        visible={false}
        onPointerMove={(ev) => {
          // ev.point;
          // uiPointer.value.copy(ev.point);
        }}
      ></Plane>

      <Plane
        scale={500}
        rotation={[Math.PI * -0.5, 0, 0]}
        visible={false}
        onPointerMove={(ev) => {
          // ev.point;
          uiPointer.value.copy(ev.point);
          uiPointer.value.y += ballRadius.value / 1.5 / 2;
        }}
      ></Plane>

      <Avatar
        bonePointer1={bonePointer1}
        bonePointer2={bonePointer2}
        bonePointer3={bonePointer3}
        bonePointer4={bonePointer4}
        bonePointer5={bonePointer5}
        useStore={useStore}
      ></Avatar>

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

function Avatar({
  useStore,
  bonePointer1,
  bonePointer2,
  bonePointer3,
  bonePointer4,
  bonePointer5,
}) {
  let files = useStore((r) => r.files);
  let glb = useGLTF(files[`/rpm/lok-ready.glb`]);
  let motion = useFBX(files[`/rpm/moiton/thriller4.fbx`]);
  let anim = useAnimations(motion.animations, glb.scene);

  useFrame(() => {
    if (glb.scene) {
      glb.scene.traverse((it) => {
        //
        if (it.isBone) {
          if (it.name === "LeftHand") {
            it.getWorldPosition(bonePointer1.value);
          }
        }
        if (it.isBone) {
          if (it.name === "RightHand") {
            it.getWorldPosition(bonePointer2.value);
          }
        }

        if (it.isBone) {
          if (it.name === "RightToe_End") {
            it.getWorldPosition(bonePointer3.value);
          }
        }
        if (it.isBone) {
          if (it.name === "RightToe_End") {
            it.getWorldPosition(bonePointer4.value);
          }
        }

        if (it.isBone) {
          if (it.name === "Head") {
            it.getWorldPosition(bonePointer5.value);
          }
        }

        //
      });
    }
  });
  useEffect(() => {
    let action = anim.actions[anim.names[0]];
    action.play();
    glb.scene.scale.setScalar(30);
  }, [anim, glb.scene]);
  return (
    <>
      <primitive object={glb.scene}></primitive>
    </>
  );
}
