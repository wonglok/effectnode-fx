import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer";
import tunnel from "tunnel-rat";
export function ToolBox({}) {
  return (
    <>
      {/*  */}
      {/*  */}
    </>
  );
}

function OutHTML({ useStore, t2d }) {
  let ___ready = useStore((r) => r.___ready);

  return <>{___ready && <t2d.Out></t2d.Out>}</>;
}

//
function OutH3D({ useStore, t3d }) {
  let ___ready = useStore((r) => r.___ready);

  return <>{___ready && <t3d.Out></t3d.Out>}</>;
}

function State3D({ useStore }) {
  let get = useThree((r) => r.get);

  useEffect(() => {
    let st = get();
    for (let kn in st) {
      useStore.setState({ [kn]: st[kn] });
    }
    console.log(st["gl"]);

    useStore.setState({ ___ready: true });
  }, [get, useStore]);

  return null;
}

export function Runtime({ useStore, ui, io }) {
  let t3d = useMemo(() => tunnel(), []);
  let t2d = useMemo(() => tunnel(), []);

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
  }, [useStore]);

  return (
    <>
      <div className="w-full h-full">
        <Canvas
          dpr={0.0001}
          gl={(canvas) => {
            return new WebGPURenderer({ canvas });
          }}
        >
          <State3D t3d useStore={useStore}></State3D>
          <OutH3D t3d={t3d} useStore={useStore}></OutH3D>
        </Canvas>
      </div>

      <OutHTML t2d={t2d} useStore={useStore}></OutHTML>
    </>
  );
}
