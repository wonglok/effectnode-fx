import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
// import { Mouse } from "src/components/CursorTrackerTail/Mouse";
import { Insert3D } from "./main";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Euler, Quaternion, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { Object3D } from "three";

export function ToolBox({}) {
  return <>camera</>;
}

export function Runtime({ ui, useStore, io }) {
  let orientation = useStore((r) => r.orientation);
  return (
    <>
      <Insert3D>
        {/*  */}
        {
          // <OrbitControls
          //   object-position={[0, 1.87, 0.01]}
          //   target={[0, 1.87, 0]}
          //   makeDefault
          //   rotateSpeed={1}
          // ></OrbitControls>
        }

        <Sync useStore={useStore}></Sync>
      </Insert3D>
    </>
  );
}

function Sync({ useStore, children }) {
  let ref = useRef();
  let orientation = useStore((r) => r.orientation);
  let camera = useThree((r) => r.camera);

  //
  let setOriten = useMemo(() => {
    //
    var setObjectQuaternion = (function () {
      var zee = new Vector3(0, 0, 1);

      var euler = new Euler();

      var q0 = new Quaternion();

      var q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

      return function (quaternion, alpha, beta, gamma, orient) {
        euler.set(beta, alpha, -gamma, "YXZ"); // 'ZXY' for the device, but 'YXZ' for us

        quaternion.setFromEuler(euler); // orient the device

        quaternion.multiply(q1); // camera looks out the back of the device, not the top

        quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // adjust for screen orientation
      };
    })();

    return setObjectQuaternion;
  }, []);

  useEffect(() => {
    if (!orientation) {
      return;
    }
    if (!camera) {
      return;
    }

    let { beta, gamma, alpha } = orientation;

    setOriten(
      camera.quaternion,
      degToRad(alpha),
      degToRad(beta),
      degToRad(gamma),
      0
    );
    // parent.rotation.set(beta, alpha, -gamma, "YXZ");
  }, [orientation, camera, setOriten]);

  return (
    <group>
      <group ref={ref}>
        <PerspectiveCamera
          fov={68}
          position={[0, 1.87, 0.01]}
          makeDefault
        ></PerspectiveCamera>
      </group>

      {children}
    </group>
  );
}
