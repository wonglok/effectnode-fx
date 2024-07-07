import { Gltf } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { CursorTrackerTail } from "src/components/CursorTrackerTail/CursorTrackerTail";
import { Mini } from "src/components/CursorTrackerTail/Mini";
import { Color, Object3D } from "three";
import cursorGLBURL from "./cursor.glb";
export function Mouse() {
  //

  let mini = useMemo(() => {
    return new Mini({});
  }, []);
  let get = useThree((r) => r.get);

  useFrame(() => {
    mini.work();
  });

  let camera = useThree((r) => r.camera);

  let [mount, setMount] = useState(null);

  useEffect(() => {
    //
    let st = get();

    for (let key in st) {
      mini.set(key, st[key]);
    }

    let mounter = new Object3D();
    let cursor = new Object3D();

    new CursorTrackerTail({
      mini,
      mounter: mounter,
      cursor: cursor,
      color: new Color("#ffffff"),
    });

    setMount(
      <>
        {createPortal(
          <group>
            <group position={[0, 0, -3]}>
              <Gltf src={cursorGLBURL}></Gltf>
            </group>
            <group position={[0, 0, -3]}>
              <primitive object={cursor}></primitive>
            </group>
          </group>,
          camera
        )}

        <primitive object={camera}></primitive>
        <primitive object={mounter}></primitive>
      </>
    );
    //
  }, [get, camera, mini]);

  return (
    <>
      {/*  */}

      {mount}

      {/*  */}
    </>
  );
}
