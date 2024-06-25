import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { Line2 } from "three/examples/jsm/lines/Line2";

import { CatmullRomCurve3, Color, Vector3 } from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CubicBezierLine } from "@react-three/drei";
// import { Box } from "@react-three/drei";

export function RenderLine({ start = [1, 0, 1], end = [0, 0, 0] }) {
  let refDash = useRef();

  useFrame(() => {
    refDash.current.material.uniforms.dashOffset.value += -1 * 0.3;
  });

  // const mat = useMemo(() => {
  //   return getMat();
  // }, []);

  //

  // const { geo } = useMemo(() => {
  //   let { geo } = getGeo({
  //     a: new Vector3().fromArray(start),
  //     b: new Vector3().fromArray(end),
  //     dotted: false,
  //   });
  //   return { geo };
  // }, [start, end]);

  //

  // const { line, displayLine } = useMemo(() => {
  //   let line = getLine({ geo, mat });
  //   let displayLine = <primitive object={line}></primitive>;
  //   return { line, displayLine };
  // }, [geo, mat]);

  //

  // let midA = useMemo(() => {
  //   let midA = new Vector3()
  //     .fromArray(start)
  //     .add(new Vector3().fromArray(end))
  //     .divideScalar(2);

  //   midA.y += 1;
  //   //

  //   return midA.toArray();
  // }, [start, end]);

  // let midB = useMemo(() => {
  //   let midB = new Vector3()
  //     .fromArray(start)
  //     .add(new Vector3().fromArray(end))
  //     .divideScalar(2);

  //   midB.y += 1;

  //   return midB.toArray();
  // }, [start, end]);

  let mix = (a, b, t) => {
    return a * t + b * (1.0 - t);
  };

  return (
    <>
      <CubicBezierLine
        ref={refDash}
        start={[start[0], start[1], start[2]]}
        midA={[
          //
          mix(start[0], end[0], 0.85),
          start[1],
          mix(start[2], end[2], 0.15),
        ]}
        midB={[
          //
          mix(start[0], end[0], 0.15),
          end[1],
          mix(start[2], end[2], 0.85),
        ]}
        end={[end[0], end[1], end[2]]}
        color="teal"
        dashed
        dashScale={10}
        gapSize={3}
        transparent
        opacity={0.5}
        lineWidth={3}
      />
      <CubicBezierLine
        start={[start[0], start[1], start[2]]}
        midA={[
          //
          mix(start[0], end[0], 0.85),
          start[1],
          mix(start[2], end[2], 0.15),
        ]}
        midB={[
          //
          mix(start[0], end[0], 0.15),
          end[1],
          mix(start[2], end[2], 0.85),
        ]}
        end={[end[0], end[1], end[2]]}
        color="cyan"
        opacity={0.5}
        lineWidth={2}
        transparent
      />
      {/*  */}

      {/*  */}
    </>
  );
}

export const getLine = ({ geo, mat }) => {
  let line2 = new Line2(geo, mat);

  line2.computeLineDistances();

  return line2;
};

export const getMat = () => {
  const material = new LineMaterial({
    transparent: true,
    color: new Color("#ff0000"),
    linewidth: 2,
    opacity: 1.0,
    dashed: false,
    vertexColors: false,
  });

  return material;
};

export const getGeo = ({ a, b, dotted = false }) => {
  // const dist = new Vector3().copy(a).distanceTo(b);

  let raise = 0.1;

  //
  // if (raise > 5) {
  //   raise = 5;
  // }
  //

  const curvePts = new CatmullRomCurve3(
    [
      new Vector3(a.x, raise, a.z),
      new Vector3(a.x, raise + 0.1, a.z),
      new Vector3(b.x, raise + 0.1, b.z),
      new Vector3(b.x, raise, b.z),
    ],
    false
  );

  //
  //

  let lineGeo = new LineGeometry();
  if (dotted) {
    lineGeo = new LineSegmentsGeometry();
  }

  //
  //
  //
  //

  let colors = [];
  let pos = [];
  let count = 100;
  let temp = new Vector3();

  let colorA = new Color();
  let colorB = new Color("#0000ff");
  let points = [];
  for (let i = 0; i < count; i++) {
    curvePts.getPointAt((i / count) % 1, temp);
    if (isNaN(temp.x)) {
      temp.x = 0.0;
    }
    if (isNaN(temp.y)) {
      temp.y = 0.0;
    }
    if (isNaN(temp.z)) {
      temp.z = 0.0;
    }
    points.push(new Vector3().copy(temp));
    pos.push(temp.x, temp.y, temp.z);
    colorA.setStyle("#00ff00");
    colorA.lerp(colorB, i / count);

    //
    colorA.offsetHSL(0, 0.5, 0.0);
    colors.push(colorA.r, colorA.g, colorA.b);
  }

  lineGeo.setColors(colors);

  lineGeo.setPositions(pos);
  return { geo: lineGeo, points };
};
