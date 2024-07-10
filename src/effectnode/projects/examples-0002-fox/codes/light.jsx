import { Environment, useTexture } from "@react-three/drei";
import hdr from "../assets/hdr/symmetrical_garden_02_1k.hdr";
import {
  CubeCamera,
  CubeTexture,
  CubeTextureLoader,
  EquirectangularReflectionMapping,
  FloatType,
  HalfFloatType,
  LinearFilter,
  LinearMipmapLinearFilter,
  Matrix4,
  PMREMGenerator,
  RenderTarget,
  Scene,
  TextureLoader,
  WebGLCubeRenderTarget,
} from "three";
import { useLoader, useThree } from "@react-three/fiber";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Suspense, useEffect } from "react";
import {
  EnvironmentNode,
  normalGeometry,
  normalLocal,
  normalWorld,
  pmremTexture,
  reflectVector,
  texture,
  tslFn,
  uniform,
  uv,
} from "three/examples/jsm/nodes/Nodes";
import { CubeUVReflectionMapping } from "three";
export function ToolBox({}) {
  return <>toolbox</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  return (
    <>
      <Insert3D>
        <Suspense fallback={null}>
          <Load useStore={useStore}></Load>
          {/* <pointLight
            position={[0, 1.3, 5]}
            color={ui.pointLightColor}
            intensity={ui.intensity}
          ></pointLight> */}
        </Suspense>
      </Insert3D>
    </>
  );
}

function Load({ useStore }) {
  let gl = useThree((r) => r.gl);
  let scene = useThree((r) => r.scene);
  let files = useStore((r) => r.files);
  useEffect(() => {
    if (!scene) {
      return;
    }

    //src/effectnode/projects/examples-0002-fox/assets/sakura.jpg

    let rgbe = new RGBELoader();
    rgbe.setDataType(HalfFloatType);
    rgbe.loadAsync(files["/hdr/symmetrical_garden_02_1k.hdr"]).then((tex) => {
      tex.mapping = EquirectangularReflectionMapping;

      tex.generateMipmaps = true;

      let tsl = tslFn(() => {
        let color = texture(tex, normalWorld);

        return color;
      });

      scene.environmentNode = tsl();
      scene.backgroundNode = texture(tex, uv());

      //
    });

    return () => {
      //
    };
  }, [gl, scene, files]);

  return (
    <>
      {/*  */}
      {/* <Environment blur={0.15} background files={[hdr]}></Environment> */}
      {/*  */}
    </>
  );
}
