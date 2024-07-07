import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { useEffect, useMemo, useState } from "react";
import {
  AnimationMixer,
  Object3D,
  Vector3,
  Mesh,
  CircleGeometry,
  GridHelper,
  PlaneGeometry,
  MeshBasicMaterial,
  Raycaster,
  Vector2,
  Color,
  BufferGeometry,
  SkinnedMesh,
} from "three";
import { unmountComponentAtNode, useFrame } from "@react-three/fiber";
import WebGPU from "three/addons/capabilities/WebGPU.js";
import WebGL from "three/addons/capabilities/WebGL.js";

import StorageInstancedBufferAttribute from "three/addons/renderers/common/StorageInstancedBufferAttribute.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { rand } from "../loklok/rand.js";
//

import {
  vec4,
  //
  uv,
  color,
  mix,
  range,
  pass,
  timerLocal,
  //

  //
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
  MeshBasicNodeMaterial,
} from "three/examples/jsm/nodes/Nodes.js";

import motionURL from "../assets/rpm/moiton/thriller4.fbx";
import lok from "../assets/rpm/lok.glb";
// import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function ToolBox({}) {
  return null;
}

export function Runtime({ ui, useStore, io, domElement, onLoop }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Avatar
          io={io}
          ui={ui}
          useStore={useStore}
          onLoop={onLoop}
          domElement={domElement}
        ></Avatar>
      </Insert3D>
    </>
  );
}

function Avatar({ useStore, domElement, onLoop, io, ui }) {
  let gl = useStore((r) => r.gl);
  let files = useStore((r) => r.files);
  let [out, setOut] = useState(null);

  let mixer = useMemo(() => new AnimationMixer(), []);
  useFrame(({ clock }) => {
    let et = clock.getElapsedTime();
    mixer.setTime(et);
  });
  //

  let renderer = useStore((r) => r.gl);

  useEffect(() => {
    if (!gl) {
      return;
    }

    const timestamps = document.createElement("div");
    timestamps.style.position = "absolute";
    timestamps.style.bottom = "0px";
    timestamps.style.left = "0px";
    timestamps.style.padding = "3px";
    timestamps.style.backgroundColor = "white";
    domElement.appendChild(timestamps);
    /////////
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

    let draco = new DRACOLoader();
    draco.setDecoderPath("/draco/gltf/");

    let fbxLoader = new FBXLoader();
    let fbxLoader2 = new FBXLoader();
    let gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(draco);

    let lokOrig = files["/rpm/lok-orig2.glb"];
    Promise.all([
      gltfLoader.loadAsync(`${lok}`),
      fbxLoader.loadAsync(`${motionURL}`),
      gltfLoader.loadAsync(`${lokOrig}`),
      fbxLoader2.loadAsync(`${files[`/rpm/orig-motion/quad-punch.fbx`]}`),
    ]).then(([glb, motion, glb2, motion2]) => {
      //

      //
      let skinnedMesh;

      let meshes = [];
      //
      // glb.scene.traverse((it) => {
      //   if (it.isSkinnedMesh) {
      //     if (!skinnedMesh) {
      //       skinnedMesh = it;
      //       skinnedMesh.frustumCulled = false;
      //     }
      //   }
      // });

      let action = mixer.clipAction(motion.animations[0], glb2.scene);
      action.play();

      // let action2 = mixer.clipAction(motion.animations[0], glb2.scene);
      // action2.play();

      let gp = new Object3D();
      gp.add(glb2.scene);

      // gp.add(glb2.scene);
      // setup({
      //   skinnedMesh,
      //   group: gp,
      //   domElement,
      //   renderer,
      //   onLoop,
      //   io,
      //   ui,
      // });

      glb2.scene.traverse((it) => {
        it.updateMatrixWorld(true);
        if (it.isSkinnedMesh) {
          it.geometry = it.geometry.toNonIndexed();
          // it.geometry.deleteAttribute("tangent");
          it.geometry.computeVertexNormals();
          it.geometry.computeBoundingSphere();
          it.geometry.computeBoundingBox();

          setup({
            skip: ["EyeLeft", "EyeRight", "Wolf3D_Teeth"].includes(it.name),
            skinnedMesh: it,
            group: gp,
            domElement,
            renderer,
            onLoop,
            io,
            ui,
          });
        }
      });

      setOut(<primitive object={gp}></primitive>);
    });
  }, [domElement, gl, mixer, renderer, onLoop, io, ui, files]);

  return <>{out}</>;
}

let setup = ({
  skip,
  skinnedMesh,
  group,
  domElement,
  renderer,
  onLoop,
  io,
  ui,
}) => {
  if (skip) {
    return;
  }

  const boundingBoxSize = new Vector3();
  skinnedMesh.geometry.boundingBox.getSize(boundingBoxSize);

  const particleCount = 256 * 128;

  const size = uniform(ui.size);
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

  let computeParticles = computeUpdate().compute(particleCount);

  // create nodes
  // const textureNode = texture(map, uv());

  // create particles
  const particleMaterial = new SpriteNodeMaterial();

  // const finalColor = mix(color('orange'), color('blue'), range(0, 1));
  let velNode = velocityBuffer.node.toAttribute();
  let posAttr = positionBuffer.node.toAttribute();

  let colorNode = velNode.normalize().mul(0.5).add(1).mul(1.5);

  let color3 = uniform(new Color(ui.baseColor));
  ui.on("baseColor", (value) => {
    color3.value.set(value);
  });

  // console.log(color3);

  let opacity = uniform(ui.opacity);
  particleMaterial.colorNode = vec4(
    colorNode.r.mul(color3.x), //.mul(textureNode.a), //.mul(3.33),
    colorNode.g.mul(color3.y), //.mul(textureNode.a), //.mul(3.33),
    colorNode.b.mul(color3.z), //.mul(textureNode.a), //.mul(2.33),
    opacity //textureNode.a.mul(1 / 3.33)
  );

  ui.on("opacity", (value) => {
    opacity.value = value;
  });

  particleMaterial.positionNode = posAttr;

  particleMaterial.scaleNode = size.mul(velNode.length());
  particleMaterial.opacity = 1.0; //(float(0.14).add(lifeBuffer.node.toAttribute().length().mul(-1).mul(size)))
  particleMaterial.depthTest = true;
  particleMaterial.depthWrite = false;
  particleMaterial.transparent = true;

  const particles = new Mesh(new CircleGeometry(0.05, 3), particleMaterial);
  particles.isInstancedMesh = true;
  particles.count = particleCount;
  particles.frustumCulled = false;

  group.add(particles);

  const helper = new GridHelper(100, 100, 0xff3030, 0x005555);
  group.add(helper);

  const geometry = new PlaneGeometry(1000, 1000);

  const plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
  group.add(plane);

  const raycaster = new Raycaster();
  const pointer = new Vector2();

  let stats = new Stats();
  stats.dom.style.position = "absolute";
  domElement.appendChild(stats.dom);

  renderer.compute(computeInit);

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

  onLoop(async () => {
    await renderer.computeAsync(computeParticles);
    await renderer.computeAsync(computeHit);
  });
};
