import {
  abs,
  add,
  float,
  If,
  max,
  min,
  sign,
  vec3,
} from "three/examples/jsm/nodes/Nodes";
import { distanceTo } from "./distanceTo";

export let resolveCollisions = ({
  boundSizeMax,
  boundSizeMin,
  /** @type {vec3} */
  position,
  velocity,
  collisionDamping = 1,
  delta,
}) => {
  //

  let nowPosition = vec3(position);

  // let nOne = float(-5);
  // let pOne = float(5);

  If(nowPosition.x.greaterThan(boundSizeMax.x), () => {
    position.x.assign(boundSizeMax.x);
    velocity.x.mulAssign(float(delta).mul(0.5));
    velocity.x.addAssign(float(-1).mul(delta).mul(5));
  });
  If(nowPosition.x.lessThan(boundSizeMin.x), () => {
    position.x.assign(boundSizeMin.x);
    velocity.x.mulAssign(float(delta).mul(0.5));
    velocity.x.addAssign(float(1).mul(delta).mul(5));
  });

  If(nowPosition.y.greaterThan(boundSizeMax.y), () => {
    position.y.assign(boundSizeMax.y);
    velocity.y.mulAssign(float(delta).mul(0.5));
    velocity.y.addAssign(float(-1).mul(delta).mul(5));
  });
  If(nowPosition.y.lessThan(boundSizeMin.y), () => {
    position.y.assign(boundSizeMin.y);
    velocity.y.mulAssign(float(delta).mul(0.5));
    velocity.y.addAssign(float(1).mul(delta).mul(5));
  });

  If(nowPosition.z.greaterThan(boundSizeMax.z), () => {
    position.z.assign(boundSizeMax.z);
    velocity.z.mulAssign(float(delta).mul(0.5));
    velocity.z.addAssign(float(-1).mul(delta).mul(5));
  });
  If(nowPosition.z.lessThan(boundSizeMin.z), () => {
    position.z.assign(boundSizeMin.z);
    velocity.z.mulAssign(float(delta).mul(0.5));
    velocity.z.addAssign(float(1).mul(delta).mul(5));
  });

  //
};
