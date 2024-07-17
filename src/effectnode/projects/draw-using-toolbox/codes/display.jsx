import { useEffect, useMemo, useRef, useState } from "react";
// import { Object3D } from "three";
// import { clone } from "three/examples/jsm/utils/SkeletonUtils";
import { create } from "zustand";
export function ToolBox({ ui, files, io, useStore }) {
  return (
    <>
      {/*  */}

      {/*  */}
    </>
  );
}

export function Runtime({ ui, useStore, io, files }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <Ready io={io}></Ready>
      </Insert3D>
    </>
  );
}

function Ready({ io }) {
  let useCompute = useMemo(() => {
    return create(() => {
      return {
        io,
        input: null,
      };
    });
  }, [io]);

  let input = useCompute((r) => r.input);

  useEffect(() => {
    io.in(0, (visual) => {
      useCompute.setState({
        input: visual ? <primitive object={visual}></primitive> : null,
      });
    });

    return () => {};
  }, [io, useCompute]);

  return (
    <group>
      {/*  */}
      {input}
      {/*  */}
    </group>
  );
}

//
