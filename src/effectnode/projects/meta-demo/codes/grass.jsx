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
  Text,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { Color } from "three";
import { CENTER } from "three-mesh-bvh";

// useEditorStore //

export function ToolBox({ boxData, saveBoxData, files }) {
  let tt = 0;
  return (
    <>
      {/*  */}
      <div className="w-full" style={{ height: `calc(40px)` }}>
        <button
          onClick={() => {
            boxData.flower = [];
            saveBoxData();
          }}
        >
          Reset
        </button>
      </div>
      {/*  */}
      {/*  */}
      <div className="w-full" style={{ height: `calc(100% - 40px)` }}>
        <Canvas>
          <OrbitControls
            object-position={[0, 1, 5]}
            target={[0, 1, 0]}
          ></OrbitControls>
          <Bvh firstHitOnly indirect={true} strategy={CENTER} enabled={true}>
            <group
              onPointerMove={(ev) => {
                //
                boxData.flower = boxData.flower || [];

                //
                boxData.flower.push({
                  _id: `_${Math.random().toString(36).slice(2, 9)}`,
                  position: ev.point.toArray().map((r) => r.toFixed(1) * 1),
                  color:
                    "#" + new Color(Math.random() * 0xffffff).getHexString(),
                });

                saveBoxData();

                // console.log(ev);
              }}
            >
              <Gltf src={files[`/place/church-lok.glb`]}></Gltf>
            </group>
          </Bvh>

          <Grass boxData={boxData}></Grass>

          <Environment
            files={[files[`/hdr/greenwich_park_02_1k.hdr`]]}
          ></Environment>
          <OrbitControls></OrbitControls>
        </Canvas>
      </div>
    </>
  );
}

function Grass({ boxData }) {
  //
  boxData.flower = boxData.flower || [];

  console.log(boxData.flower);

  return (
    <Instances frustumCulled={false} range={boxData.flower.length} limit={5000}>
      <boxGeometry></boxGeometry>
      <meshStandardMaterial></meshStandardMaterial>

      {boxData.flower.map((r) => {
        return (
          <Instance
            key={r._id}
            position={r.position}
            color={r.color}
            scale={0.1}
          ></Instance>
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

        <Grass boxData={boxData}></Grass>
        {/*  */}
      </Insert3D>
    </>
  );
}

//

//

//
