import flair from "../assets/rpm/moiton/flair.fbx";
import lok from "../assets/rpm/lok.glb";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { useEffect, useMemo, useState } from "react";
import { AnimationMixer } from "three";
import { createPortal, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Sphere } from "@react-three/drei";

//
export function ToolBox({ ui, useStore, domElement }) {
  return <>avatar</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Avatar useStore={useStore}></Avatar>
      </Insert3D>
    </>
  );
}

function Avatar({ useStore }) {
  let gl = useStore((r) => r.gl);
  let [out, setOut] = useState(null);

  let mixer = useMemo(() => new AnimationMixer(), []);
  useFrame(({ clock }) => {
    let et = clock.getElapsedTime();
    mixer.setTime(et);
  });

  useEffect(() => {
    if (!gl) {
      return;
    }

    let draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");

    let fbxLoader = new FBXLoader();
    let gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(draco);
    Promise.all([
      gltfLoader.loadAsync(`${lok}`),
      fbxLoader.loadAsync(`${flair}`),
    ]).then(([glb, motion]) => {
      let action = mixer.clipAction(motion.animations[0], glb.scene);
      action.play();

      let arr = [];
      glb.scene.traverse((it) => {
        if (it.material) {
          it.material = null;
          arr.push(
            <group key={it.uuid}>
              {createPortal(
                <MeshTransmissionMaterial
                  reflectivity={0.5}
                  transmissionSampler
                  vertexColors={false}
                  color={"#ffffff"}
                  emissive={"#000000"}
                  metalness={0.3}
                  roughness={0}
                  transmission={1}
                  thickness={1}
                ></MeshTransmissionMaterial>,
                it
              )}
            </group>
          );
        }
      });

      setOut(
        <>
          {arr}
          <primitive object={glb.scene}></primitive>
        </>
      );
    });
  }, [gl, mixer]);

  return <>{out}</>;
}
