import { useEffect } from "react";
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
} from "three";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";

export function ToolBox() {
  return <>ToolBox</>;
}
export function Runtime() {
  useEffect(() => {
    let renderer = new WebGPURenderer();
    document.querySelector("#webgpu").appendChild(renderer.domElement);

    let rAFID = 0;
    let scene = new Scene();
    let camera = new PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 5;

    scene.add(
      new Mesh(new BoxGeometry(), new MeshBasicMaterial({ color: "red" }))
    );

    let rAF = () => {
      rAFID = requestAnimationFrame(rAF);
      renderer.renderAsync(scene, camera);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    renderer
      .init()
      .then(() => {
        rAFID = requestAnimationFrame(rAF);
      })
      .catch(() => {
        rAFID = requestAnimationFrame(rAF);
      });
    return () => {
      document.querySelector("#webgpu").removeChild(renderer.domElement);
    };
  }, []);
  return (
    <>
      123
      <div id="webgpu" className="w-full h-full"></div>
    </>
  );
}

let setup = ({
  skinnedMesh,
  mounter,
  domElement,
  renderer,
  onLoop,
  io,
  ui,
}) => {
  const boundingBoxSize = new Vector3();
  skinnedMesh.geometry.boundingBox.getSize(boundingBoxSize);

  const particleCount = 256 * 512;

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

  mounter.add(particles);

  const helper = new GridHelper(100, 100, 0xff3030, 0x005555);
  mounter.add(helper);

  const geometry = new PlaneGeometry(1000, 1000);

  const plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
  mounter.add(plane);

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

  onLoop(() => {
    renderer.computeAsync(computeParticles);
    renderer.computeAsync(computeHit);
  });
};
