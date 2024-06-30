/** @license <MIT></MIT>
 * 
 * Copyright (c) 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";

import * as THREE from "three";
import {
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
} from "three/examples/jsm/nodes/Nodes.js";

import WebGPU from "three/addons/capabilities/WebGPU.js";
import WebGL from "three/addons/capabilities/WebGL.js";
import WebGPURenderer from "three/addons/renderers/webgpu/WebGPURenderer.js";
import StorageInstancedBufferAttribute from "three/addons/renderers/common/StorageInstancedBufferAttribute.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { rand } from "../loklok/rand.js";
// import PostProcessing from "three/addons/renderers/common/PostProcessing.js";
// import doveRaw from "src/effectnode/projects/development-webgpu/assets/dove-raw.glb";
// import WebGPURenderer from ;
import texURL from "../assets/sprite1.png";
import lok from "../assets/rpm/lok.glb";
import lokOrig from "../assets/rpm/lok-orig.glb";
import motionURL from "../assets/rpm/moiton/breakdance.fbx";

// import { mergeSkinnedMesh } from "../loklok/mergeSkinnedMesh.js";
// import { atan2 } from "three/examples/jsm/nodes/Nodes.js";
// import { ballify } from "../loklok/ballify.js";

export function ToolBox({ ui, useStore, domElement }) {
  return (
    <>
      {/*  */}
      Note: {ui.name}
      {/*  */}
    </>
  );
}
//

export function Runtime({ domElement, ui, useStore, io, onLoop }) {
  useEffect(() => {
    const particleCount = 512 * 512;
    const size = uniform(0.2);

    const clickPosition = uniform(new THREE.Vector3());

    let postProcessing;
    let camera, scene, renderer;
    let controls, stats;
    let computeParticles;
    let mixer, clock;
    let rAFID = 0;

    let computeHit;
    let computeNormal;

    const rotateYRaw = tslFn(([rad]) => {
      let c = cos(float(rad));
      let s = sin(float(rad));
      return mat3(c, 0.0, s.mul(-1), 0.0, 1.0, 0.0, s, 0.0, c);
    });
    rotateYRaw.setLayout({
      name: "rotateYRaw",
      type: "mat3",
      inputs: [{ name: "rad", type: "float", qualifier: "in" }],
    });

    const timestamps = document.createElement("div");
    timestamps.style.position = "absolute";
    timestamps.style.bottom = "0px";
    timestamps.style.left = "0px";
    timestamps.style.padding = "3px";
    timestamps.style.backgroundColor = "white";

    domElement.appendChild(timestamps);

    let draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");

    let fbxLoader = new FBXLoader();
    let gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(draco);

    Promise.all([
      gltfLoader.loadAsync(`${lok}`),
      fbxLoader.loadAsync(`${motionURL}`),
      gltfLoader.loadAsync(`${lokOrig}`),
    ]).then(([glb, motion, lokOrig]) => {
      // let action = mixer.clipAction(motion.animations[0], glb.scene);
      // action.play();
      //

      init({ gltf: glb, clip: motion.animations[0], orignal: lokOrig });
    });

    // new GLTFLoader().loadAsync(lok, function (gltf) {
    //   init({ gltf });
    // });

    function init({ gltf, clip }) {
      scene = new THREE.Scene();
      clock = new THREE.Clock();
      mixer = new THREE.AnimationMixer();
      mixer.clipAction(clip, gltf.scene).play();

      let lgt = new THREE.DirectionalLight(0xffffff, 5);
      scene.add(lgt);

      scene.add(gltf.scene);

      gltf.scene.updateMatrixWorld(true);

      let skinnedMesh = false;

      gltf.scene.traverse((it) => {
        if (it.geometry && it.isSkinnedMesh) {
          if (!skinnedMesh) {
            skinnedMesh = it;
          }
        }
      });

      skinnedMesh.geometry = skinnedMesh.geometry.toNonIndexed();
      skinnedMesh.updateMatrixWorld(true);
      // skinnedMesh.geometry.applyMatrix4(skinnedMesh.matrixWorld);
      skinnedMesh.geometry.deleteAttribute("tangent");
      skinnedMesh.geometry.computeVertexNormals();
      skinnedMesh.geometry.computeBoundingSphere();
      skinnedMesh.geometry.computeBoundingBox();

      const boundingBoxSize = new THREE.Vector3();
      skinnedMesh.geometry.boundingBox.getSize(boundingBoxSize);
      const light = new THREE.AmbientLight(0xffffbb, 0.1);
      scene.add(light);

      scene.background = new THREE.Color("#000000");

      // console.log(boneRoot, skinnedMesh.geometry);

      // skinnedMesh.material = new THREE.MeshBasicMaterial({
      //   transparent: true,
      //   opacity: 1,
      //   color: new THREE.Color(0xffffff),
      //   depthTest: true,
      //   depthWrite: true,
      //   wireframe: true,
      //   blending: THREE.NormalBlending,
      // });

      let hasWebGPU = WebGPU.isAvailable();
      let hasWebGL2 = WebGL.isWebGL2Available();

      if (hasWebGPU) {
        timestamps.innerText = "Running WebGPU";
      } else if (hasWebGL2) {
        timestamps.innerText = "Running WebGL2";
      } else {
        timestamps.innerText = "No WebGPU or WebGL2 support";
      }

      if (hasWebGPU === false && hasWebGL2 === false) {
        domElement.appendChild(WebGPU.getErrorMessage());
        throw new Error("No WebGPU or WebGL2 support");
      } else {
      }
      let rectCamera = domElement.getBoundingClientRect();

      camera = new THREE.PerspectiveCamera(
        50,
        rectCamera.width / rectCamera.height,
        0.1,
        1000
      );
      camera.position.set(-100, 50, 100);
      camera.position.multiplyScalar(0.04);

      // textures

      const textureLoader = new THREE.TextureLoader();
      const map = textureLoader.load(texURL);

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

          lifeBuffer.attr.setXYZ(
            i,
            Math.random(),
            Math.random(),
            Math.random()
          );
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

      const mouseV3 = new THREE.Vector3(0, 1.5, 0);
      const mouseUni = uniform(mouseV3);

      const computeUpdate = tslFn(() => {
        // const time = timerLocal();
        // const color = colorBuffer.node.element(instanceIndex);
        const position = positionBuffer.node.element(instanceIndex);
        const velocity = velocityBuffer.node.element(instanceIndex);
        const skinPosition =
          processedPositionBuffer.node.element(instanceIndex);
        // const skinNormal = processedNormalBuffer.node.element(instanceIndex);

        const dist = mouseUni.sub(position).length().mul(1);
        const normalValue = mouseUni.sub(position).normalize().mul(-0.015);

        // spinner
        // velocity.addAssign(vec3(0.0, gravity.mul(life.y), 0.0));

        // atan2
        velocity.addAssign(
          skinPosition
            .sub(position)
            .normalize()
            .mul(0.003 * 0.5)
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
        life.addAssign(rand(position.xy).mul(-0.01));

        If(
          life.y.lessThan(0.01),
          () => {
            life.xyz.assign(vec3(1.0, 1.0, 1.0));
            velocity.assign(skinPosition.sub(position).normalize().mul(0.001));
            position.assign(skinPosition.xyz);
          },
          () => {
            //
          }
        );
      });

      computeParticles = computeUpdate().compute(particleCount);

      // create nodes
      const textureNode = texture(map, uv());

      // create particles
      const particleMaterial = new SpriteNodeMaterial();

      // const finalColor = mix(color('orange'), color('blue'), range(0, 1));
      let velNode = velocityBuffer.node.toAttribute();
      let posAttr = positionBuffer.node.toAttribute();

      let colorNode = velNode.normalize().mul(0.5).add(1).mul(1.5);

      particleMaterial.colorNode = vec4(
        colorNode.r.mul(textureNode.a), //.mul(3.33),
        colorNode.g.mul(textureNode.a), //.mul(3.33),
        colorNode.b.mul(textureNode.a), //.mul(2.33),
        1 //textureNode.a.mul(1 / 3.33)
      );

      particleMaterial.positionNode = posAttr;

      particleMaterial.scaleNode = size.div(colorNode.length());
      particleMaterial.opacity = 1.0; //(float(0.14).add(lifeBuffer.node.toAttribute().length().mul(-1).mul(size)))
      particleMaterial.depthTest = true;
      particleMaterial.depthWrite = false;
      particleMaterial.transparent = true;

      const particles = new THREE.Mesh(
        new THREE.CircleGeometry(0.05, 3),
        particleMaterial
      );
      particles.isInstancedMesh = true;
      particles.count = particleCount;
      particles.frustumCulled = false;

      scene.add(particles);

      const helper = new THREE.GridHelper(100, 100, 0xff3030, 0x303030);
      scene.add(helper);

      const geometry = new THREE.PlaneGeometry(1000, 1000);

      const plane = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ visible: false })
      );
      scene.add(plane);

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      let { width, height } = domElement.getBoundingClientRect();
      renderer = new WebGPURenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      // renderer.setAnimationLoop(animate);
      domElement.appendChild(renderer.domElement);

      stats = new Stats();
      stats.dom.style.position = "absolute";
      domElement.appendChild(stats.dom);

      renderer.compute(computeInit);

      computeHit = tslFn(() => {
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

      // computeNormal = tslFn(() => {
      //   // ;
      //   const normal = processedNormalBuffer.node.element(instanceIndex);
      //   const myNormal = birthNormalBuffer.node.element(instanceIndex);

      //   const skinIndex = skinIndexNode.node.element(instanceIndex);
      //   const boneMatX = boneMatricesNode.node.element(skinIndex.x);
      //   const boneMatY = boneMatricesNode.node.element(skinIndex.y);
      //   const boneMatZ = boneMatricesNode.node.element(skinIndex.z);
      //   const boneMatW = boneMatricesNode.node.element(skinIndex.w);

      //   const skinWeight = skinWeightNode.node.element(instanceIndex);
      //   const skinnedNormal = add(
      //     boneMatX.mul(skinWeight.x).mul(myNormal),
      //     boneMatY.mul(skinWeight.y).mul(myNormal),
      //     boneMatZ.mul(skinWeight.z).mul(myNormal),
      //     boneMatW.mul(skinWeight.w).mul(myNormal)
      //   ).normalize();

      //   normal.assign(skinnedNormal);

      //   /*
      //    //normal
      //    let skinMatrix = add(
      //      skinWeight.x.mul(boneMatX),
      //      skinWeight.y.mul(boneMatY),
      //      skinWeight.z.mul(boneMatZ),
      //      skinWeight.w.mul(boneMatW)
      //    );

      //    skinMatrix = bindMatrixInverseNode.mul(skinMatrix).mul(bindMatrixNode);

      //    const skinNormal = skinMatrix.transformDirection(myNormal).xyz;

      //    // velocity.mulAssign(-0.5)
      //    // velocity.xyz.addAssign(skinNormal.mul(1.5))

      //    // velocity.y = velocity.y.add(float(gravity).mul(200))
      //    position.assign(skinPosition);

      //    */
      // })().compute(particleCount);

      function onMove(event) {
        event.preventDefault();
        // console.log(event);

        let { width, height } = renderer.domElement.getBoundingClientRect();
        pointer.set(
          (event.offsetX / width) * 2 - 1,
          -(event.offsetY / height) * 2 + 1
        );

        raycaster.setFromCamera(pointer, camera);

        plane.lookAt(camera.position);
        const intersects = raycaster.intersectObjects([plane], false);

        if (intersects.length > 0) {
          const { point } = intersects[0];

          // move to uniform

          clickPosition.value.copy(point);
          clickPosition.value.y = -1;
          mouseV3.copy(point);

          // renderer.compute(computeHit);
        }
      }

      renderer.domElement.addEventListener("mousemove", onMove, {
        passive: false,
      });

      function onTouchMove(event) {
        event.preventDefault();

        console.log(event);

        let { width, height } = domElement.getBoundingClientRect();
        pointer.set(
          (event.touches[0].clientX / width) * 2 - 1,
          -(event.touches[0].clientY / height) * 2 + 1
        );

        raycaster.setFromCamera(pointer, camera);

        plane.lookAt(camera.position);
        const intersects = raycaster.intersectObjects([plane], false);

        if (intersects.length > 0) {
          const { point } = intersects[0];

          // move to uniform

          clickPosition.value.copy(point);
          clickPosition.value.y = -1;
          mouseV3.copy(point);

          // renderer.compute(computeHit);
        }
      }

      renderer.domElement.addEventListener("touchmove", onTouchMove, {
        passive: false,
      });

      renderer.domElement.addEventListener(
        "touchstart",
        (ev) => {
          ev.preventDefault();
        },
        {
          passive: false,
        }
      );

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1.5, 0);

      if ("ontouchstart" in window) {
        controls.enableRotate = false;
      }
      controls.update();

      window.addEventListener("resize", onWindowResize);

      // gui
      const gui = new GUI();

      domElement.appendChild(gui.domElement);
      gui.domElement.style.position = "absolute";
      // gui.add(gravity, "value", -0.0098, 0, 0.0001).name("gravity");
      // gui.add(bounce, "value", 0.1, 1, 0.01).name("bounce");
      // gui.add(friction, "value", 0.96, 0.99, 0.01).name("friction");
      gui.add(size, "value", 0.02, 0.5, 0.01).name("size");

      // post-processing

      rAFID = requestAnimationFrame(animate);
    }

    function onWindowResize() {
      if (!domElement) {
        return;
      }
      let { width, height } = domElement.getBoundingClientRect();
      // const { innerWidth, innerHeight } = window;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    }

    async function animate() {
      stats.update();

      mixer.update(clock.getDelta());

      await Promise.all([
        renderer.computeAsync(computeParticles),
        renderer.computeAsync(computeHit),
        // renderer.computeAsync(computeNormal),
      ]);
      await renderer.renderAsync(scene, camera);

      //
      //
      rAFID = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(rAFID);
      domElement.innerHTML = "";
    };
  }, [domElement, onLoop, useStore]);

  //
  return <></>;
}

//
