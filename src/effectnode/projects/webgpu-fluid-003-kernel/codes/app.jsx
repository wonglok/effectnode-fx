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
  ceil,
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
import { smoothinKernel } from "../loklok/smoothKernel";

export function AppRun({ useStore, io }) {
  let hasWebGPU = useStore((r) => r.hasWebGPU);
  let files = useStore((r) => r.files);
  let renderer = useThree((r) => r.gl);
  let works = useMemo(() => [], []);

  let uiPointer0 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);
  let uiPointer1 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);

  let uiPointer2 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);

  let uiPointer3 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);

  let uiPointer4 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);

  let uiPointer5 = useMemo(() => {
    return uniform(vec3(0, 0, 0));
  }, []);

  /// particel size

  let pointSizeScale = useMemo(() => {
    return float(0.3);
  }, []);

  let ballRadius = useMemo(() => float(35), []);

  const mass = useMemo(() => float(1), []);

  const gravity = useMemo(
    () => (hasWebGPU ? float(-9.87) : float(-9.87)),
    [hasWebGPU]
  );
  // const gravityHeightFactor = useMemo(() => float(15), []);

  const side = Math.floor(Math.pow(128 * 128, 1 / 3));
  const dimensionSize = 50;
  const boundSizeMin = useMemo(() => vec3(0, 0, 0), []);
  const boundSizeMax = useMemo(
    () => vec3(dimensionSize * 2, dimensionSize * 2, dimensionSize * 4),
    []
  );

  //

  let birthOffset = useMemo(() => {
    return vec3(0, 0, dimensionSize * 1);
  }, [dimensionSize]);

  const boundSize = new Vector3()
    .copy(boundSizeMax.value)
    .sub(new Vector3().copy(boundSizeMin.value));

  let originOffset = useMemo(() => {
    return vec3(boundSizeMax.x.mul(-0.5), 0, boundSizeMax.z.mul(-0.5)).add(
      vec3(birthOffset.x, 0.0, birthOffset.z)
    );
  }, [birthOffset, boundSizeMax.x, boundSizeMax.z]);

  useFrame((st, dt) => {
    works.forEach((t) => t(st, dt));
  });

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

      const SLOT_COUNT = boundSize.x * boundSize.y * boundSize.z;

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
                let xx = (x - side / 2) * 0.5 + boundSizeMax.value.x / 2;

                let yy = y - side / 2 + dimensionSize * 2;

                let zz =
                  (z - side / 2) * 0.5 +
                  boundSizeMax.value.z / 2 -
                  dimensionSize * 0.75;

                positionBuffer.attr.setXYZ(i, xx, yy, zz);
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
        let maxX = uint(floor(boundSizeMax.x));
        let maxY = uint(floor(boundSizeMax.y));
        let maxZ = uint(floor(boundSizeMax.z));

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
        let maxX = uint(ceil(boundSizeMax.x));
        let maxY = uint(ceil(boundSizeMax.y));
        let maxZ = uint(ceil(boundSizeMax.z));

        // position.assign(max(min(position, boundSizeMax), boundSizeMin));

        let x = uint(ceil(position.x));
        let y = uint(ceil(position.y));
        let z = uint(ceil(position.z));

        // index = z + y * maxZ + x * maxY * maxZ

        let index = uint(
          z
            .add(y.mul(maxZ))
            .add(x.mul(maxY).mul(maxZ))
            .remainder(
              //
              maxX.mul(maxY.mul(maxZ))
            )
        );

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

      let calcIdle = tslFn(() => {
        //
        let position = positionBuffer.node.element(instanceIndex);
        let velocity = velocityBuffer.node.element(instanceIndex);

        /// gravity
        {
          if (hasWebGPU) {
            velocity.addAssign(
              vec3(
                0.0,
                gravity.mul(mass).mul(delta).mul(position.y.mul(1.0)),
                0.0
              )
            );
          } else {
            velocity.addAssign(
              vec3(
                //
                0.0,
                gravity.mul(mass).mul(delta).mul(0.01),
                0.0
              )
            );
          }
        }

        /// mouse
        {
          let diff = position.sub(uiPointer0.sub(originOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.01);
            velocity.addAssign(normalDiff);
          });
        }

        /// left hand
        {
          let diff = position.sub(uiPointer1.sub(originOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.01);
            velocity.addAssign(normalDiff);
          });
        }

        /// right hand
        {
          let diff = position.sub(uiPointer2.sub(originOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.01);
            velocity.addAssign(normalDiff);
          });
        }

        /// left foot
        {
          let diff = position.sub(uiPointer3.sub(originOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.01);
            velocity.addAssign(normalDiff);
          });
        }

        /// right foot
        {
          let diff = position.sub(uiPointer4.sub(originOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.01);
            velocity.addAssign(normalDiff);
          });
        }

        /// head
        {
          let diff = position.sub(uiPointer5.sub(originOffset)).negate();
          let sdf = diff.length().sub(ballRadius);

          If(sdf.lessThanEqual(float(1)), () => {
            let normalDiff = diff.normalize().mul(sdf).mul(0.01);
            velocity.addAssign(normalDiff);
          });
        }

        //
        // presure
        //
        {
          for (let z = -2; z <= 2; z += 1) {
            for (let y = -2; y <= 2; y += 1) {
              for (let x = -2; x <= 2; x += 1) {
                //
                {
                  let index = getIndexWithPosition({
                    position: vec3(
                      //
                      position.x.add(x * 2),
                      position.y.add(y * 2),
                      position.z.add(z * 2)
                    ),
                  });

                  let spaceCount = spaceSlotCounter.node.element(index);

                  let center = vec3(
                    floor(position.x.add(x * 2)).add(0.5),
                    floor(position.y.add(y * 2)).add(0.5),
                    floor(position.z.add(z * 2)).add(0.5)
                  );

                  let smoothed = smoothinKernel({
                    smoothingRadius: 7,
                    dist: position.sub(center).length(),
                  });

                  let pressureDir = position.sub(center);
                  let pressure = vec3(pressureDir)
                    .mul(spaceCount)
                    .mul(mass)
                    .mul(smoothed)
                    .mul(delta)
                    .mul(150);

                  velocity.addAssign(pressure);
                }
              }
            }
          }
        }

        // self presssure
        {
          let index = getIndexWithPosition({
            position: vec3(
              //
              position.x,
              position.y,
              position.z
            ),
          });

          let spaceCount = spaceSlotCounter.node.element(index);

          let center = vec3(
            floor(position.x).add(0.5),
            floor(position.y).add(0.5),
            floor(position.z).add(0.5)
          );

          let smoothed = smoothinKernel({
            smoothingRadius: 7,
            dist: position.sub(center).length(),
          });

          let pressureDir = position.sub(center);
          let pressure = vec3(pressureDir)
            .mul(spaceCount)
            .mul(mass)
            .mul(smoothed)
            .mul(delta)
            .mul(150);

          velocity.addAssign(pressure);
        }

        //

        position.addAssign(velocity);

        resolveCollisions({
          collisionDamping: 1,
          boundSizeMax,
          boundSizeMin,
          position,
          velocity,
          delta,
        });
      });

      let calcIdleComp = calcIdle().compute(COUNT);

      //

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
        particleMaterial.positionNode = posAttr.add(originOffset);

        const velocity = velocityBuffer.node.toAttribute();
        const size = clamp(velocity.length(), 0.0, 1.0);
        //
        //
        particleMaterial.colorNode = vec4(
          mix(vec3(0, 0, 1), vec3(0.3, 0.7, 1), float(size).mul(0.8)),
          float(1.0).sub(size.mul(0.9)).add(0.1)
        );
        particleMaterial.scaleNode = float(float(1.0).sub(size))
          .mul(3)
          .add(2)
          .mul(pointSizeScale);

        //

        particleMaterial.depthTest = true;
        particleMaterial.depthWrite = true;
        particleMaterial.transparent = true;
        // particleMaterial.alphaTest = 0.8;
        // particleMaterial.opacityNode = float(0.8).add(size.mul(0.8));

        const particles = new Mesh(new CircleGeometry(1, 15), particleMaterial);
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
    originOffset,
    uiPointer1,
    side,
    ballRadius,
    uiPointer0,
    uiPointer2,
    uiPointer3,
    uiPointer4,
    boundSize.x,
    boundSize.y,
    boundSize.z,
    birthOffset.value.x,
    birthOffset.value.y,
    birthOffset.value.z,
    uiPointer5,
    hasWebGPU,
    gravity,
    mass,
    pointSizeScale,
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
      refBox.current.position.copy(uiPointer0.value);
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
          // uiPointer1.value.copy(ev.point);
        }}
      ></Plane>

      <Plane
        scale={500}
        rotation={[Math.PI * -0.5, 0, 0]}
        visible={false}
        onPointerMove={(ev) => {
          // ev.point;
          uiPointer0.value.copy(ev.point);
          // uiPointer1.value.y += ballRadius.value / 5;
        }}
      ></Plane>

      <Avatar
        uiPointer1={uiPointer1}
        uiPointer2={uiPointer2}
        uiPointer3={uiPointer3}
        uiPointer4={uiPointer4}
        uiPointer5={uiPointer5}
        useStore={useStore}
      ></Avatar>

      {/*  */}
      {/*  */}
      {/*  */}
    </>
  );
}

function Avatar({
  useStore,
  uiPointer1,
  uiPointer2,
  uiPointer3,
  uiPointer4,
  uiPointer5,
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
            it.getWorldPosition(uiPointer1.value);
          }
        }
        if (it.isBone) {
          if (it.name === "RightHand") {
            it.getWorldPosition(uiPointer2.value);
          }
        }

        if (it.isBone) {
          if (it.name === "RightToe_End") {
            it.getWorldPosition(uiPointer3.value);
          }
        }
        if (it.isBone) {
          if (it.name === "RightToe_End") {
            it.getWorldPosition(uiPointer4.value);
          }
        }

        if (it.isBone) {
          if (it.name === "Head") {
            it.getWorldPosition(uiPointer5.value);
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
