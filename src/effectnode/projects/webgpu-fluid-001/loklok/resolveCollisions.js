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

  // let nOne = float(-5);
  // let pOne = float(5);

  If(nowPosition.x.greaterThanEqual(boundSizeMax.x), () => {
    position.x.assign(boundSizeMax.x);
    velocity.x.mulAssign(delta.mul(0.5));
  });
  If(nowPosition.x.lessThanEqual(boundSizeMin.x), () => {
    position.x.assign(boundSizeMin.x);
    velocity.x.mulAssign(delta.mul(0.5));
  });

  If(nowPosition.y.greaterThanEqual(boundSizeMax.y), () => {
    position.y.assign(boundSizeMax.y);
    velocity.y.mulAssign(delta.mul(0.5));
  });
  If(nowPosition.y.lessThanEqual(boundSizeMin.y), () => {
    position.y.assign(boundSizeMin.y);
    velocity.y.mulAssign(delta.mul(0.5));
  });

  If(nowPosition.z.greaterThanEqual(boundSizeMax.z), () => {
    position.z.assign(boundSizeMax.z);
    velocity.z.mulAssign(delta.mul(0.5));
  });
  If(nowPosition.z.lessThanEqual(boundSizeMin.z), () => {
    position.z.assign(boundSizeMin.z);
    velocity.z.mulAssign(delta.mul(0.5));
  });

  //
};
