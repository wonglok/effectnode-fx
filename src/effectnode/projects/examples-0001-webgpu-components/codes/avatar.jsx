import motionURL from "../assets/rpm/moiton/wave-dance.fbx";
import lok from "../assets/rpm/lok.glb";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { useEffect, useMemo, useState } from "react";
import { AnimationMixer } from "three";
import { useFrame } from "@react-three/fiber";
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
  //

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
      fbxLoader.loadAsync(`${motionURL}`),
    ]).then(([glb, motion]) => {
      let skinnedMesh;
      glb.scene.traverse((it) => {
        if (it.isSkinnedMesh) {
          if (!skinnedMesh) {
            skinnedMesh = it;
          }
        }
      });

      console.log(skinnedMesh);

      let action = mixer.clipAction(motion.animations[0], glb.scene);
      action.play();

      setOut(<primitive object={glb.scene}></primitive>);
    });
  }, [gl, mixer]);

  return <>{out}</>;
}
