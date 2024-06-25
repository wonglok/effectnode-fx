import { SocketOne } from "./SocketOne";

export function SocketInputs({ node, useStore }) {
  let inputs = node.inputs || [];

  //

  return (
    <group position={[-(inputs.length / 2) * (0.2 + 0.1 / 2), 0, -0.3 - 0.15]}>
      {inputs.map((inp, iii) => {
        return (
          <group key={inp._id} position={[iii * (0.2 + 0.1), 0, 0]} scale={0.2}>
            <SocketOne
              node={node}
              socket={inp}
              useStore={useStore}
              type={"input"}
              idx={iii}
            ></SocketOne>
          </group>
        );
      })}
    </group>
  );
}

export function SocketOutputs({ node, useStore }) {
  let outputs = node.outputs || [];

  return (
    <group position={[-(outputs.length / 2) * (0.2 + 0.1 / 2), 0, 0.3 + 0.15]}>
      {outputs.map((outp, iii) => {
        return (
          <group
            key={outp._id}
            position={[iii * (0.2 + 0.1), 0, 0]}
            scale={0.2}
          >
            <SocketOne
              idx={iii}
              node={node}
              socket={outp}
              useStore={useStore}
              type={"output"}
            ></SocketOne>
          </group>
        );
      })}
    </group>
  );
}

//

//

//
