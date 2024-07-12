import { useEffect, useMemo } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { create } from "zustand";

export function ToolBox({ ui, useStore, io }) {
  let files = useStore((r) => r.files);
  let link = files["/place/church-lok.glb"];
  //
  return (
    <>
      {/*  */}

      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io }) {
  const useCompute = useMemo(
    () =>
      create(() => {
        return {
          io,
        };
      }),
    [io]
  );

  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  let files = useStore((r) => r.files);

  let link = files["/place/church-lok.glb"];

  let filePromise = useCompute((r) => r[link]);

  useEffect(() => {
    if (filePromise) {
      return;
    }

    let draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");

    let gltf = new GLTFLoader();
    gltf.setDRACOLoader(draco);

    let promise = gltf.loadAsync(link, (ev) => {
      if (ev.lengthComputable) {
        console.log(ev.loaded / ev.total);
      }
    });

    useCompute.setState({ [link]: promise });

    return () => {};
  }, [filePromise, link, useCompute]);

  useEffect(() => {
    if (filePromise) {
      filePromise.then((glb) => {
        io.out(0, glb);
        io.out(1, glb.scene);
      });
    }
  }, [filePromise, io]);

  return (
    <>
      <Insert3D>
        {/*  */}

        {/*  */}
      </Insert3D>
    </>
  );
}

//

//

//

//
