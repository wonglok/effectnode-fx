import { Environment, useTexture } from "@react-three/drei";
import hdr from "../assets/hdr/symmetrical_garden_02_1k.hdr";
import {
  EquirectangularReflectionMapping,
  FloatType,
  HalfFloatType,
} from "three";
import { useLoader, useThree } from "@react-three/fiber";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Suspense, useEffect } from "react";
import { texture, uv } from "three/examples/jsm/nodes/Nodes";
export function ToolBox({}) {
  return <>toolbox</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  return (
    <>
      <Insert3D>
        <Suspense fallback={null}>
          <Load></Load>
          <pointLight
            position={[0, 1.3, 5]}
            color={ui.pointLightColor}
            intensity={ui.intensity}
          ></pointLight>
        </Suspense>
      </Insert3D>
    </>
  );
}

function Load() {
  let gl = useThree((r) => r.gl);
  let scene = useThree((r) => r.scene);
  useEffect(() => {
    let rgbe = new RGBELoader();
    rgbe.setDataType(HalfFloatType);

    rgbe.loadAsync(hdr).then((tex) => {
      tex.mapping = EquirectangularReflectionMapping;

      let imageNode = texture(tex, uv());
      scene.backgroundNode = imageNode;
      scene.environmentNode = imageNode;
    });

    return () => {};
  }, [gl, scene]);

  return (
    <>
      {/*  */}
      {/* <Environment blur={0.15} background files={[hdr]}></Environment> */}
      {/*  */}
    </>
  );
}

//
