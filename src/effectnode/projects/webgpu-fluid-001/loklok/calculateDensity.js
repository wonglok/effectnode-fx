import { distanceTo } from "./distanceTo";
import { smoothinKernel } from "./smoothKernel";

export const calculateDensity = ({ samplerPoint }) => {
  let density = 0;
  let mass = 1;
  let smoothRadius = 0.5;
  for (let position in positions) {
    let dst = distanceTo(position, samplerPoint); // (position - samplerPoint).magnitude;
    let influence = smoothinKernel({ radius: smoothRadius, dst });

    density += mass * influence;
  }

  return density;
};
