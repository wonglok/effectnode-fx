"use strict";

import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  AnimationMixer,
  BoxGeometry,
  CircleGeometry,
  Clock,
  Color,
  GridHelper,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NoBlending,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
} from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { create } from "zustand";
import { Camera } from "@mediapipe/camera_utils";

/** @license <MIT></MIT>
 * 
 * Copyright (c) 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

// import Stats from "three/examples/jsm/libs/stats.module.js";
import { rand } from "../loklok/rand";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

async function postProcessAPI({ files }) {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  const poseLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: files["/task/face_landmarker.task"],
    },
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: false,
    runningMode: "IMAGE",
  });

  return poseLandmarker;
}

export function ToolBox() {
  return <>ToolBox</>;
}

export function Runtime({ useStore, io, ui }) {
  return (
    <>
      {/*  */}

      <WebGPUCanvas>
        <AppRun useStore={useStore} ui={ui} io={io}></AppRun>

        <PerspectiveCamera
          makeDefault
          position={[0, 1.65, 1]}
        ></PerspectiveCamera>
        <OrbitControls target={[0, 1.75, 0]} makeDefault></OrbitControls>
      </WebGPUCanvas>

      <div
        className=" absolute top-12 bg-white p-2 rounded-xl"
        style={{
          left: `calc(50% - 60% / 2)`,
          width: "60%",
          textAlign: "center",
        }}
      >
        Please Allow Camera and Open Your Mouth to Trigger Animation
      </div>

      {/*  */}
    </>
  );
}

function WebGPUCanvas({ children }) {
  let useGPU = useMemo(() => {
    return create(() => {
      return {};
    });
  }, []);

  useEffect(() => {
    async function RunWebGPU() {
      let WebGPURenderer = await import(
        "three/examples/jsm/renderers/webgpu/WebGPURenderer"
      ).then((r) => r.default);

      useGPU.setState({
        WebGPURenderer,
      });
    }
    RunWebGPU();
  }, [useGPU]);

  let WebGPURenderer = useGPU((r) => r.WebGPURenderer);

  return (
    <>
      {WebGPURenderer && (
        <Canvas
          gl={(canvas) => {
            return new WebGPURenderer({ canvas });
          }}
        >
          {children}
        </Canvas>
      )}
    </>
  );
}

function makeRotationAPI({ glb, onLoop }) {
  //

  let faceBlendshapesCache = false;
  onLoop(() => {
    let faceBlendshapes = faceBlendshapesCache;
    if (faceBlendshapes) {
      glb.scene.traverse((it) => {
        if (it.morphTargetDictionary) {
          // console.log(faceBlendshapes.categories);
          Object.entries(it.morphTargetDictionary).map(
            ([keyName, keyIndex]) => {
              let result = faceBlendshapes.categories.find(
                (cat) => cat.categoryName === keyName
              );

              if (result) {
                it.morphTargetInfluences[keyIndex] = MathUtils.lerp(
                  it.morphTargetInfluences[keyIndex],
                  result.score,
                  0.1
                );
              }
              // it.morphTargetInfluences[val] =
              // console.log(key, val);
            }
          );
          // faceBlendshapes.categories.forEach()
          // console.log(it.morphTargetDictionary, faceBlendshapes.categories);
        }
        // console.log(it.morphTargetDictionary);
      });
    }
  });

  let getFace = (keyName) => {
    //
    if (!faceBlendshapesCache) {
      return 0;
    } else {
      let result = faceBlendshapesCache.categories.find(
        (cat) => cat.categoryName === keyName
      );
      if (!result) {
        console.log(
          faceBlendshapesCache.categories.map(
            (r) => `${r.categoryName}--${r.score}`
          )
        );
        return 0;
      }

      return Number(result?.score || 0);
    }

    //
    //
    // faceBlendshapesCache
    //
  };

  let onProcess = async ({ faceBlendshapes }) => {
    //
    // console.log(faceBlendshapes);

    faceBlendshapesCache = faceBlendshapes;
    //
  };
  return {
    getFace,
    onProcess,
  };
}

function AppRun({ useStore, io, ui }) {
  //
  // AppRun
  //

  let mounter = useMemo(() => {
    return new Group();
  }, []);

  let show = useMemo(() => {
    return <primitive object={mounter}></primitive>;
  }, [mounter]);

  let clock = useMemo(() => {
    return new Clock();
  }, []);
  let mixer = useMemo(() => {
    return new AnimationMixer(mounter);
  }, [mounter]);
  let works = useRef([]);

  useFrame(() => {
    let t = clock.getElapsedTime();
    mixer.setTime(t);

    works.current.forEach((t) => {
      return t();
    });
  });

  let files = useStore((r) => r.files);
  let gl = useThree((r) => r.gl);
  let controls = useThree((r) => r.controls);

  useEffect(() => {
    if (!controls) {
      return;
    }
    let draco = new DRACOLoader();
    draco.setDecoderPath(`/draco/`);

    let gltf = new GLTFLoader();
    gltf.setDRACOLoader(draco);

    let fbx = new FBXLoader();
    works.current = [];

    let onLoop = (t) => {
      works.current.push(t);
    };

    let stop = () => {};
    gltf
      .loadAsync(files["/rpm/lok-ready.glb"])
      .then(async (glb) => {
        //

        let faceAPI = await postProcessAPI({
          files,
        });
        let webcamAPI = await makeRotationAPI({
          onLoop,
          glb,
        });

        let video = document.createElement("video");
        video.playsInline = true;
        video.muted = true;
        video.autoplay = true;

        let canRun = true;
        const camera = new Camera(video, {
          facingMode: "user",
          onFrame: async () => {
            if (!canRun) {
              return;
            }
            let res = faceAPI.detectForVideo(
              video,
              window.performance.now(),
              {}
            );

            let faceBlendshapes = res.faceBlendshapes[0];
            if (faceBlendshapes) {
              canRun = false;
              webcamAPI.onProcess({
                faceBlendshapes,
              });
            }
          },
          width: 640,
          height: 320,
        });

        onLoop(() => {
          canRun = true;
        });

        // await faceAPI.applyOptions({
        //   runningMode: "VIDEO",
        // });
        await faceAPI.setOptions({
          runningMode: "VIDEO",
        });

        await camera.start();
        stop = () => {
          video.pause();
          camera.stop();
          faceAPI.close();
          canRun = false;
        };
        //

        // await faceAPI.setOptions({
        //   runningMode: "VIDEO",
        // });

        let motion = await fbx
          .loadAsync(files["/rpm/moiton/wave2.fbx"])
          .then((r) => r.animations[0]);

        mixer.clipAction(motion, glb.scene).play();

        mounter.add(glb.scene);

        let wHead = new Vector3();
        onLoop(() => {
          //
          // controls.target
          //

          glb.scene.getObjectByName("Head").getWorldPosition(wHead);
          controls.target.lerp(wHead, 0.1);
        });
        //
        glb.scene.traverse((it) => {
          if (it.geometry) {
            it.geometry = it.geometry.toNonIndexed();
          }

          if (
            it.isSkinnedMesh &&
            !it.name.includes("Teeth") &&
            it.name !== "EyeLeft" &&
            it.name !== "EyeRight" &&
            it.name !== "WolfTeeth"
          ) {
            let skinnedMesh = it;
            skinnedMesh.updateMatrixWorld(true);
            skinnedMesh.geometry.deleteAttribute("tangent");
            skinnedMesh.geometry.computeVertexNormals();
            skinnedMesh.geometry.computeBoundingSphere();
            skinnedMesh.geometry.computeBoundingBox();

            setup({
              webcamAPI: webcamAPI,
              skinnedMesh: skinnedMesh,
              mounter: mounter,
              renderer: gl,
              onLoop: onLoop,
              io: io,
              ui: ui,
            }).catch((r) => {
              console.log(r);
            });
          }
        });
      })
      //
      //
      //
      .catch((r) => {
        console.log(r);
      });

    //

    return () => {
      stop();
      mounter.clear();
      mounter.removeFromParent();
    };
  }, [controls, files, gl, io, mixer, mounter, ui]);

  useFrame(({ gl, camera, scene }) => {
    //
    //
    gl.renderAsync(scene, camera);
    //
    //
  }, 100);
  return <>{show}</>;
}

let setup = async ({
  webcamAPI,
  skinnedMesh,
  mounter,
  renderer,
  onLoop,
  io,
  ui,
}) => {
  let {
    uv,
    vec4,
    color,
    mix,
    range,
    pass,
    timerLocal,
    add,
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
  } = await import("three/examples/jsm/nodes/Nodes.js");

  let StorageInstancedBufferAttribute = await import(
    "three/addons/renderers/common/StorageInstancedBufferAttribute.js"
  ).then((r) => r.default);

  //   import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
  //   import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  //   import { GUI } from "three/addons/libs/lil-gui.module.min.js";

  const boundingBoxSize = new Vector3();
  skinnedMesh.geometry.boundingBox.getSize(boundingBoxSize);

  const particleCount = 512 * 512;

  const size = uniform(1);
  ui.on("size", (num) => {
    if (typeof num === "number") {
      size.value = num;
    }
  });

  const createBuffer = ({ itemSize = 3, type = "vec3" }) => {
    let attr = new StorageInstancedBufferAttribute(particleCount, itemSize);
    let node = storage(attr, type, particleCount);
    return {
      node,
      attr,
    };
  };

  const positionBuffer = createBuffer({ itemSize: 3, type: "vec3" });
  const velocityBuffer = createBuffer({ itemSize: 3, type: "vec3" });
  const colorBuffer = createBuffer({ itemSize: 3, type: "vec3" });
  const lifeBuffer = createBuffer({ itemSize: 3, type: "vec3" });

  const birthPositionBuffer = createBuffer({ itemSize: 3, type: "vec3" });
  const birthNormalBuffer = createBuffer({ itemSize: 3, type: "vec3" });

  const bindMatrixNode = uniform(skinnedMesh.bindMatrix, "mat4");
  // const bindMatrixInverseNode = uniform(
  //   skinnedMesh.bindMatrixInverse,
  //   "mat4"
  // );
  const boneMatricesNode = {
    node: buffer(
      skinnedMesh.skeleton.boneMatrices,
      "mat4",
      skinnedMesh.skeleton.bones.length
    ),
  };

  const skinIndexNode = createBuffer({ itemSize: 4, type: "vec4" });
  const skinWeightNode = createBuffer({ itemSize: 4, type: "vec4" });
  const processedPositionBuffer = createBuffer({
    itemSize: 3,
    type: "vec3",
  });

  // const processedNormalBuffer = createBuffer({
  //   itemSize: 3,
  //   type: "vec3",
  // });

  let geo = skinnedMesh.geometry;
  let localCount = geo.attributes.position.count;

  {
    for (let i = 0; i < particleCount; i++) {
      let yo = i % localCount;

      let x =
        geo.attributes.position.getX(yo) +
        (Math.random() * 2 - 1.0) * 2.0 * boundingBoxSize.x * 0.01;
      let y =
        geo.attributes.position.getY(yo) +
        (Math.random() * 2 - 1.0) * 2.0 * boundingBoxSize.y * 0.01;
      let z =
        geo.attributes.position.getZ(yo) +
        (Math.random() * 2 - 1.0) * 2.0 * boundingBoxSize.z * 0.01;
      birthPositionBuffer.attr.setXYZ(i, x, y, z);
      birthPositionBuffer.attr.needsUpdate = true;
    }
  }
  {
    for (let i = 0; i < particleCount; i++) {
      let yo = i % localCount;

      let x = geo.attributes.normal.getX(yo);
      let y = geo.attributes.normal.getY(yo);
      let z = geo.attributes.normal.getZ(yo);

      birthNormalBuffer.attr.setXYZ(i, x, y, z);
      birthNormalBuffer.attr.needsUpdate = true;
    }
  }
  {
    for (let i = 0; i < particleCount; i++) {
      let yo = i % localCount;

      lifeBuffer.attr.setXYZ(i, Math.random(), Math.random(), Math.random());
      lifeBuffer.attr.needsUpdate = true;
    }
  }
  {
    for (let i = 0; i < particleCount; i++) {
      let yo = i % localCount;

      let x = geo.attributes.skinIndex.getX(yo);
      let y = geo.attributes.skinIndex.getY(yo);
      let z = geo.attributes.skinIndex.getZ(yo);
      let w = geo.attributes.skinIndex.getW(yo);
      skinIndexNode.attr.setXYZ(i, x, y, z, w);
      skinIndexNode.attr.needsUpdate = true;
    }
  }

  {
    for (let i = 0; i < particleCount; i++) {
      let yo = i % localCount;

      let x = geo.attributes.skinWeight.getX(yo);
      let y = geo.attributes.skinWeight.getY(yo);
      let z = geo.attributes.skinWeight.getZ(yo);
      let w = geo.attributes.skinWeight.getW(yo);
      skinWeightNode.attr.setXYZ(i, x, y, z, w);
      skinWeightNode.attr.needsUpdate = true;
    }
  }

  // compute
  const computeInit = tslFn(() => {
    const position = positionBuffer.node.element(instanceIndex);
    const birth = birthPositionBuffer.node.element(instanceIndex);
    const color = colorBuffer.node.element(instanceIndex);

    const randX = instanceIndex.hash();
    const randY = instanceIndex.add(2).hash();
    const randZ = instanceIndex.add(3).hash();

    position.x.assign(birth.x);
    position.y.assign(birth.y);
    position.z.assign(birth.z);

    color.assign(vec3(randX, randY, randZ));
  })().compute(particleCount);

  const mouseV3 = new Vector3(0, 1.5, 0);
  const mouseUni = uniform(mouseV3);

  const computeUpdate = tslFn(() => {
    // const time = timerLocal();
    // const color = colorBuffer.node.element(instanceIndex);
    const position = positionBuffer.node.element(instanceIndex);
    const velocity = velocityBuffer.node.element(instanceIndex);
    const skinPosition = processedPositionBuffer.node.element(instanceIndex);
    // const skinNormal = processedNormalBuffer.node.element(instanceIndex);

    const dist = mouseUni.sub(position).length().mul(1);
    const normalValue = mouseUni.sub(position).normalize().mul(0.0);

    // spinner

    // atan2
    velocity.addAssign(
      skinPosition
        .sub(position)
        .normalize()
        .mul(0.003 * 0.5 * 2.5)
    );

    let addVel = velocity.add(normalValue);

    position.addAssign(addVel);

    // velocity.mulAssign(friction);

    // floor
    // position.addAssign(birth)
    // position.y.addAssign(15)

    // If(velocity.xz.length().lessThan(0.01), () => {
    // 	position.assign(birth)
    // })

    const life = lifeBuffer.node.element(instanceIndex);
    life.addAssign(rand(position.xy).mul(-0.02));

    If(
      life.y.lessThan(0.01),
      () => {
        life.xyz.assign(vec3(1.0, 1.0, 1.0));
        velocity.assign(skinPosition.sub(position).normalize().mul(-0.009));
        position.assign(skinPosition.xyz);
      },
      () => {
        //
      }
    );
  });

  let computeParticles = computeUpdate().compute(particleCount);

  // create nodes
  // const textureNode = texture(map, uv());

  // create particles
  const particleMaterial = new SpriteNodeMaterial();

  // const finalColor = mix(color('orange'), color('blue'), range(0, 1));
  let velNode = velocityBuffer.node.toAttribute();
  let posAttr = positionBuffer.node.toAttribute();

  let colorNode = velNode.normalize().mul(0.5).add(0.5).mul(1.25);

  let color3 = uniform(new Color(ui.baseColor || "#ff0000"));
  ui.on("baseColor", (value) => {
    color3.value.set(value);
  });

  let opacity = uniform(1.0); // .add(0.025)
  onLoop(() => {
    let jawOpen = webcamAPI.getFace("jawOpen") * 1.5;
    opacity.value = MathUtils.lerp(opacity.value, 1 + jawOpen * 5, 0.1);
    skinnedMesh.material.opacity = 1.0 - jawOpen * 1.5;
    skinnedMesh.material.transparent = true;
  });
  let fader = opacity.mul(velNode.length()).mul(4);
  particleMaterial.colorNode = vec4(
    colorNode.r, //.mul(color3.x), //.mul(textureNode.a), //.mul(3.33),
    colorNode.g, //.mul(color3.y), //.mul(textureNode.a), //.mul(3.33),
    colorNode.b, //.mul(color3.z), //.mul(textureNode.a), //.mul(2.33),
    fader //textureNode.a.mul(1 / 3.33)
  );

  // ui.on("opacity", (value) => {
  //   opacity.value = value;
  // });

  particleMaterial.positionNode = posAttr;

  particleMaterial.scaleNode = fader.mul(1 / 4);
  particleMaterial.opacity = 1.0; //(float(0.14).add(lifeBuffer.node.toAttribute().length().mul(-1).mul(size)))
  particleMaterial.depthTest = true;
  particleMaterial.depthWrite = false;
  particleMaterial.transparent = true;

  const particles = new Mesh(new CircleGeometry(0.05, 13), particleMaterial);
  particles.isInstancedMesh = true;
  particles.count = particleCount;
  particles.frustumCulled = false;

  mounter.add(particles);

  const helper = new GridHelper(100, 100, 0xff3030, 0x005555);
  mounter.add(helper);

  const geometry = new PlaneGeometry(1000, 1000);

  const plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
  mounter.add(plane);

  // const raycaster = new Raycaster();
  // const pointer = new Vector2();

  // let stats = new Stats();
  // stats.dom.style.position = "absolute";

  renderer.computeAsync(computeInit);

  let computeHit = tslFn(() => {
    // const birth = birthPositionBuffer.node.element(instanceIndex);
    const position = processedPositionBuffer.node.element(instanceIndex);
    // const velocity = velocityBuffer.node.element(instanceIndex);
    // const color = colorBuffer.node.element(instanceIndex);
    // const dist = position.distance(clickPosition);
    // const direction = position.sub(clickPosition).normalize();
    // const distArea = float(6).sub(dist).max(0);

    // const power = distArea.mul(.01);
    // const relativePower = power.mul(instanceIndex.hash().mul(.5).add(.5));

    // velocity.addAssign(direction.mul(relativePower));

    const birth = birthPositionBuffer.node.element(instanceIndex);

    const skinIndex = skinIndexNode.node.element(instanceIndex);
    const boneMatX = boneMatricesNode.node.element(skinIndex.x);
    const boneMatY = boneMatricesNode.node.element(skinIndex.y);
    const boneMatZ = boneMatricesNode.node.element(skinIndex.z);
    const boneMatW = boneMatricesNode.node.element(skinIndex.w);

    const skinVertex = bindMatrixNode.mul(birth);

    const skinWeight = skinWeightNode.node.element(instanceIndex);
    const skinned = add(
      boneMatX.mul(skinWeight.x).mul(skinVertex),
      boneMatY.mul(skinWeight.y).mul(skinVertex),
      boneMatZ.mul(skinWeight.z).mul(skinVertex),
      boneMatW.mul(skinWeight.w).mul(skinVertex)
    );
    position.assign(skinned);

    // const skinPosition = bindMatrixInverseNode.mul(skinned).xyz;
    //   .xyz.mul((1 / 100 / 10) * 2.5);

    // velocity.assign(skinPosition.sub(position).normalize().mul(0.1));
  })().compute(particleCount);

  onLoop(() => {
    renderer.computeAsync(computeParticles);
    renderer.computeAsync(computeHit);
  });
};
