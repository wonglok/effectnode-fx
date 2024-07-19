// Three.js Transpiler r165

import {
  float,
  vec3,
  atan2,
  sqrt,
  cos,
  sin,
  tslFn,
} from "three/examples/jsm/nodes/Nodes";

const ballify = tslFn((props) => {
  const r = float(props.r).toVar();
  const pos = vec3(props.pos).toVar();
  const az = float(atan2(pos.y, pos.x)).toVar();

  const el = float(
    atan2(pos.z, sqrt(pos.x.mul(pos.x).add(pos.y.mul(pos.y))))
  ).toVar();

  return vec3(
    r.mul(cos(el).mul(cos(az))),
    r.mul(cos(el).mul(sin(az))),
    r.mul(sin(el))
  );
});

// layouts

ballify.setLayout({
  name: "ballify",
  type: "vec3",
  inputs: [
    { name: "pos", type: "vec3" },
    { name: "r", type: "float" },
  ],
});

export { ballify };
