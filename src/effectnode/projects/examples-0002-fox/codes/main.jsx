import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
// import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
import tunnel from "tunnel-rat";
export function ToolBox({}) {
  return (
    <>
      Note Yo
      {/*  */}
      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io }) {
  let t3d = useMemo(() => tunnel(), []);
  //
  let __activeCanvas = useStore((r) => r.__activeCanvas);
  useEffect(() => {
    useStore.setState({
      Insert3D: function Insert3D({ children }) {
        return <t3d.In>{children}</t3d.In>;
      },
      __activeCanvas: true,
    });

    return () => {
      useStore.setState({
        __activeCanvas: false,
      });
    };
  }, [useStore]);
  //

  return (
    <>
      {__activeCanvas && (
        <Canvas gl={(canvas) => new WebGPURenderer({ canvas })}>
          <RenderStuff useStore={useStore}>
            <t3d.Out></t3d.Out>
          </RenderStuff>
        </Canvas>
      )}
    </>
  );
}

function RenderStuff({ children, useStore }) {
  //
  let get = useThree((r) => r.get);
  let ___canShow = useStore((r) => r.___canShow);
  useEffect(() => {
    setTimeout(() => {
      try {
        st.gl
          .init()
          .then(() => {
            setTimeout(() => {
              useStore.setState({ ___canShow: true });
            });
          })
          .catch(() => {
            setTimeout(() => {
              useStore.setState({ ___canShow: true });
            });
          });
      } catch (e) {
        setTimeout(() => {
          useStore.setState({ ___canShow: true });
        });
      }
    });
  }, [get, useStore]);

  useFrame(({ gl, camera, scene }) => {
    if (___canShow) {
      gl.renderAsync(scene, camera);
    }
  }, 100);

  return <>{___canShow && children}</>;
}

//
