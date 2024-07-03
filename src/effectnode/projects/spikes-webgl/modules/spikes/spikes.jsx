import {
  CircleGeometry,
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
  SpriteMaterial,
  TextureLoader,
  Vector3,
} from "three";
import { GPUComputationRenderer } from "./GPUComputationRenderer.js";
import gpgpu from "./gpgpu.frag";
// import displayVert from "./display-v.vert";
// import displayFrag from "./display-f.frag";
// import { Points } from "three";
export class Spike extends Object3D {
  static uuid = Math.random();
  constructor({ ui, renderer, pointer }) {
    super();
    let object = this;

    function prepIndexer(texture, SIZE) {
      let pixels = texture.image.data;
      let p = 0;
      let max = SIZE * SIZE;
      for (let j = 0; j < max; j++) {
        pixels[p + 0] = j;
        pixels[p + 1] = j / max;
        pixels[p + 2] = SIZE;
        pixels[p + 3] = 1.0;
        p += 4;
      }
    }

    let ticker = 0;
    let SIZE = 512;

    let gpuCompute = new GPUComputationRenderer(SIZE, SIZE, renderer);

    let indexerTexture = gpuCompute.createTexture();
    prepIndexer(indexerTexture, SIZE);

    let pingTarget = gpuCompute.createRenderTarget();
    let pongTarget = gpuCompute.createRenderTarget();

    let pingMat, pongMat;
    let mouseV3 = new Vector3(0.0, 0.0, 0.0);

    let initPingPong = ({ pingPongShader }) => {
      try {
        let newPingMat = gpuCompute.createShaderMaterial(pingPongShader, {
          lastTexture: { value: null },
          indexerTexture: { value: indexerTexture },
          time: { value: 0 },
          mouse: { value: mouseV3 },
        });
        let newPongMat = gpuCompute.createShaderMaterial(pingPongShader, {
          lastTexture: { value: null },
          indexerTexture: { value: indexerTexture },
          time: { value: 0 },
          mouse: { value: mouseV3 },
        });
        pingMat = newPingMat;
        pongMat = newPongMat;
      } catch (e) {
        console.error(e);
      }
    };
    initPingPong({ pingPongShader: gpgpu });

    // env.getCode("gpgpu").stream((code) => {
    // });

    // sim part
    let procSim = () => {
      pingMat.uniforms.lastTexture.value = pongTarget.texture;
      pongMat.uniforms.lastTexture.value = pingTarget.texture;

      pingMat.uniforms.time.value = window.performance.now() * 0.0001;
      pongMat.uniforms.time.value = window.performance.now() * 0.0001;
    };
    // let mainColor = new Color("#ffffff");

    // env.getSetting("main-color").stream((v) => {
    //   mainColor.set(v);
    // }, "hex");
    // let tCube = await env.getAnyCode("canvas-texture", "main").run(api);

    // display part

    //

    //
    // let geometry = new PlaneGeometry(1.0, 1.0, SIZE - 1, SIZE - 1);
    // let makeMaterial = () => {
    //   let rect = renderer.domElement.getBoundingClientRect();
    //   let displayV = displayVert;
    //   let displayF = displayFrag;

    //   return new ShaderMaterial({
    //     // blending: AdditiveBlending,
    //     transparent: true,
    //     depthWrite: false,
    //     depthTest: false,
    //     vertexShader: displayV,
    //     fragmentShader: displayF,
    //     defines: {
    //       aspectRatio: `${Number(rect.width / rect.height).toFixed(1)}`,
    //       resolution:
    //         "vec2( " +
    //         rect.width.toFixed(1) +
    //         ", " +
    //         rect.height.toFixed(1) +
    //         " )",
    //     },
    //     uniforms: {
    //       mainColor: { value: mainColor },

    //       time: { value: 0 },
    //       opacity: { value: 0.5 },
    //       posTex: { value: null },

    //       tCube: { value: tCube },

    //       indexerTexture: { value: indexerTexture },
    //       pointSize: { value: window.devicePixelRatio || 1.0 },
    //     },
    //   });
    // };

    // let material = makeMaterial();
    // let points = new Points(geometry, material);

    // // env.getCode("display-v").stream(() => {
    // //   material = makeMaterial();
    // //   points.material = material;
    // // });
    // // env.getCode("display-f").stream(() => {
    // //   material = makeMaterial();
    // //   points.material = material;
    // // });

    // // let points = ev.points = new Points(geometry, material)
    // points.matrixAutoUpdate = true;
    // points.updateMatrix();
    // points.frustumCulled = false;
    //
    //
    //
    //
    //
    //

    //
    //
    //
    //
    //
    //
    let iGeo = new InstancedBufferGeometry();
    let count = SIZE * SIZE;
    iGeo.instanceCount = count;
    iGeo.copy(new CircleGeometry(0.05 / 2, 8, 8));
    let myUVData = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        myUVData.push(x / SIZE, y / SIZE);
      }
    }
    iGeo.setAttribute(
      "myUV",
      new InstancedBufferAttribute(new Float32Array(myUVData), 2)
    );
    iGeo.instanceCount = count;
    iGeo.needsUpdate = true;

    //

    let time = { value: 0 };
    let posTex = { value: null };
    let ptSprite = new Mesh(iGeo);
    import("../../assets/png/sprite1.png")
      .then((r) => r.default)
      .then((r) => {
        //
        ptSprite.material = new MeshBasicMaterial({
          color: new Color("#ffffff"),
          map: new TextureLoader().load(`${r}`),
          transparent: true,
          opacity: 1,
          depthWrite: false,
          depthTest: false,
        });

        ptSprite.material.uniforms = {
          posTex: posTex,
        };

        ptSprite.material.onBeforeCompile = (shader, renderer) => {
          // console.log(shader);

          let glsl = (v) => v[0];

          shader.uniforms.posTex = posTex;
          shader.uniforms.color1 = {
            value: new Color(ui.spikeColor),
          };
          shader.uniforms.color2 = {
            value: new Color(ui.sphereColor),
          };

          ui.on("ballColor", (val) => {
            shader.uniforms.color1.value.set(val);
          });
          ui.on("spikeColor", (val) => {
            shader.uniforms.color2.value.set(val);
          });

          shader.vertexShader = glsl`
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
attribute vec2 myUV;
varying vec2 myVUV;
uniform sampler2D posTex;

uniform vec3 color1;
uniform vec3 color2;
varying vec3 vReflect;

void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	// __include <begin_vertex>

  vec4 pos = texture2D(posTex, myUV);
  vec3 transformed = pos.rgb + position.xyz;

  myVUV = myUV;


  #include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>

  vec4 mvPosition2 = modelViewMatrix * vec4( transformed.xyz, 1.0 );
  vec4 worldPosition = modelMatrix * vec4( transformed.xyz, 1.0 );

  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  vec3 I = worldPosition.xyz - cameraPosition;
  vReflect = reflect( I, worldNormal );


  gl_Position = projectionMatrix * mvPosition2;

  //
}

`;

          shader.fragmentShader = glsl`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

uniform float time;
uniform vec3 color1;
uniform vec3 color2;
varying vec2 myVUV;
uniform sampler2D posTex;



#define M_PI 3.1415926535897932384626433832795
float atan2(in float y, in float x) {
  bool xgty = (abs(x) > abs(y));
  return mix(M_PI/2.0 - atan(x,y), atan(y,x), float(xgty));
}
vec3 ballify (vec3 pos, float r) {
  float az = atan2(pos.y, pos.x);
  float el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
  return vec3(
    r * cos(el) * cos(az),
    r * cos(el) * sin(az),
    r * sin(el)
  );
}


mat3 rotateZ(float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat3(
      c, s, 0.0,
      -s, c, 0.0,
      0.0, 0.0, 1.0
  );
}

mat3 rotateY(float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat3(
      c, 0.0, -s,
      0.0, 1.0, 0.0,
      s, 0.0, c
  );
}

mat3 rotateX(float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat3(
      1.0, 0.0, 0.0,
      0.0, c, s,
      0.0, -s, c
  );
}


void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );

  vec4 pos = texture2D(posTex, myVUV);

  diffuseColor.rgb = mix(color1, color2, rand(myVUV.xy));

  vec3 colorPos = abs(ballify(pos.rgb, 0.5)+ 0.5);
  
  diffuseColor.rgb *= colorPos.rgb;

  diffuseColor.rgb += 0.15;

  #include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_MAP

    vec4 sampledDiffuseColor = texture2D( map, vMapUv );

      #ifdef DECODE_VIDEO_TEXTURE

        // use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

        sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
      
      #endif  

    float avgColor = (sampledDiffuseColor.r + sampledDiffuseColor.g + sampledDiffuseColor.b) / 3.0;

    diffuseColor.rgb *= vec3(avgColor);
    // diffuseColor.a *= sampledDiffuseColor.a;

  #endif


	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}`;
        };
        //
      });

    this.add(ptSprite);

    this.compute = () => {
      procSim();

      if (ticker % 2 === 0) {
        gpuCompute.doRenderTarget(pongMat, pongTarget);
      } else {
        gpuCompute.doRenderTarget(pingMat, pingTarget);
      }

      if (ticker % 2 === 0) {
        // material.uniforms.posTex.value = pongTarget.texture;
        posTex.value = pongTarget.texture;
      } else {
        // material.uniforms.posTex.value = pingTarget.texture;
        posTex.value = pingTarget.texture;
      }
      ticker++;

      time.value = window.performance.now() * 0.0001;
      // material.uniforms.time.value = window.performance.now() * 0.0001;

      mouseV3.x = pointer.x;
      mouseV3.y = pointer.y;
    };
    // object.display = points;
    object.mouse = mouseV3;

    // this.add(points);
  }
}
