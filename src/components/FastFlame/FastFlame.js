// import { PlaneGeometry } from 'three'
import { ShaderMaterial, PlaneGeometry, Points, LineSegments, Object3D } from 'three'
import { Vector2 } from 'three'

let glsl = v => v[0]
export class FastFlame extends Object3D {
  static version = `__${Math.random()}`
  constructor({ renderer, onLoop, camera, onResize, onClean, resX = 128, resY = 128 }) {
    super()
    this.renderer = renderer
    this.onLoop = onLoop
    this.onClean = onClean
    this.onResize = onResize
    this.camera = camera
    this.resX = resX
    this.resY = resY

    let material = new ShaderMaterial({
      transparent: true,
      wireframe: true,
      defines: {
        'isPoint': 'true',
        'pi': Math.PI
      },
      uniforms: {
        opacity: { value: 1 },
        aspect: { value: 1 },
        offset: { value: Math.random() * 1.0 },
        time: { value: null }
      },
      vertexShader: this.getDisplayVert({ height: resY }),
      fragmentShader: this.getDisplayFrag()
    })
    let size = new Vector2(1, 1)
    this.onResize(() => {
      renderer.getSize(size)
      material.uniforms.aspect.value = size.x / size.y
    })

    let geometry = new PlaneGeometry(
      resX * 2 * 2, resY * 2,
      resX * 1 * 2, resY)
    this.output = new LineSegments(geometry, material)

    this.scale.setScalar(0.05)
    material.defines.isPoint = this.output instanceof Points ? 'true' : 'false'

    this.add(this.output)

    this.onLoop(() => {
      let time = window.performance.now() * 0.001
      material.uniforms.time.value = time * 0.43
    })
  }
  setOpacity(v) {
    this.output.material.uniforms.opacity.value = v
  }

  getDisplayVert() {
    return glsl`
      uniform float time;
      uniform float offset;
      uniform float aspect;

      const mat2 m = mat2(0.80,  0.60, -0.60,  0.80);

      float noise(in vec2 p) {
        return sin(p.x)*sin(p.y);
      }

      float fbm4( vec2 p ) {
          float f = 0.0;
          f += 0.5000 * noise( p ); p = m * p * 2.02;
          f += 0.2500 * noise( p ); p = m * p * 2.03;
          f += 0.1250 * noise( p ); p = m * p * 2.01;
          f += 0.0625 * noise( p );
          return f / 0.9375;
      }

      float fbm6( vec2 p ) {
          float f = 0.0;
          f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;
          f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;
          f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;
          f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;
          f += 0.031250*(0.5+0.5*noise( p )); p = m*p*2.01;
          f += 0.015625*(0.5+0.5*noise( p ));
          return f/0.96875;
      }

      float pattern (vec2 p, float time) {
        float vout = fbm4( p + time + fbm6( p + fbm4( p + time )) );
        return (vout);
      }

      // varying vec3 varColor;

      varying vec2 vUv;
      varying vec3 intensity3;
      void main (void) {
        vec4 outputData = vec4(0.0);

        float oTime = time * 0.7 + offset;

        vUv = uv;
        vec3 newPos = position;
        vec3 newNormal = normal;

        float dynamo = 200.0 * (-0.25 + pattern(uv.xy + cos(0.1 + oTime), oTime));
        float dynamo2 = 200.0 * (-0.25 + pattern(uv.yx + cos(0.1 + oTime), oTime));
        newPos.x = mix(position.x, dynamo, 0.0);
        newPos.y = mix(position.y, dynamo, 1.0);
        newPos.z = mix(position.z, dynamo2, 0.3) * -1.0;

        vec4 transformedNormal = vec4(newNormal, 0.);
        vec4 transformedPosition = vec4(newPos, 1.0);
        #ifdef USE_INSTANCING
          transformedNormal = instanceMatrix * transformedNormal;
          transformedPosition = instanceMatrix * transformedPosition;
        #endif

        intensity3 = (normalize(newPos) * 0.5 + 0.5);

        vec4 mvPosition = modelViewMatrix * vec4( transformedPosition.xyz, 1.0 );
        vec4 worldPosition = modelMatrix * vec4( transformedPosition.xyz, 1.0 );
        vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * transformedNormal.xyz );

        // vec3 I = worldPosition.xyz - cameraPosition;
        // varColor = refract(normalize(I), worldNormal, 1.03);

        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = (1.0 + 1.5 * aspect);
      }
    `
  }

  getDisplayFrag() {
    return glsl`
      #include <common>
      uniform float time;
      uniform float offset;
      uniform float opacity;

      const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

      float noise( in vec2 p ) {
        return sin(p.x)*sin(p.y);
      }

      float fbm4( vec2 p ) {
        float f = 0.0;
        f += 0.5000 * noise( p ); p = m * p * 2.02;
        f += 0.2500 * noise( p ); p = m * p * 2.03;
        f += 0.1250 * noise( p ); p = m * p * 2.01;
        f += 0.0625 * noise( p );
        return f / 0.9375;
      }

      float fbm6( vec2 p ) {
        float f = 0.0;
        f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;
        f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;
        f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;
        f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;
        f += 0.031250*(0.5+0.5*noise( p )); p = m*p*2.01;
        f += 0.015625*(0.5+0.5*noise( p ));
        return f/0.96875;
      }

      float pattern (vec2 p) {
        float vout = fbm4(p / fbm6(p));
        return (vout);
      }

      varying vec2 vUv;

      varying vec3 intensity3;

      void main (void) {
        float oTime = time;

        float rx = pattern(vUv.xy + sin((0.01 + 0.1) * 2.0 * pi + oTime * 2.0));
        float ry = pattern(vUv.xy + sin((0.0 + 0.1) * 2.0 * pi + oTime * 2.0));
        float rz = pattern(vUv.xy + sin((-0.01 + 0.1) * 2.0 * pi + oTime * 2.0));

        if (isPoint) {
          float hpt = length(gl_PointCoord.xy - 0.5);
          if (hpt <= 0.5) {
            gl_FragColor = vec4(vec3(rx, ry, rz) * 0.5 + 0.25, 0.333 * opacity);
          } else {
            discard;
          }
        } else {
          gl_FragColor = vec4(vec3(rx, ry, rz) * vec3(rx, ry, rz) * 4.5 * 
          vec3(
            pow(intensity3.y, 0.7 + 0.35),
            pow(intensity3.y, 0.7),
            pow(intensity3.y, 0.7 - 0.35)
          ), 0.333 * opacity);
        }
      }
    `
  }
}