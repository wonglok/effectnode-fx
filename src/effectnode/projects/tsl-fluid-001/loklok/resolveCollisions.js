import { abs, If, sign } from "three/examples/jsm/nodes/Nodes";

export let resolveCollisions = ({
  boundSizeMax,
  boundSizeMin,
  position,
  velocity,
  particleSize,
}) => {
  If(
    position.x.greaterThan(boundSizeMax.x),
    () => {
      position.x.assign(
        boundSizeMax.x.add(particleSize.mul(0.5)).mul(sign(position.x))
      );
      velocity.x.mulAssign(-1);
    },
    () => {}
  );
  If(
    position.x.lessThan(boundSizeMin.x),
    () => {
      position.x.assign(
        boundSizeMin.x.add(particleSize.mul(-0.5)).mul(sign(position.x))
      );
      velocity.x.mulAssign(-1);
    },
    () => {}
  );

  If(
    position.y.greaterThan(boundSizeMax.y),
    () => {
      position.y.assign(
        boundSizeMax.y.add(particleSize.mul(0.5)).mul(sign(position.y))
      );
      velocity.y.mulAssign(-1);
    },
    () => {}
  );
  If(
    position.y.lessThanEqual(boundSizeMin.y),
    () => {
      position.y.assign(
        boundSizeMin.y.add(particleSize.mul(-0.5)).mul(sign(position.y))
      );
      velocity.y.mulAssign(-1);
    },
    () => {}
  );

  If(
    position.z.greaterThan(boundSizeMax.z),
    () => {
      position.z.assign(
        boundSizeMax.z.add(particleSize.mul(0.5)).mul(sign(position.z))
      );
      velocity.z.mulAssign(-1);
    },
    () => {}
  );
  If(
    position.z.lessThan(boundSizeMin.z),
    () => {
      position.z.assign(
        boundSizeMin.z.add(particleSize.mul(-0.5)).mul(sign(position.z))
      );
      velocity.z.mulAssign(-1);
    },
    () => {}
  );
};
