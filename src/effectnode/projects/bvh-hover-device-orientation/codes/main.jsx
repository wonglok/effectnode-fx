import { Canvas, useThree } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import { useEffect } from "react";
import {
  DetectDeviceOrientation,
  Orientation,
} from "detect-device-orientation";

// import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
import tunnel from "tunnel-rat";
export function ToolBox({}) {
  return (
    <>
      {/*  */}
      {/*  */}
    </>
  );
}

const xrStore = createXRStore({
  //
  //
});
const t3d = tunnel();
const t2d = tunnel();
const detectDeviceOrientation = new DetectDeviceOrientation();

export function Insert3D({ children }) {
  return <t3d.In>{children}</t3d.In>;
}
export function InsertHTML({ children }) {
  return <t2d.In>{children}</t2d.In>;
}

export function Runtime({ ui, useStore, io }) {
  return (
    <>
      <Canvas gl={{ antialias: true }}>
        <XR store={xrStore}>
          {/* <State3D useStore={useStore}></State3D>
          <OutH3D useStore={useStore}></OutH3D> */}
          <t3d.Out></t3d.Out>
        </XR>
        {/*  */}
        {/* <color attach={"background"} args={["#ffffff"]}></color> */}
        {/*  */}
      </Canvas>

      <t2d.Out></t2d.Out>

      {/*  */}
      <div className=" absolute bottom-3 left-[10%] w-[80%] text-center">
        <div
          onClick={() => {
            //
            // xrStore.enterVR();

            detectDeviceOrientation.init((orientation0) => {
              /** @type {Orientation} */
              let orientation = orientation0;
              console.log(`absolute: ${orientation.absolute}`);
              // [Output] absolute: true

              console.log(`alpha: ${orientation.absolute}`);
              // [Output] alpha: 0

              console.log(`beta: ${orientation.beta}`);
              // [Output] beta: 0

              console.log(`gamma: ${orientation.gamma}`);
              // [Output] gamma: 0

              console.log(
                `webkitCompassHeading: ${orientation.webkitCompassHeading}`
              );
              // [Output] webkitCompassHeading: 0

              console.log(
                `webkitCompassAccuracy: ${orientation.webkitCompassAccuracy}`
              );

              useStore.setState({
                orientation,
                debugString: JSON.stringify(orientation),
              });
              // [Output] webkitCompassHeading: 0
            });

            detectDeviceOrientation.requestDeviceOrientationPermission();
          }}
          className="bg-green-600 text-white border rounded-2xl inline-block p-3 px-6"
        >
          Enter Device Orientation
          {/* <Dispaly useStore={useStore}></Dispaly> */}
        </div>
      </div>
    </>
  );
}

function Dispaly({ useStore }) {
  let debugString = useStore((r) => r.debugString);
  return <>{debugString}</>;
}
