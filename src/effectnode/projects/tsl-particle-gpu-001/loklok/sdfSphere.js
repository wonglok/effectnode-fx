// Three.js Transpiler r165

import { vec2, dot, sin, fract, tslFn } from "three/examples/jsm/nodes/Nodes";

const sdSphere = tslFn((props) => {
  const s = float(props.s).toVar();
  const p = vec3(props.p).toVar();

  return length(p).sub(s);
});

// layouts

sdSphere.setLayout({
  name: "sdSphere",
  type: "float",
  inputs: [
    { name: "p", type: "vec3" },
    { name: "s", type: "float" },
  ],
});

export { sdSphere };
