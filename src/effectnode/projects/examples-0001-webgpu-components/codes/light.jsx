import { Environment, useTexture } from "@react-three/drei";
import hdr from "../assets/hdr/symmetrical_garden_02_1k.hdr";
import { EquirectangularReflectionMapping } from "three";
import { useLoader, useThree } from "@react-three/fiber";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Suspense, useEffect } from "react";
export function ToolBox({}) {
  return <>light</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  return (
    <>
      <Insert3D>
        <Suspense fallback={null}>
          <Load></Load>
        </Suspense>
        <pointLight
          position={[0, 1.3, 5]}
          color={ui.pointLightColor}
          intensity={ui.intensity}
        ></pointLight>
      </Insert3D>
    </>
  );
}

//

//
function Load() {
  let texture = useLoader(RGBELoader, hdr);

  let scene = useThree((r) => r.scene);
  useEffect(() => {
    if (!texture) {
      return;
    }
    texture.mapping = EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
  }, [texture, scene]);
  return <>{/* <Environment blur={0.15} map={texture}></Environment> */}</>;
}

//
