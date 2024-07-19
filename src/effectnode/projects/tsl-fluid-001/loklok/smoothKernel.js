import { float, max, pow } from "three/examples/jsm/nodes/Nodes";

export const smoothinKernel = ({ smoothingRadius, dist }) => {
  let volume = float(
    //
    64 * Math.PI
  )
    .mul(
      //
      pow(
        //
        float(
          //
          smoothingRadius
        ),
        float(
          //
          9
        )
      )
    )
    .div(
      //
      315
    );

  let value = max(
    float(0),
    pow(
      //
      float(smoothingRadius),
      //
      2.0
    )
      //
      .sub(
        //
        pow(
          //
          float(
            //
            dist
          ),
          2.0
        )
      )
  );

  return (
    pow(
      //
      value,
      3
    )
      //
      .div(volume)
  );
};
