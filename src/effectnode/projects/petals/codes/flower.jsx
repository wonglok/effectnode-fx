import {
  OrbitControls,
  PerspectiveCamera,
  Plane,
  useTexture,
} from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { DoubleSide, MeshPhysicalMaterial } from "three";
import {
  MeshPhysicalNodeMaterial,
  positionLocal,
  positionWorld,
  tslFn,
} from "three/examples/jsm/nodes/Nodes";

export function ToolBox({}) {
  return <>Flower</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Suspense fallback={null}>
          <Loader ui={ui} useStore={useStore}></Loader>
        </Suspense>
      </Insert3D>
    </>
  );
}

function Loader({ ui, useStore }) {
  let files = useStore((r) => r.files) || {};
  let tex = useTexture({
    aoMap: files[ui.ao],
    map: files[ui.base],
    normalMap: files[ui.normal],
    metalnessMap: files[ui.metal],
    roughnessMap: files[ui.roughness],
    alphaMap: files[ui.opacity],
    bumpMap: files[ui.bump],
  });

  Object.values(tex).forEach((texture) => {
    texture.repeat.set(1 / ui.width, 1 / ui.height);
    texture.offset.set(ui.x / ui.width, ui.y / ui.height);
  });

  let mat = useMemo(() => {
    return new MeshPhysicalMaterial({
      transparent: true,
      roughness: 0.5,
      metalness: 0.5,
      bumpScale: 3,

      ...tex,
      side: DoubleSide,
    });
  }, [tex]);

  let nodemat = useMemo(() => {
    return MeshPhysicalNodeMaterial.fromMaterial(mat);
  }, [mat]);

  nodemat.positionNode = positionLocal.mul(1);
  //
  //
  //
  //
  //

  return (
    <>
      <Plane scale={5} args={[1, 1, 50, 50]} material={nodemat}></Plane>
    </>
  );
}
