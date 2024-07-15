// Three.js Transpiler r165

import { vec2, dot, sin, fract, tslFn } from "three/examples/jsm/nodes/Nodes";

const rand = tslFn((props) => {
  const nv = vec2(props.n1).toVar();

  return fract(sin(dot(nv, vec2(12.9898, 4.1414))).mul(43758.5453));
});

// layouts

rand.setLayout({
  name: "rand",
  type: "float",
  inputs: [{ name: "n1", type: "vec2" }],
});

export { rand };
