import { BufferGeometry, Mesh, BufferAttribute, Object3D } from "three";
import { ShaderMaterial, DoubleSide } from "three";
let glsl = (v) => v[0];
class MetaGeometry {
  constructor({ width }) {
    this.width = width;
    let geo = new BufferGeometry();

    geo.setAttribute("position", new BufferAttribute(this.makePos(), 3));
    geo.setAttribute("meta", new BufferAttribute(this.makeMeta(), 4));

    return geo;
  }

  makeMeta() {
    let ARR_VALUE = [];
    let WIDTH = this.width;
    let dimension = Math.floor(Math.pow(WIDTH * WIDTH, 1 / 3));
    let total = dimension * dimension * dimension;
    let iii = 0;
    for (let ix = 0; ix < dimension; ix++) {
      for (let iy = 0; iy < dimension; iy++) {
        for (let iz = 0; iz < dimension; iz++) {
          // console.log(iii)
          let id = iii / 4;

          ARR_VALUE[iii + 0] = id % 6; // square vertex ID
          ARR_VALUE[iii + 1] = Math.floor(id / 6); // square ID
          ARR_VALUE[iii + 2] = total / 6.0; // percentage

          // dot id
          ARR_VALUE[iii + 3] = id; // point ID

          iii += 4;
        }
      }
    }
    return new Float32Array(ARR_VALUE);
  }
  makePos() {
    let ARR_VALUE = [];
    let WIDTH = this.width;
    let dimension = Math.floor(Math.pow(WIDTH * WIDTH, 1 / 3));
    // let total = WIDTH * WIDTH
    let iii = 0;
    for (let ix = 0; ix < dimension; ix++) {
      for (let iy = 0; iy < dimension; iy++) {
        for (let iz = 0; iz < dimension; iz++) {
          // console.log(iii)
          // let id = iii / 4

          ARR_VALUE[iii + 0] = 0; // square vertex ID
          ARR_VALUE[iii + 1] = 0; // square ID
          ARR_VALUE[iii + 2] = 0; // percentage

          iii += 3;
        }
      }
    }
    return new Float32Array(ARR_VALUE);
  }
}

export class MetaFlowerMaterial {
  constructor({ onLoop }) {
    this.onLoop = onLoop;
    let uniforms = {
      time: { value: 0 },
    };

    this.shader = new ShaderMaterial({
      uniforms,
      side: DoubleSide,
      transparent: true,
      vertexShader: MetaFlowerMaterial.vertexShader,
      fragmentShader: MetaFlowerMaterial.fragmentShader,
    });

    this.onLoop(() => {
      uniforms.time.value = window.performance.now() * 0.001;
    });

    return this.shader;
  }
  static vertexShader = glsl`
    uniform float time;
    attribute vec4 meta;
    varying highp vec3 vPos;
    /*
      LIBRARY
    */
    #include <common>

    mat3 rotateX (float rad) {
      float c = cos(rad);
      float s = sin(rad);
      return mat3(
        1.0, 0.0, 0.0,
        0.0, c, s,
        0.0, -s, c
      );
    }

    mat3 rotateY (float rad) {
      float c = cos(rad);
      float s = sin(rad);
      return mat3(
        c, 0.0, -s,
        0.0, 1.0, 0.0,
        s, 0.0, c
      );
    }

    mat3 rotateZ (float rad) {
      float c = cos(rad);
      float s = sin(rad);
      return mat3(
        c, s, 0.0,
        -s, c, 0.0,
        0.0, 0.0, 1.0
      );
    }

    mat3 rotateQ (vec3 axis, float rad) {
      float hr = rad / 2.0;
      float s = sin( hr );
      vec4 q = vec4(axis * s, cos( hr ));
      vec3 q2 = q.xyz + q.xyz;
      vec3 qq2 = q.xyz * q2;
      vec2 qx = q.xx * q2.yz;
      float qy = q.y * q2.z;
      vec3 qw = q.w * q2.xyz;

      return mat3(
        1.0 - (qq2.y + qq2.z),  qx.x - qw.z,            qx.y + qw.y,
        qx.x + qw.z,            1.0 - (qq2.x + qq2.z),  qy - qw.x,
        qx.y - qw.y,            qy + qw.x,              1.0 - (qq2.x + qq2.y)
      );
    }

    void main (void) {
      float vertexIDX = meta.x;
      float squareIDX = meta.y;
      float totalSquares = meta.z;
      float pointIDX = meta.w;
      vec4 pos = vec4(0.0);

      /*
        Assemble
      */
      vec3 plane = vec3(8.0, 8.0, 0.0);
      bool isInvalid = false;

      if (vertexIDX == 0.0) {
        pos.x = 1.0 * plane.x;
        pos.y = 1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else if (vertexIDX == 1.0) {
        pos.x = -1.0 * plane.x;
        pos.y = 1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else if (vertexIDX == 2.0) {
        pos.x = -1.0 * plane.x;
        pos.y = -1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else if (vertexIDX == 3.0) {
        pos.x = 1.0 * plane.x;
        pos.y = 1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else if (vertexIDX == 4.0) {
        pos.x = -1.0 * plane.x;
        pos.y = -1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else if (vertexIDX == 5.0) {
        pos.x = 1.0 * plane.x;
        pos.y = -1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else {
        isInvalid = true;
      }

      if (!isInvalid) {
        float dimension = ceil(pow(totalSquares, 0.5));
        float dX = (squareIDX / dimension) * 2.0 - dimension;
        float dY = (mod(squareIDX, dimension)) * 2.0 - dimension;
        float gapper = 8.0;

        pos.x += dX * gapper;
        pos.y += dY * gapper;

        float pX = pos.x;
        float pY = pos.y;
        float pZ = pos.y;
        float piz = 0.001 * 2.0 * 3.14159265;

        // pos.xyz = rotateQ(normalize(vec3(1.0, pY * piz, 1.0)), time + pY * piz) * rotateY(time + pZ * piz) * pos.xyz;
        // pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pY * piz) * rotateZ(time + pZ * piz) * pos.xyz;

        pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pX * piz) * rotateY(time + pY * piz) * pos.xyz;
        pos.z += sin(time  + pX * piz * 0.333) * 50.0;

        pos.xyz *= 0.017;

        // pos.z += 0.6 * sin(time  + pZ * piz * 0.333 + pX * piz * 0.333) * 150.0;
        // pos.z += 100.0;
        // pos.xyz *= 0.0106375;

        pos.w = 1.0;
      } else {
        pos.w = 0.0;
      }
      vPos = pos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos);

    }
  `;
  static fragmentShader = glsl`
    varying highp vec3 vPos;
    void main (void) {
      vec3 color = vec3(1.0);
      gl_FragColor = vec4(color * vec3(
        abs(vPos.x / 40.0) + 0.2,
        abs(vPos.y / 40.0) + 0.2,
        abs(vPos.z / 40.0) + 0.2
      ), 1.0);
    }
  `;
}

export class MetaShieldMaterial {
  constructor({ onLoop }) {
    this.onLoop = onLoop;
    let uniforms = {
      time: { value: 0 },
    };

    this.shader = new ShaderMaterial({
      uniforms,
      side: DoubleSide,
      transparent: true,
      vertexShader: MetaShieldMaterial.vertexShader,
      fragmentShader: MetaShieldMaterial.fragmentShader,
    });

    this.onLoop(() => {
      uniforms.time.value = window.performance.now() * 0.001;
    });

    return this.shader;
  }
  static vertexShader = glsl`
    uniform float time;
    attribute vec4 meta;
    varying highp vec3 vPos;
    /*
      LIBRARY
    */
    #include <common>

    mat3 rotateX (float rad) {
      float c = cos(rad);
      float s = sin(rad);
      return mat3(
        1.0, 0.0, 0.0,
        0.0, c, s,
        0.0, -s, c
      );
    }

    mat3 rotateY (float rad) {
      float c = cos(rad);
      float s = sin(rad);
      return mat3(
        c, 0.0, -s,
        0.0, 1.0, 0.0,
        s, 0.0, c
      );
    }

    mat3 rotateZ (float rad) {
      float c = cos(rad);
      float s = sin(rad);
      return mat3(
        c, s, 0.0,
        -s, c, 0.0,
        0.0, 0.0, 1.0
      );
    }

    mat3 rotateQ (vec3 axis, float rad) {
      float hr = rad / 2.0;
      float s = sin( hr );
      vec4 q = vec4(axis * s, cos( hr ));
      vec3 q2 = q.xyz + q.xyz;
      vec3 qq2 = q.xyz * q2;
      vec2 qx = q.xx * q2.yz;
      float qy = q.y * q2.z;
      vec3 qw = q.w * q2.xyz;

      return mat3(
        1.0 - (qq2.y + qq2.z),  qx.x - qw.z,            qx.y + qw.y,
        qx.x + qw.z,            1.0 - (qq2.x + qq2.z),  qy - qw.x,
        qx.y - qw.y,            qy + qw.x,              1.0 - (qq2.x + qq2.y)
      );
    }


    #define M_PI 3.1415926535897932384626433832795
    float atan2(in float y, in float x) {
      bool xgty = (abs(x) > abs(y));
      return mix(M_PI/2.0 - atan(x,y), atan(y,x), float(xgty));
    }
    vec3 fromBall(float r, float az, float el) {
      return vec3(
        r * cos(el) * cos(az),
        r * cos(el) * sin(az),
        r * sin(el)
      );
    }
    void toBall(vec3 pos, out float az, out float el) {
      az = atan2(pos.y, pos.x);
      el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
    }
    // float az = 0.0;
    // float el = 0.0;
    // vec3 noiser = vec3(lastVel);
    // toBall(noiser, az, el);
    // lastVel.xyz = fromBall(1.0, az, el);

    vec3 ballify (vec3 pos, float r) {
      float az = atan2(pos.y, pos.x);
      float el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
      return vec3(
        r * cos(el) * cos(az),
        r * cos(el) * sin(az),
        r * sin(el)
      );
    }

    void main (void) {
      float vertexIDX = meta.x;
      float squareIDX = meta.y;
      float totalSquares = meta.z;
      float pointIDX = meta.w;
      vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);

      /*
        Assemble
      */
      vec3 plane = vec3(0.14, 0.14, 0.0);
      bool isInvalid = false;

      if (vertexIDX == 0.0) {
        pos.x = 1.0 * plane.x;
        pos.y = 1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else if (vertexIDX == 1.0) {
        pos.x = -1.0 * plane.x;
        pos.y = 1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else if (vertexIDX == 2.0) {
        pos.x = -1.0 * plane.x;
        pos.y = -1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else if (vertexIDX == 3.0) {
        pos.x = 1.0 * plane.x;
        pos.y = 1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else if (vertexIDX == 4.0) {
        pos.x = -1.0 * plane.x;
        pos.y = -1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else if (vertexIDX == 5.0) {
        pos.x = 1.0 * plane.x;
        pos.y = -1.0 * plane.y;
        pos.z = 1.0 * plane.z;
      } else {
        isInvalid = true;
      }


      if (!isInvalid) {
        float dimension = (pow(totalSquares, 1.0 / 3.0));

        float dX = mod(abs(squareIDX / pow(dimension, 0.0)), dimension) - dimension * 0.5;
        float dY = mod(abs(squareIDX / pow(dimension, 1.0)), dimension) - dimension * 0.5;
        float dZ = mod(abs(squareIDX / pow(dimension, 2.0)), dimension) - dimension * 0.5;

        float gapper = 1.23;

        pos.x += dX * gapper;
        pos.y += dY * gapper;
        pos.z += dZ * gapper;

        float r1 = rand(vec2(dX)) - 0.5;
        float r2 = rand(vec2(dY)) - 0.5;
        float r3 = rand(vec2(dZ)) - 0.5;
        pos += vec4(vec3(r1, r2, r3), 0.0);

        float az = 0.0;
        float el = 0.0;
        toBall(pos.xyz, az, el);
        pos.xyz = fromBall(50.0, az, el);

        float pX = pos.x;
        float pY = pos.y;
        float pZ = pos.z;
        float piz = 0.005 * 2.0 * 3.14159265;

        pos.xyz = rotateQ(normalize(vec3(1.0, pZ * piz, 1.0)), time + pX * piz) * rotateY(time + pY * piz) * pos.xyz;
      }

      if (squareIDX > 1024.0 * 4.5) {
        pos = vec4(0.0);
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos);
      vPos = pos.xyz;
    }
  `;
  static fragmentShader = glsl`
    varying highp vec3 vPos;
    void main (void) {
      vec3 v_tt = normalize(vPos);
      gl_FragColor = vec4(
        0.25 + abs(v_tt.x),
        0.75 + abs(v_tt.y),
        0.25 + abs(v_tt.z),
        0.6
      );
    }
  `;
}

export class EnergyArt extends Object3D {
  static version = "_" + Math.random() * 100000;
  constructor({ renderer, onLoop, onClean }) {
    super();
    this.renderer = renderer;
    this.onClean = onClean;
    this.onLoop = onLoop;
    this.o3d = new Object3D();

    // this.flowerGeo = new MetaGeometry({ width: 512 })
    // this.flowerMat = new MetaFlowerMaterial({ width: 512, onLoop })

    this.shieldGeo = new MetaGeometry({ width: 256 });
    this.shieldMat = new MetaShieldMaterial({ width: 256, onLoop });

    // this.flower = new Mesh(this.flowerGeo, this.flowerMat)
    this.shield = new Mesh(this.shieldGeo, this.shieldMat);

    // this.flower.rotation.x = 1.0
    // this.flower.rotation.z = -0.5
    // this.o3d.add(this.flower)
    this.o3d.add(this.shield);

    this.onClean(() => {
      // this.flowerGeo.dispose()
      this.shieldGeo.dispose();
    });

    this.out = {
      o3d: this.o3d,
    };

    this.add(this.o3d);
  }
}
