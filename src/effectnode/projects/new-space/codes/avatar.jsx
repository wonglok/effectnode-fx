import flair from "../assets/rpm/moiton/flair.fbx";
import lok from "../assets/rpm/lok.glb";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useEffect, useState } from "react";
export function ToolBox({ ui, useStore, domElement }) {
  return <>avatar</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Avatar></Avatar>
      </Insert3D>
    </>
  );
}

function Avatar() {
  let [out, setOut] = useState(null);

  useEffect(() => {
    //
    let draco = new DRACOLoader();
    draco.setDecoderPath("/draco");

    let gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(draco);
    gltfLoader.loadAsync(`${lok}`).then((glb) => {
      setOut(<primitive object={glb.scene}></primitive>);
    });
  }, []);
  return <>{out}</>;
}
