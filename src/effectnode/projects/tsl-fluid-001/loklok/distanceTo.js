import { add, float, sqrt } from "three/examples/jsm/nodes/Nodes";

export const distanceTo = (a, b) => {
  let dx = float(a.x).sub(b.x);
  let dy = float(a.y).sub(b.y);
  let dz = float(a.z).sub(b.z);

  return sqrt(add(dx.mul(dx), dy.mul(dy), dz.mul(dz)));
};
