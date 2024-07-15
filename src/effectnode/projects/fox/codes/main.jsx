import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { EquirectangularReflectionMapping, HalfFloatType, Scene } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { texture, uv } from "three/examples/jsm/nodes/Nodes";
//
// import WebGPUBackend from "three/examples/jsm/renderers/webgpu/WebGPUBackend";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
// import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
import tunnel from "tunnel-rat";

export function ToolBox({}) {
  return (
    <>
      {/*  */}
      Note Yo
      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io }) {
  //
  let t3d = useMemo(() => tunnel(), []);
  let t2d = useMemo(() => tunnel(), []);

  let files = useStore((r) => r.files);
  //
  useEffect(() => {
    useStore.setState({
      Insert3D: function Insert3D({ children }) {
        return <t3d.In>{children}</t3d.In>;
      },
    });

    useStore.setState({
      InsertHTML: function InsertHTML({ children }) {
        return <t2d.In>{children}</t2d.In>;
      },
    });

    return () => {
      //
    };
  }, [useStore]);

  return (
    <>
      {
        <Canvas
          gl={(canvas1) => {
            let parent = canvas1.parentElement;
            canvas1.parentElement.removeChild(canvas1);
            let canvas2 = document.createElement("canvas");
            let renderer = new WebGPURenderer({ canvas: canvas2 });
            parent.appendChild(canvas2);
            return renderer;
          }}
        >
          <Render useStore={useStore} files={files}>
            {<t3d.Out></t3d.Out>}
          </Render>
        </Canvas>
      }
      <t2d.Out></t2d.Out>
    </>
  );
}

function Render({ files, children, useStore }) {
  //
  let gl = useThree((r) => r.gl);
  let scene = useThree((r) => r.scene);

  let ready = useStore((r) => r.ready);
  useEffect(() => {
    if (!files) {
      return;
    }
    if (!scene) {
      return;
    }
    try {
      gl.init()
        .then(() => {
          useStore.setState({ ready: true });
        })
        .catch(() => {
          useStore.setState({ ready: true });
        });
    } catch (e) {
      console.log(e);
      useStore.setState({ ready: true });
    }
  }, [files, scene, gl, useStore]);

  useFrame(({ gl, scene, camera }) => {
    if (ready) {
      gl.renderAsync(scene, camera);
    }
  }, 100);

  return (
    <>
      {/*  */}
      {ready && children}
      {/*  */}
    </>
  );
}
