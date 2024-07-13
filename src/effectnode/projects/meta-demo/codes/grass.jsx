// import {
//   Box,
//   Environment,
//   EnvironmentMap,
//   EnvironmentPortal,
// } from "@react-three/drei";
// import { useEffect } from "react";

import {
  Bvh,
  Environment,
  Gltf,
  Instance,
  Instances,
  OrbitControls,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color } from "three";
import { CENTER } from "three-mesh-bvh";

// useEditorStore //

export function ToolBox({ useStore, boxData, saveBoxData, files }) {
  let uiDraw = useStore((r) => r.uiDraw);
  return (
    <>
      {/*  */}
      <div
        className="w-full absolute top-0 left-0 z-10"
        style={{ height: `calc(40px)` }}
      >
        <button
          onClick={() => {
            boxData.flower = [];
            saveBoxData();
          }}
        >
          Reset
        </button>

        <input
          type="checkbox"
          checked={uiDraw}
          onChange={() => {
            useStore.setState({
              uiDraw: !uiDraw,
            });
          }}
          name="orbit"
        ></input>

        <label
          onClick={() => {
            useStore.setState({
              uiDraw: !uiDraw,
            });
          }}
        >
          Write
        </label>
      </div>
      {/*  */}
      <div className="w-full" style={{ height: `calc(100%)` }}>
        <Canvas>
          <OrbitControls
            enabled={!uiDraw}
            makeDefault
            object-position={[0, 1, 5]}
            target={[0, 1, 0]}
            enableDamping={false}
          ></OrbitControls>
          <Content
            files={files}
            saveBoxData={saveBoxData}
            boxData={boxData}
            useStore={useStore}
          ></Content>
        </Canvas>
      </div>
    </>
  );
}

function Content({ boxData, saveBoxData, files, useStore }) {
  return (
    <>
      <Editor
        files={files}
        saveBoxData={saveBoxData}
        boxData={boxData}
        useStore={useStore}
      ></Editor>

      <Grass flower={boxData.flower}></Grass>

      <Environment
        files={[files[`/hdr/greenwich_park_02_1k.hdr`]]}
      ></Environment>
    </>
  );
}

function Editor({ files, boxData, saveBoxData, useStore }) {
  let controls = useThree((r) => r.controls);
  let isDown = useRef(false);
  let uiDraw = useStore((r) => r.uiDraw);

  return (
    <>
      {controls && (
        <Bvh firstHitOnly indirect={true} strategy={CENTER} enabled={true}>
          <group
            onPointerDown={() => {
              isDown.current = true;
            }}
            onPointerUp={() => {
              isDown.current = false;
            }}
            onPointerLeave={() => {
              isDown.current = false;
            }}
            onPointerOut={() => {
              isDown.current = false;
            }}
            onPointerBlur={() => {
              isDown.current = false;
            }}
            onPointerMove={(ev) => {
              if (uiDraw && isDown.current) {
                boxData.flower = boxData.flower || [];

                //
                boxData.flower.push({
                  _id: `_${Math.random().toString(36).slice(2, 9)}`,
                  position: ev.point.toArray().map((r) => r.toFixed(2) * 1),
                  color:
                    "#" + new Color(Math.random() * 0xffffff).getHexString(),
                });

                saveBoxData();
              }

              // console.log(ev);
            }}
          >
            <Gltf src={files[`/place/church-lok.glb`]}></Gltf>
          </group>
        </Bvh>
      )}
    </>
  );
}

function Grass({ flower = [] }) {
  //
  console.log(flower);

  return (
    <Instances frustumCulled={false} range={flower.length} limit={5000}>
      <boxGeometry></boxGeometry>
      <meshStandardMaterial></meshStandardMaterial>

      {flower.map((r) => {
        return (
          <group position={[0, 0.1, 0]} key={r._id}>
            <Instance
              position={r.position}
              color={r.color}
              scale={0.1}
            ></Instance>
          </group>
        );
      })}
    </Instances>
  );
}

export function Runtime({ ui, useStore, io, files, boxData }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  useEffect(() => {
    // useStore //
  }, []);

  //
  return (
    <>
      <Insert3D>
        {/*  */}

        <Grass flower={boxData.flower}></Grass>
        {/*  */}
      </Insert3D>
    </>
  );
}
