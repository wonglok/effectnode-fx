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
  particleSize,
  delta,
}) => {
  //

  let nowPosition = vec3(position);

  let nOne = float(-5);
  let pOne = float(5);

  If(nowPosition.x.greaterThanEqual(boundSizeMax.x), () => {
    // velocity.x.addAssign(nOne.mul(delta));
    position.x.assign(boundSizeMax.x);
    velocity.x.mulAssign(-1 * 0.5);
  });
  If(nowPosition.x.lessThanEqual(boundSizeMin.x), () => {
    // velocity.x.addAssign(pOne.mul(delta));
    position.x.assign(boundSizeMin.x);
    velocity.x.mulAssign(-1 * 0.5);
  });

  If(nowPosition.y.greaterThanEqual(boundSizeMax.y), () => {
    // velocity.y.addAssign(nOne.mul(delta));
    position.y.assign(boundSizeMax.y);
    velocity.y.mulAssign(-1 * 0.5);
  });
  If(nowPosition.y.lessThanEqual(boundSizeMin.y), () => {
    // velocity.y.addAssign(pOne.mul(delta));
    position.y.assign(boundSizeMin.y);
    velocity.y.mulAssign(-1 * 0.5);
  });

  If(nowPosition.z.greaterThanEqual(boundSizeMax.z), () => {
    // velocity.z.addAssign(nOne.mul(delta));
    position.z.assign(boundSizeMax.z);
    velocity.z.mulAssign(-1 * 0.5);
  });
  If(nowPosition.z.lessThanEqual(boundSizeMin.z), () => {
    // velocity.z.addAssign(pOne.mul(delta));
    position.z.assign(boundSizeMin.z);
    velocity.z.mulAssign(-1 * 0.5);
  });

  //
};
