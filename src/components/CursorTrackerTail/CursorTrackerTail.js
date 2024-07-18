import {
  HalfFloatType,
  Vector3,
  BufferAttribute,
  CylinderGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Vector2,
  RepeatWrapping,
  ShaderMaterial,
  Mesh,
  Object3D,
  Color,
} from "three";
import { Geometry } from "./Geo.js";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";

export class CursorTrackerTail extends Object3D {
  constructor({ mini, mounter, cursor, color = new Color("#ffffff") }) {
    super();
    let node = mini;

    // minimum 8
    let SCAN_COUNT = 8;
    let TAIL_LENGTH = 64;

    //
    let sim = new LokLokWiggleSimulation({
      node,
      mounter,
      numberOfScans: SCAN_COUNT,
      trailSize: TAIL_LENGTH,
    });

    let display = new LokLokWiggleDisplay({
      numberOfTrail: SCAN_COUNT,
      node,
      sim,
      mounter,
      color,
    });
    this.display = display;

    let trackers = [];

    let makeTracker = ({ update, setup }) => {
      let looker = new Object3D();

      cursor.add(looker);
      mini.onClean(() => {
        cursor.remove(looker);
      });

      let origin = new Object3D();
      looker.add(origin);
      let orbit = new Object3D();
      origin.add(orbit);
      let worldPos = new Vector3();
      let lerpWorldPos = new Vector3();

      setup({ origin, orbit });

      node.onLoop(() => {
        update({ origin, orbit });

        if (mini.now?.camera) {
          looker.lookAt(mini.now.camera.position);
        }

        orbit.getWorldPosition(worldPos);

        lerpWorldPos.lerp(worldPos, 0.1);
      });

      trackers.push(lerpWorldPos);
    };

    let count = SCAN_COUNT;
    for (let i = 0; i < count; i++) {
      makeTracker({
        setup: ({ origin, orbit }) => {
          origin.rotation.z += ((Math.PI * 2.0) / count) * i;
        },
        update: ({ origin, orbit }) => {
          //
          origin.rotation.z += 0.05;

          orbit.position.x =
            0.8 + 0.8 * Math.sin((window.performance.now() / 1000) * 1);
          //
        },
      });
    }

    // let makeCross = () => {
    //   let looker = new Object3D();
    //   cursor.add(looker);
    //   mini.onClean(() => {
    //     cursor.remove(looker);
    //   });

    //   let cross1 = new Mesh(
    //     new BoxBufferGeometry(0.02, 1, 0.02),
    //     new MeshBasicMaterial({ depthTest: false, color: 0xffffff })
    //   );
    //   looker.add(cross1);

    //   let cross2 = new Mesh(
    //     new BoxBufferGeometry(1, 0.02, 0.02),
    //     new MeshBasicMaterial({ depthTest: false, color: 0xffffff })
    //   );
    //   looker.add(cross2);

    //   cross1.userData.enableBloom = true;
    //   cross2.userData.enableBloom = true;

    //   looker.scale.setScalar(2.0);

    //   node.onLoop(() => {
    //     if (mini.now?.camera) {
    //       looker.lookAt(mini.now.camera.position);
    //     }

    //     let ss = 2 * Math.sin(Math.PI - window.performance.now() / 1000);
    //     cross1.scale.setScalar(ss);
    //     cross2.scale.setScalar(ss);
    //   });
    // };
    // makeCross();

    sim.wait.then(() => {
      node.onLoop(() => {
        sim.render({
          trackers,
        });
      });
    });
  }
}

class LokLokWiggleSimulation {
  constructor({ node, numberOfScans = 10, trailSize = 32 }) {
    this.node = node;
    this.WIDTH = trailSize;
    this.HEIGHT = numberOfScans; // number of trackers
    this.v3v000 = new Vector3(0, 0, 0);
    this.wait = this.setup({ node });
  }

  async setup({ node }) {
    let renderer = await node.ready.gl;

    let gpu = (this.gpu = new GPUComputationRenderer(
      this.WIDTH,
      this.HEIGHT,
      renderer
    ));

    gpu.setDataType(HalfFloatType);

    const dtPosition = this.gpu.createTexture();
    const lookUpTexture = this.gpu.createTexture();
    this.fillPositionTexture(dtPosition);
    this.fillLookupTexture(lookUpTexture);

    this.positionVariable = this.gpu.addVariable(
      "texturePosition",
      this.positionShader(),
      dtPosition
    );
    this.gpu.setVariableDependencies(this.positionVariable, [
      this.positionVariable,
    ]);

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.positionUniforms.lookup = { value: lookUpTexture };

    let h = this.HEIGHT;
    for (let ii = 0; ii < h; ii++) {
      this.positionUniforms["mouse" + ii] = { value: new Vector3(0, 0, 0) };
    }

    this.positionUniforms.time = { value: 0 };
    dtPosition.wrapS = RepeatWrapping;
    dtPosition.wrapT = RepeatWrapping;

    //
    const error = this.gpu.init();
    if (error !== null) {
      console.error(error);
    }
  }

  positionShader() {
    let lookupRightLine = () => {
      let str = `if (false) {}`;
      let h = this.HEIGHT;
      for (let ii = 0; ii < h; ii++) {
        str += `
            else if (currentLine == ${ii.toFixed(0)}.0) {
              gl_FragColor = vec4(mouse${ii.toFixed(0)}, 1.0);
            }
          `;
      }
      return str;
    };

    let mouseUniforms = () => {
      let str = ``;
      let h = this.HEIGHT;
      for (let ii = 0; ii < h; ii++) {
        str += `
            uniform vec3 mouse${ii.toFixed(0)};
          `;
      }

      return str;
    };
    return /* glsl */ `
        ${mouseUniforms()}
  
        uniform sampler2D lookup;
        uniform float time;
  
              void main()	{
          // const float width = resolution.x;
          // const float height = resolution.y;
          // float xID = floor(gl_FragCoord.x);
          // float yID = floor(gl_FragCoord.y);
  
          vec2 uvCursor = vec2(gl_FragCoord.x, gl_FragCoord.y) / resolution.xy;
          // vec4 positionHead = texture2D( texturePosition, uvCursor );
  
          vec4 lookupData = texture2D(lookup, uvCursor);
          vec2 nextUV = lookupData.xy;
          float currentIDX = floor(gl_FragCoord.x);
          float currentLine = floor(gl_FragCoord.y);
  
          if (floor(currentIDX) == 0.0) {
            ${lookupRightLine()}
          } else {
            vec3 positionChain = texture2D( texturePosition,nextUV ).xyz;
            gl_FragColor = vec4(positionChain, 1.0);
          }
  
  
              }
      `;
  }

  fillPositionTexture(texture) {
    let i = 0;
    const theArray = texture.image.data;

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        theArray[i++] = 0.0;
        theArray[i++] = 0.0;
        theArray[i++] = 0.0;
        theArray[i++] = 0.0;
      }
    }
    texture.needsUpdate = true;
  }

  fillLookupTexture(texture) {
    let i = 0;
    const theArray = texture.image.data;
    let items = [];

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        let lastOneInArray = items[items.length - 1] || [0, 0];
        theArray[i++] = lastOneInArray[0];
        theArray[i++] = lastOneInArray[1];
        theArray[i++] = this.WIDTH;
        theArray[i++] = this.HEIGHT;
        items.push([x / this.WIDTH, y / this.HEIGHT]);
      }
    }
    texture.needsUpdate = true;
  }

  render({ trackers }) {
    this.positionUniforms.time.value = window.performance.now() / 1000;

    trackers.forEach((track, idx) => {
      let uniform = this.positionUniforms["mouse" + idx];
      if (uniform && uniform.value) {
        uniform.value.copy(track);
        // console.log(idx, track.toArray().join("-"));
      }
    });

    this.gpu.compute();
  }

  getTextureAfterCompute() {
    return {
      posTexture: this.gpu.getCurrentRenderTarget(this.positionVariable)
        .texture,
    };
  }
}

class LokLokWiggleDisplay {
  constructor({ node, sim, mounter, color, numberOfTrail }) {
    this.mounter = mounter;
    this.node = node;
    this.sim = sim;
    this.color = color;
    this.numberOfTrail = numberOfTrail;
    this.wait = this.setup({ node });
  }

  async setup({ node }) {
    let mounter = this.mounter;

    let { geometry, subdivisions, count } = new NoodleGeo({
      count: this.numberOfTrail,
      numSides: 6,
      subdivisions: this.sim.WIDTH * 1,
      openEnded: true,
    });

    geometry.instanceCount = count;

    let getPointAtByT = ({
      controlPointsResolution = 20,
      lineIdx = 0,
      lineCount = this.sim.HEIGHT,
      textureName = "CONTROL_POINTS",
    }) => {
      controlPointsResolution = Math.floor(controlPointsResolution);

      let floatval = `${Number(controlPointsResolution).toFixed(1)}`;

      let res = `
        vec3 pointIDX_${textureName}_${lineIdx.toFixed(0)} (float index) {
          vec3 result = vec3(0.0);
  
          vec4 color = texture2D(${textureName},
            vec2(
              index / ${controlPointsResolution.toFixed(1)},
              ${lineIdx.toFixed(1)} / ${lineCount.toFixed(1)}
            )
          );
  
          result = color.rgb;
  
          return result;
        }
  
        vec3 catmullRom_${textureName}_${lineIdx} (vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
            vec3 v0 = (p2 - p0) * 0.5;
            vec3 v1 = (p3 - p1) * 0.5;
            float t2 = t * t;
            float t3 = t * t * t;
  
            return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
        }
  
        vec3 getPointAt_${lineIdx.toFixed(0)} (float t) {
          bool closed = false;
          float ll = ${floatval};
          float minusOne = 1.0;
          if (closed) {
            minusOne = 0.0;
          }
  
          float p = (ll - minusOne) * t;
          float intPoint = floor(p);
          float weight = p - intPoint;
  
          float idx0 = intPoint + -1.0;
          float idx1 = intPoint +  0.0;
          float idx2 = intPoint +  1.0;
          float idx3 = intPoint +  2.0;
  
          vec3 pt0 = pointIDX_${textureName}_${lineIdx.toFixed(0)}(idx0);
          vec3 pt1 = pointIDX_${textureName}_${lineIdx.toFixed(0)}(idx1);
          vec3 pt2 = pointIDX_${textureName}_${lineIdx.toFixed(0)}(idx2);
          vec3 pt3 = pointIDX_${textureName}_${lineIdx.toFixed(0)}(idx3);
  
          vec3 pointoutput = catmullRom_${textureName}_${lineIdx}(pt0, pt1, pt2, pt3, weight);
  
          return pointoutput;
        }
        `;

      // console.log(res);
      return res;
    };

    let getLinesPointAtT = () => {
      let str = `
            if (false) {}`;
      for (let i = 0; i < this.sim.HEIGHT; i++) {
        str += `
            else if (lineIDXER == ${i.toFixed(1)}) {
              pt += getPointAt_${i.toFixed(0)}(t);
            }
          `;
      }
      // console.log(str);

      return str;
    };

    let pointLineMaker = () => {
      let str = "";
      for (let i = 0; i < this.sim.HEIGHT; i++) {
        str +=
          getPointAtByT({
            lineIdx: i,
            lineCount: this.sim.HEIGHT,
            controlPointsResolution: subdivisions,
            textureName: "posTexture",
          }) + "\n";
      }
      return str;
    };
    //

    let latestColor = new Color().copy(this.color);
    window.addEventListener("hover", ({ detail: state }) => {
      console.log(state);
      if (state === "hover") {
        latestColor.set("#00ffff");
      } else {
        latestColor.set("#ffffff");
      }
    });

    this.node.onLoop(() => {
      this.color.lerp(latestColor, 0.1);
    });

    let matLine0 = new ShaderMaterial({
      uniforms: {
        tailColor: { value: this.color },
        time: { value: 0 },
        matcap: {
          value: null,
          // value: new TextureLoader().load("/matcap/golden2.png"),
          // value: await node.ready.RainbowTexture,
        },
        posTexture: { value: null },
        // handTexture: { value: null },
      },
      vertexShader: /* glsl */ `
          // #include <common>
          #define lengthSegments ${subdivisions.toFixed(1)}
  
          attribute float angle;
          attribute float newPosition;
          attribute float tubeInfo;
  
          // varying vec2 vUv;
          varying vec3 vNormal;
          attribute vec4 offset;
  
          uniform sampler2D posTexture;
          // uniform sampler2D handTexture;
  
          uniform float time;
  
          mat4 rotationX( in float angle ) {
            return mat4(	1.0,		0,			0,			0,
                    0, 	cos(angle),	-sin(angle),		0,
                    0, 	sin(angle),	 cos(angle),		0,
                    0, 			0,			  0, 		1);
          }
  
          mat4 rotationY( in float angle ) {
            return mat4(	cos(angle),		0,		sin(angle),	0,
                        0,		1.0,			 0,	0,
                    -sin(angle),	0,		cos(angle),	0,
                        0, 		0,				0,	1);
          }
  
          mat4 rotationZ( in float angle ) {
            return mat4(	cos(angle),		-sin(angle),	0,	0,
                    sin(angle),		cos(angle),		0,	0,
                        0,				0,		1,	0,
                        0,				0,		0,	1);
          }
  
          mat4 rotationMatrix (vec3 axis, float angle) {
              axis = normalize(axis);
              float s = sin(angle);
              float c = cos(angle);
              float oc = 1.0 - c;
  
              return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                          oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                          oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                          0.0,                                0.0,                                0.0,                                1.0);
          }
  
          ${pointLineMaker()}
  
          vec3 sampleFnc (float t) {
            vec3 pt = (offset.xyz + 0.5) * 0.0;
  
            // pt = vec4(vec4(pt, 1.0) * rotationY(t * 0.1 + time * 0.1)).xyz;
            // if (lineIDXER == 0.0) {
            //   pt += getPointAt_0(t);
            // }
  
            float lineIDXER = offset.w;
            // pt += getPointAt_0(t);
  
            ${getLinesPointAtT()}
  
            // pt = getPointAt_2(t);
  
            return pt;
          }
  
          void createTube (float t, vec2 volume, out vec3 pos, out vec3 normal) {
            // find next sample along curve
            float nextT = t + (1.0 / lengthSegments);
  
            // sample the curve in two places
            vec3 cur = sampleFnc(t);
            vec3 next = sampleFnc(nextT);
  
            // compute the Frenet-Serret frame
            vec3 T = normalize(next - cur);
            vec3 B = normalize(cross(T, next + cur));
            vec3 N = -normalize(cross(B, T));
  
            // extrude outward to create a tube
            float tubeAngle = angle;
            float circX = cos(tubeAngle);
            float circY = sin(tubeAngle);
  
            // compute position and normal
            normal.xyz = normalize(B * circX + N * circY);
            pos.xyz = cur + B * volume.x * circX + N * volume.y * circY;
          }
  
          varying float vT;
          varying vec3 vViewPosition;
  
          void main (void) {
            vec3 transformed;
            vec3 objectNormal;
  
            float t = tubeInfo + 0.5;
  
            vT = t;
            
            float thickness = (sin(time * 2.0 + 2.0 * t * 3.1415192) * 0.5 + 0.5) * 0.065 + 0.03;

            vec2 volume = vec2(thickness, thickness);

            volume *= clamp(pow((1.0 - t) * t, 0.35), 0.0, 1.0);

            createTube(t, volume, transformed, objectNormal);
  
            vec3 transformedNormal = normalMatrix * objectNormal;
            vNormal = normalize(transformedNormal);
  
            // vUv = uv.yx;

            vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            vViewPosition = -mvPosition.xyz;
          }
        `,
      fragmentShader: /* glsl */ `
          varying float vT;
          // varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          // uniform sampler2D matcap;
          uniform vec3 tailColor;
          uniform float time;
  
          const float PI = 3.14159265;
          const float SCALE = 1.0;
          const mat3 m = mat3(
            cos(PI * SCALE), -sin(PI * SCALE), 0.0,
            sin(PI * SCALE),  cos(PI * SCALE), 0.0,
            0.0,  0.0, 1.0
          );
  
          float noise( in vec3 p ) {
            return cos(p.x) * sin(p.y) * cos(p.z);
          }
  
          float fbm4( vec3 p ) {
              float f = 0.0;
              f += 0.5000 * noise( p ); p = m * p * 2.02;
              f += 0.2500 * noise( p ); p = m * p * 2.03;
              f += 0.1250 * noise( p ); p = m * p * 2.01;
              f += 0.0625 * noise( p );
              return f / 0.9375;
          }
  
          float fbm6( vec3 p ) {
              float f = 0.0;
              f += 0.500000*(0.5 + 0.5 * noise( p )); p = m*p*2.02;
              f += 0.250000*(0.5 + 0.5 * noise( p )); p = m*p*2.03;
              f += 0.125000*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
              f += 0.062500*(0.5 + 0.5 * noise( p )); p = m*p*2.04;
              f += 0.031250*(0.5 + 0.5 * noise( p )); p = m*p*2.01;
              f += 0.015625*(0.5 + 0.5 * noise( p ));
              return f/0.96875;
          }
  
          float pattern (vec3 p) {
            float vout = fbm4( p + time + fbm6(  p + fbm4( p + time )) );
            return abs(vout);
          }
  
          void main (void) {
  
            vec3 viewDir = normalize( vViewPosition );
            vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
            vec3 y = cross( viewDir, x );
            vec2 uv = vec2( dot( x, vNormal ), dot( y, vNormal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks
  
            // vec4 matcapColor = texture2D( matcap, uv );
  
            vec4 color = vec4((vNormal * vViewPosition), 1.0);
  
            gl_FragColor =  vec4(vec3(
              4.0 * pow(pattern(vec3(vT + time * 0.3) + -0.35 * cos(time * 0.1)), 1.0),
              4.0 * pow(pattern(vec3(vT + time * 0.3) +   0.0 * cos(time * 0.1)), 1.0),
              4.0 * pow(pattern(vec3(vT + time * 0.3) +  0.35 * cos(time * 0.1)), 1.0)
            ) * tailColor, (1.0 - vT));
  
            // gl_FragColor = vec4(tailColor, (1.0 - vT));
          }
        `,
      transparent: true,
      // blending: AdditiveBlending,
      depthTest: false,
    });

    let line0 = new Mesh(geometry, matLine0);
    line0.frustumCulled = false;
    line0.userData.enableBloom = true;

    mounter.add(line0);
    node.onClean(() => {
      mounter.remove(line0);
    });

    this.sim.wait.then(() => {
      node.onLoop(() => {
        let result = this.sim.getTextureAfterCompute();
        matLine0.uniforms.posTexture.value = result.posTexture;
        matLine0.uniforms.time.value = window.performance.now() / 1000;
      });
    });
  }

  // async enableMousePlane() {
  //   let raycaster = await node.ready.raycaster;
  //   let mouse = await node.ready.mouse;
  //   let camera = await node.ready.camera;
  //   let viewport = await node.ready.viewport;

  //   let geoPlane = new PlaneBufferGeometry(
  //     2.0 * viewport.width,
  //     2.0 * viewport.height,
  //     2,
  //     2
  //   );

  //   let matPlane = new MeshBasicMaterial({
  //     transparent: true,
  //     opacity: 0.25,
  //     color: 0xff0000,
  //   });

  //   let planeMesh = new Mesh(geoPlane, matPlane);
  //   planeMesh.position.z = -camera.position.z / 2;

  //   scene.add(planeMesh);
  //   node.onClean(() => {
  //     scene.remove(planeMesh);
  //   });

  //   let temppos = new Vector3();
  //   node.onLoop(() => {
  //     planeMesh.lookAt(camera.position);
  //     raycaster.setFromCamera(mouse, camera);
  //     let res = raycaster.intersectObject(planeMesh);
  //     if (res && res[0]) {
  //       temppos.copy(res[0].point);
  //     }
  //   });
  // }

  // enableHandTexture() {
  //   const width = this.sim.WIDTH
  //   const height = this.sim.HEIGHT
  //   const size = width * height

  //   let handMovement = []
  //   let temppos = new Vector3()
  //   for (let i = 0; i < size; i++) {
  //     AvatarHead.getWorldPosition(temppos)

  //     let x = temppos.x || 0
  //     let y = temppos.y || 0
  //     let z = temppos.z || 0
  //     //
  //     handMovement.unshift(x, y, z)
  //   }

  //   const textureArray = new Uint16Array(3 * size)
  //   const handTexture = new DataTexture(
  //     textureArray,
  //     width,
  //     height,
  //     RGBFormat,
  //     HalfFloatType
  //   )
  //   handTexture.needsUpdate = true

  //   node.onLoop(() => {
  //     handMovement.push(DataUtils.toHalfFloat(temppos.x) || 0)
  //     handMovement.push(DataUtils.toHalfFloat(temppos.y) || 0)
  //     handMovement.push(DataUtils.toHalfFloat(temppos.z) || 0)

  //     handMovement.shift()
  //     handMovement.shift()
  //     handMovement.shift()

  //     textureArray.set(handMovement, 0)
  //     handTexture.needsUpdate = true
  //     mat.uniforms.handTexture.value = handTexture
  //   })
  // }
}

class NoodleGeo {
  constructor(props) {
    let {
      count = 20,
      numSides = 4,
      subdivisions = 50,
      openEnded = true,
    } = props;
    const radius = 1;
    const length = 1;

    const cylinderBufferGeo = new CylinderGeometry(
      radius,
      radius,
      length,
      numSides,
      subdivisions,
      openEnded
    );

    let baseGeometry = new Geometry();
    baseGeometry = baseGeometry.fromBufferGeometry(cylinderBufferGeo);

    baseGeometry.rotateZ(Math.PI / 2);

    // compute the radial angle for each position for later extrusion
    const tmpVec = new Vector2();
    const xPositions = [];
    const angles = [];
    const uvs = [];
    const vertices = baseGeometry.vertices;
    const faceVertexUvs = baseGeometry.faceVertexUvs[0];
    const oPositions = [];

    // Now go through each face and un-index the geometry.
    baseGeometry.faces.forEach((face, i) => {
      const { a, b, c } = face;
      const v0 = vertices[a];
      const v1 = vertices[b];
      const v2 = vertices[c];
      const verts = [v0, v1, v2];
      const faceUvs = faceVertexUvs[i];

      // For each vertex in this face...
      verts.forEach((v, j) => {
        tmpVec.set(v.y, v.z).normalize();

        // the radial angle around the tube
        const angle = Math.atan2(tmpVec.y, tmpVec.x);
        angles.push(angle);

        // "arc length" in range [-0.5 .. 0.5]
        xPositions.push(v.x);
        oPositions.push(v.x, v.y, v.z);

        // copy over the UV for this vertex
        uvs.push(faceUvs[j].toArray());
      });
    });

    // build typed arrays for our attributes
    const posArray = new Float32Array(xPositions);
    const angleArray = new Float32Array(angles);
    const uvArray = new Float32Array(uvs.length * 2);

    const origPosArray = new Float32Array(oPositions);

    // unroll UVs
    for (let i = 0; i < posArray.length; i++) {
      const [u, v] = uvs[i];
      uvArray[i * 2 + 0] = u;
      uvArray[i * 2 + 1] = v;
    }

    const lineGeo = new InstancedBufferGeometry();
    lineGeo.instanceCount = count;

    lineGeo.setAttribute("position", new BufferAttribute(origPosArray, 3));
    lineGeo.setAttribute("tubeInfo", new BufferAttribute(posArray, 1));
    lineGeo.setAttribute("angle", new BufferAttribute(angleArray, 1));
    lineGeo.setAttribute("uv", new BufferAttribute(uvArray, 2));

    let offset = [];
    let ddxyz = Math.floor(Math.pow(count, 1 / 3));
    let iii = 0;
    for (let z = 0; z < ddxyz; z++) {
      for (let y = 0; y < ddxyz; y++) {
        for (let x = 0; x < ddxyz; x++) {
          offset.push(
            0.0, //  * (x / ddxyz) * 2.0 - 1.0,
            0.0, //  * (y / ddxyz) * 2.0 - 1.0,
            0.0, //  * (z / ddxyz) * 2.0 - 1.0,
            iii
          );
          iii++;
        }
      }
    }

    // let ddxyz = Math.floor(Math.pow(count, 1 / 2));
    // for (let y = 0; y < ddxyz; y++) {
    //   for (let x = 0; x < ddxyz; x++) {
    //     offset.push(0.0, (x / ddxyz) * 2.0 - 1.0, (y / ddxyz) * 2.0 - 1.0);
    //   }
    // }

    lineGeo.setAttribute(
      "offset",
      new InstancedBufferAttribute(new Float32Array(offset), 4)
    );

    let eachLineIdx = [];
    for (let c = 0; c < count; c++) {
      eachLineIdx.push(c);
    }

    // lineGeo.setAttribute(
    //   "lineIDXER",
    //   new InstancedBufferAttribute(new Float32Array(eachLineIdx), 1)
    // );

    return {
      ...props,
      dataLength: posArray.length,
      geometry: lineGeo,
    };
  }
}
