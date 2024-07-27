import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useXR, XROrigin } from "@react-three/xr";
import { useEffect, useState } from "react";
import { Vector3 } from "three";
// import { Mouse } from "src/components/CursorTrackerTail/Mouse";

export function ToolBox({}) {
  return <>camera</>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  //
  return (
    <>
      <Insert3D>
        <OrbitControls
          object-position={[0, 3.87 + 0.5, 0.01 + 5]}
          target={[0, 3.87 - 0.004 + 0.5, 5]}
          makeDefault
          rotateSpeed={1}
        ></OrbitControls>
        <CameraSetter></CameraSetter>
      </Insert3D>
    </>
  );
}

function CameraSetter() {
  let xr = useXR();
  let [pos, setPos] = useState(new Vector3(0, 3, 10));
  useEffect(() => {
    setPos(new Vector3(0, 3, 10));
    let inter = setInterval(() => {
      setPos(new Vector3(0, 3, 10));
    }, 1000);

    return () => {
      clearInterval(inter);
    };
  }, [xr.session]);
  return <XROrigin position={pos}></XROrigin>;
}
