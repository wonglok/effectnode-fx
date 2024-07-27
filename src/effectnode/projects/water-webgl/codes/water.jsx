// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// useEffect, useRef, useState
//

import { useFrame, useThree } from "@react-three/fiber";
import { XROrigin } from "@react-three/xr";
import { Suspense, useEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  CircleGeometry,
  FrontSide,
  IcosahedronGeometry,
  MeshStandardMaterial,
  NoBlending,
  SpriteMaterial,
  Uniform,
  Vector3,
} from "three";
import {
  Color,
  DataTexture,
  DoubleSide,
  FloatType,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  RGBAFormat,
  SphereGeometry,
  WebGLRenderer,
} from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";

//
function Content3D() {
  let dx = 10;
  let dy = 10;
  let dz = 10;

  let offsetGrid = useMemo(() => {
    return new Vector3(dx * -0.5, 0, dz * -0.5 - 7);
  }, [dx, dz]);

  let gravityFactor = useMemo(() => {
    return new Uniform(1.0);
  }, []);
  let pressureFactor = useMemo(() => {
    return new Uniform(1.0);
  }, []);

  let pz = 256;
  let px = Math.pow(pz, 1 / 2);
  let py = Math.pow(pz, 1 / 2);

  let [{ mounter, show }] = useMemo(() => {
    let mounter = new Object3D();
    let show = <primitive object={mounter}></primitive>;
    return [
      {
        mounter,
        show,
      },
    ];
  }, []);
  let gl = useThree((r) => r.gl);
  let onRender = useRef(() => {});
  useEffect(() => {
    let cleans = [];
    let canRun = true;
    //
    // -  - //
    //
    let coordFunctions = ({
      px,
      py,
      pz,
      //
      dx,
      dy,
      dz,
    }) => `

    #define bounds vec3(${dx.toFixed(1)}, ${dy.toFixed(1)}, ${dz.toFixed(1)})
    #define particles vec3(${px.toFixed(1)}, ${py.toFixed(1)}, ${pz.toFixed(1)})

     vec3 uvToWorld (vec2 uv, vec3 grid) {
        // grid
        float dx = grid.x;
        float dy = grid.y;
        float dz = grid.z;

        // uv to 3d
        float uvx = uv.x;
        float uvy = uv.y;
        float tx = uvx * dx * dz;
        float ty = uvy * dy;
        
        float dxdz = tx;
        float _3dx = floor(dxdz / dz);
        float _3dy = floor(ty);
        float _3dz = floor(dxdz / dx);

        return vec3(_3dx, _3dy, _3dz);
    }

    vec2 worldToUV (vec3 pos, vec3 grid) {
        float _3dx = pos.x;
        float _3dy = pos.y;
        float _3dz = pos.z;

        float dx = grid.x;
        float dy = grid.y;
        float dz = grid.z;

        // 3d to uv
        vec2 myUV = vec2(
            floor(_3dx + _3dz * dz) / (dx * dz),
            floor(_3dy) / dy
        );

        return myUV;
    }
    `;

    ///////////
    ///////////
    ///////////
    ///////////
    ///////////
    // particle

    let pw = px * py;
    let ph = pz;
    let COUNT_PARTICLE = pw * ph;

    let gpuParticle = new GPUComputationRenderer(pw, ph, gl);

    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////

    let particlePositionShader = `
        #define iResolution vec2(${pw.toFixed(0)}, ${ph.toFixed(0)})

        #define boundMax vec3(${dx.toFixed(1)},${dy.toFixed(1)},${dz.toFixed(1)})
        #define boundMin vec3(${(0).toFixed(1)},${(0).toFixed(1)},${(0).toFixed(1)})

        void main (void) {
            vec2 myUV = gl_FragCoord.xy / iResolution;
            
            vec4 particlePositionData = texture2D(particlePosition, myUV);
            vec4 particleVelocityData = texture2D(particleVelocity, myUV);
            
            vec3 outputPos = particlePositionData.rgb;

            outputPos += particleVelocityData.rgb;
            
            if (outputPos.x >= boundMax.x) {
                outputPos.x = boundMax.x;
            }
            if (outputPos.y >= boundMax.y) {
                outputPos.y = boundMax.y;
            }
            if (outputPos.z >= boundMax.z) {
                outputPos.z = boundMax.z;
            }

            if (outputPos.x <= boundMin.x) {
                outputPos.x = boundMin.x;
            }
            if (outputPos.y <= boundMin.y) {
                outputPos.y = boundMin.y;
            }
            if (outputPos.z <= boundMin.z) {
                outputPos.z = boundMin.z;
            }

            gl_FragColor = vec4(outputPos.rgb, 1.0);
        }
    `;

    let particleColorInitTex = gpuParticle.createTexture();
    let particlePositionInitTex = gpuParticle.createTexture();
    {
      let arr2 = particleColorInitTex.image.data;

      let arr = particlePositionInitTex.image.data;
      let i = 0;
      for (let z = 0; z < pz; z++) {
        for (let y = 0; y < py; y++) {
          for (let x = 0; x < px; x++) {
            let r = Math.random();
            arr[i * 4 + 0] = dx * r;
            arr[i * 4 + 1] = dy * Math.random();
            arr[i * 4 + 2] = dz * Math.random();
            arr[i * 4 + 3] = 0;

            let color = ["#00ffff", "#0000ff", "#ff00ff"];
            let idx = Math.floor(color.length * r);
            let current = new Color()
              .set(color[idx])
              .convertLinearToSRGB()
              .offsetHSL(0, -0.05, 0.0);
            arr2[i * 4 + 0] = current.r;
            arr2[i * 4 + 1] = current.g;
            arr2[i * 4 + 2] = current.b;
            arr2[i * 4 + 3] = 0;

            i++;
          }
        }
      }
      particlePositionInitTex.needsUpdate = true;
      particleColorInitTex.needsUpdate = true;
    }

    let particlePositionVar = gpuParticle.addVariable(
      "particlePosition",
      particlePositionShader,
      particlePositionInitTex
    );
    particlePositionVar.material.uniforms.delta = { value: 0 };

    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    let particleVelocityShader = `
        #define iResolution vec2(${pw.toFixed(0)}, ${pw.toFixed(0)})

        #define boundMax vec3(${dx.toFixed(1)},${dy.toFixed(1)},${dz.toFixed(1)})
        #define boundMin vec3(${(0).toFixed(1)},${(0).toFixed(1)},${(0).toFixed(1)})

        ${coordFunctions({
          px,
          py,
          pz,
          dx,
          dy,
          dz,
        })}

        uniform float delta;
        uniform sampler2D gridTex;
        uniform vec3 pointerWorld;

        uniform float gravityFactor;
        uniform float pressureFactor;
        
      
        float sdSphere( vec3 p, float s )
        {
          return length(p)-s;
        }
          
        void main (void) {
            vec2 myUV = gl_FragCoord.xy / iResolution;

            vec4 particlePositionData = texture2D(particlePosition, myUV);
            vec4 particleVelocityData = texture2D(particleVelocity, myUV);

            vec3 outputPos = particlePositionData.rgb;
            vec3 outputVel = particleVelocityData.rgb;

            for (int z = -3; z <= 3; z++) {
              for (int y = -3; y <= 3; y++) {
                for (int x = -3; x <= 3; x++) {

                  if (x == 0 && y == 0 && z == 0) {
                    continue;
                  }
                
                  vec3 centerPos = outputPos;

                  vec3 sidePos = vec3(
                    float(x), 
                    float(y), 
                    float(z)
                  ) + floor(outputPos) + 0.5;

                  vec2 particleUV = worldToUV(sidePos, particles);
                  vec3 worldPositionSlot = uvToWorld(particleUV, bounds);
                  
                  worldPositionSlot.x = max(min(worldPositionSlot.x, bounds.x), 0.0);
                  worldPositionSlot.y = max(min(worldPositionSlot.y, bounds.y), 0.0);
                  worldPositionSlot.z = max(min(worldPositionSlot.z, bounds.z), 0.0);
                  
                  vec2 slotUV = worldToUV(worldPositionSlot, bounds);

                  vec4 slot = texture2D(gridTex, slotUV);

                  vec4 posData = texture2D(particlePosition, particleUV);

                  float pressure = slot.r;

                  //////

                  vec3 diff = vec3(sidePos.rgb - centerPos.rgb);

                  outputVel += diff * -0.0001 * pressure * delta * pressureFactor;
                  
                  /////
                }
              }
            }

            // gravityFactor
            outputVel.y += -0.025 * gravityFactor * delta * outputPos.y;


            // mouse
            float mouseRadius = 3.3333;
            float mouseForceSize = sdSphere(pointerWorld, mouseRadius);
            vec3 normalParticleMouse = normalize(outputPos.rgb - pointerWorld);
            
            if (length(pointerWorld - outputPos) <= mouseRadius) {
              outputVel.rgb += normalParticleMouse * mouseForceSize * delta * 0.075;
            }
       

            if (outputPos.x >= boundMax.x) {
                outputVel.x += -1.0 * delta;
                // outputVel.x *= delta * 0.5;
            }
            if (outputPos.y >= boundMax.y) {
                outputVel.y += -1.0 * delta;
                // outputVel.y *= delta * 0.5;
            }
            if (outputPos.z >= boundMax.z) {
                outputVel.z += -1.0 * delta;
                // outputVel.z *= delta * 0.5;
            }

            if (outputPos.x <= boundMin.x) {
                outputVel.x += 1.0 * delta;
                // outputVel.x *= delta * 0.5;
            }
            if (outputPos.y <= boundMin.y) {
                outputVel.y += 1.0 * delta;
                // outputVel.y *= delta * 0.5;
            }
            if (outputPos.z <= boundMin.z) {
                outputVel.z += 1.0 * delta;
                // outputVel.z *= delta * 0.5;
            }

            gl_FragColor = vec4(outputVel.rgb, 1.0);
        }
    `;

    let particleVelocityInitTex = gpuParticle.createTexture();
    {
      let i = 0;
      let arr = particleVelocityInitTex.image.data;
      for (let z = 0; z < pz; z++) {
        for (let y = 0; y < py; y++) {
          for (let x = 0; x < px; x++) {
            arr[i * 4 + 0] = 0;
            arr[i * 4 + 1] = 0;
            arr[i * 4 + 2] = 0;
            arr[i * 4 + 3] = 1;

            i++;
          }
        }
      }
      particleVelocityInitTex.needsUpdate = true;
    }

    let particleVelocityVar = gpuParticle.addVariable(
      "particleVelocity",
      particleVelocityShader,
      particleVelocityInitTex
    );
    particleVelocityVar.material.uniforms.delta = { value: 0 };
    particleVelocityVar.material.uniforms.pointerWorld = {
      value: new Vector3(),
    };
    particleVelocityVar.material.uniforms.pressureFactor = pressureFactor;
    particleVelocityVar.material.uniforms.gravityFactor = gravityFactor;
    let hh = ({ detail }) => {
      if (!canRun) {
        return;
      }
      particleVelocityVar.material.uniforms.pointerWorld.value.fromArray(
        detail
      );
      particleVelocityVar.material.uniforms.pointerWorld.value.sub(offsetGrid);
    };
    window.addEventListener("pointerWorld", hh);

    cleans.push(() => {
      window.removeEventListener("pointerWorld", hh);
    });

    //

    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////

    gpuParticle.setVariableDependencies(particlePositionVar, [
      particlePositionVar,
      particleVelocityVar,
    ]);
    gpuParticle.setVariableDependencies(particleVelocityVar, [
      particleVelocityVar,
      particlePositionVar,
    ]);

    let err2 = gpuParticle.init();
    if (err2) {
      console.error(err2);
      return;
    }

    //////////////////////////////////////////////////////////////////////
    ///////////
    ///////////
    /////////////////////////
    // - particle to uvs - //
    /////////////////////////

    ///////////
    ///////////
    ///////////////
    // - slots - //
    ///////////////

    let tx = dx * dz;
    let ty = dy;

    let slotComputeGPU = new GPUComputationRenderer(tx, ty, gl);
    let slotComputeShader = `
        #define iResolution vec2(${tx.toFixed(0)}, ${ty.toFixed(0)})

        ${coordFunctions({
          px,
          py,
          pz,
          dx,
          dy,
          dz,
        })}

        uniform sampler2D particlePositionTex;
        uniform sampler2D particleVelocityTex;

        void main (void) {
            //

            float uvx = gl_FragCoord.x / iResolution.x;
            float uvy = gl_FragCoord.y / iResolution.y;

            vec2 uv = vec2(uvx, uvy);

            vec3 worldPos = uvToWorld(uv, bounds);

            float counter = 0.0;
            vec3 velocity = vec3(0.0);
            for (int z = 0; z < ${pz.toFixed(0)}; z++) {
              for (int y = 0; y < ${py.toFixed(0)}; z++) {
                for (int x = 0; x < ${px.toFixed(0)}; z++) {
                  //
                  //
                  vec4 parPosData = texture2D(particlePositionTex, 
                    worldToUV(vec3(float(x), float(y), float(z)), particles)
                  );

                  //
                  if (
                    true 
                    && parPosData.x >= floor(worldPos.x - 5.0)
                    && parPosData.x <= floor(worldPos.x + 5.0)
                    //
                    && parPosData.y >= floor(worldPos.y - 5.0)
                    && parPosData.y <= floor(worldPos.y + 5.0)
                    //
                    && parPosData.z >= floor(worldPos.z - 5.0)
                    && parPosData.z <= floor(worldPos.z + 5.0)
                    //
                  ) {
                    counter += 1.0;
                  }
                }
              }
            }

            gl_FragColor = vec4(counter);

            ///////////

            ///////////
        }
    `;

    //
    //
    let uvTex = slotComputeGPU.createTexture();
    let vec4UV = [];
    for (let z = 0; z < dz; z++) {
      let i = 0;
      for (let y = 0; y < dy; y++) {
        for (let x = 0; x < dx; x++) {
          ///
          vec4UV.push(i / (dx * dy), z / dz, 0, 0);
          i++;
        }
      }
    }
    {
      for (let i = 0; i < vec4UV.length; i++) {
        uvTex.image.data[i] = vec4UV[i];
      }
      uvTex.needsUpdate = true;
    }
    //
    //

    let slotInitTex = slotComputeGPU.createTexture();
    {
      let arr = slotInitTex.image.data;

      let i = 0;
      for (let y = 0; y < ty; y++) {
        for (let x = 0; x < tx; x++) {
          arr[i * 4 + 0] = 0;
          arr[i * 4 + 1] = 0;
          arr[i * 4 + 2] = 0;
          arr[i * 4 + 3] = 0;

          i++;
        }
      }
      slotInitTex.needsUpdate = true;
    }

    let slotComputeVar = slotComputeGPU.addVariable(
      "slot",
      slotComputeShader,
      slotInitTex
    );

    slotComputeVar.material.uniforms.uvTex = { value: uvTex };
    slotComputeVar.material.uniforms.particlePositionTex = {
      value() {
        return gpuParticle.getCurrentRenderTarget(particlePositionVar).texture;
      },
    };
    slotComputeVar.material.uniforms.particleVelocityTex = {
      value() {
        return gpuParticle.getCurrentRenderTarget(particleVelocityVar).texture;
      },
    };

    let err = slotComputeGPU.init();
    if (err) {
      console.error(err);
      return;
    }

    //////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////
    ///////////
    ///////////
    ///////////
    ///////////
    ///////////////
    // - render kernel - //
    ///////////////

    onRender.current = (st, dt) => {
      if (dt >= 1) {
        dt = 1;
      }

      slotComputeGPU.compute();
      particlePositionVar.material.uniforms.delta.value = dt;
      particleVelocityVar.material.uniforms.delta.value = dt;
      gpuParticle.compute();
    };

    //////////////////////////////////////////////////////////////////////
    ////// RENDER ////////
    //////////////////////////////////////////////////////////////////////

    {
      //
      //
      //
      //

      let uv = [];
      for (let z = 0; z < pz; z++) {
        let i = 0;
        for (let y = 0; y < py; y++) {
          for (let x = 0; x < px; x++) {
            uv.push(
              //
              i / (px * py),
              z / pz
              //
            );
            i++;
          }
        }
      }

      let offset = [];
      for (let i = 0; i < COUNT_PARTICLE; i++) {
        //
        offset.push(0, 0, 0);
        //
      }

      //
      //
      //
      let ibg = new InstancedBufferGeometry();
      ibg.copy(new IcosahedronGeometry(1, 0));
      ibg.scale(0.075, 0.075, 0.075);
      //
      ibg.instanceCount = COUNT_PARTICLE;

      //////////
      ibg.setAttribute(
        "offsetPositionAttr",
        new InstancedBufferAttribute(new Float32Array(offset), 3)
      );

      //////////
      ibg.setAttribute(
        "offsetUV",
        new InstancedBufferAttribute(new Float32Array(uv), 2)
      );
      ibg.needsUpdate = true;

      let mat = new MeshStandardMaterial({
        flatShading: true,
        color: new Color("#ffffff"),
        emissive: new Color("#000000"),
        metalness: 0.0,
        roughness: 0.0,
        transparent: true,
        opacity: 0.5,
        side: FrontSide,
        transparent: true,
        depthWrite: true,
      });

      mat.onBeforeCompile = (shader, renderer) => {
        shader.uniforms.particleColor = {
          get value() {
            return particleColorInitTex;
          },
        };
        shader.uniforms.particlePosition = {
          get value() {
            return gpuParticle.getCurrentRenderTarget(particlePositionVar)
              .texture;
          },
        };
        shader.uniforms.particleVelocity = {
          get value() {
            return gpuParticle.getCurrentRenderTarget(particleVelocityVar)
              .texture;
          },
        };

        shader.vertexShader = /* glsl */ `
        #define STANDARD

varying vec3 vViewPosition;

#ifdef USE_TRANSMISSION

	varying vec3 vWorldPosition;

#endif

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

attribute vec2 offsetUV;
uniform sampler2D particlePosition;
uniform sampler2D particleVelocity;
uniform sampler2D particleColor;

varying vec4 vColorRGBA;
varying vec3 vVel;
varying vec2 vMyUV;
void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	//#include <begin_vertex>

  vec4 offsetPos = texture2D(particlePosition, offsetUV);
  vec4 offsetVel = texture2D(particlePosition, offsetUV);
  vec4 offsetColor = texture2D(particleColor, offsetUV);

  vMyUV = offsetUV;

  vColorRGBA = offsetColor.rgba;
  vVel = offsetVel.rgb;

    vec3 transformed = vec3( position + offsetPos.rgb );

    #ifdef USE_ALPHAHASH
    
        vPosition = vec3( position );
    
    #endif

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

#ifdef USE_TRANSMISSION

	vWorldPosition = worldPosition.xyz;

#endif
}
        `;

        shader.fragmentShader = /* glsl */ `
        varying vec3 vVel;
        varying vec4 vColorRGBA;
        varying vec2 vMyUV;

        uniform sampler2D particleColor;

        #define STANDARD
        
        #ifdef PHYSICAL
            #define IOR
            #define USE_SPECULAR
        #endif
        
        uniform vec3 diffuse;
        uniform vec3 emissive;
        uniform float roughness;
        uniform float metalness;
        uniform float opacity;

        
        #ifdef IOR
            uniform float ior;
        #endif
        
        #ifdef USE_SPECULAR
            uniform float specularIntensity;
            uniform vec3 specularColor;
        
            #ifdef USE_SPECULAR_COLORMAP
                uniform sampler2D specularColorMap;
            #endif
        
            #ifdef USE_SPECULAR_INTENSITYMAP
                uniform sampler2D specularIntensityMap;
            #endif
        #endif
        
        #ifdef USE_CLEARCOAT
            uniform float clearcoat;
            uniform float clearcoatRoughness;
        #endif
        
        #ifdef USE_DISPERSION
            uniform float dispersion;
        #endif
        
        #ifdef USE_IRIDESCENCE
            uniform float iridescence;
            uniform float iridescenceIOR;
            uniform float iridescenceThicknessMinimum;
            uniform float iridescenceThicknessMaximum;
        #endif
        
        #ifdef USE_SHEEN
            uniform vec3 sheenColor;
            uniform float sheenRoughness;
        
            #ifdef USE_SHEEN_COLORMAP
                uniform sampler2D sheenColorMap;
            #endif
        
            #ifdef USE_SHEEN_ROUGHNESSMAP
                uniform sampler2D sheenRoughnessMap;
            #endif
        #endif
        
        #ifdef USE_ANISOTROPY
            uniform vec2 anisotropyVector;
        
            #ifdef USE_ANISOTROPYMAP
                uniform sampler2D anisotropyMap;
            #endif
        #endif
        
        varying vec3 vViewPosition;
        
        #include <common>
        #include <packing>
        #include <dithering_pars_fragment>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>
        #include <map_pars_fragment>
        #include <alphamap_pars_fragment>
        #include <alphatest_pars_fragment>
        #include <alphahash_pars_fragment>
        #include <aomap_pars_fragment>
        #include <lightmap_pars_fragment>
        #include <emissivemap_pars_fragment>
        #include <iridescence_fragment>
        #include <cube_uv_reflection_fragment>
        #include <envmap_common_pars_fragment>
        #include <envmap_physical_pars_fragment>
        #include <fog_pars_fragment>
        #include <lights_pars_begin>
        #include <normal_pars_fragment>
        #include <lights_physical_pars_fragment>
        #include <transmission_pars_fragment>
        #include <shadowmap_pars_fragment>
        #include <bumpmap_pars_fragment>
        #include <normalmap_pars_fragment>
        #include <clearcoat_pars_fragment>
        #include <iridescence_pars_fragment>
        #include <roughnessmap_pars_fragment>
        #include <metalnessmap_pars_fragment>
        #include <logdepthbuf_pars_fragment>
        #include <clipping_planes_pars_fragment>
        

        void main() {
        
            vec4 diffuseColor = vec4( diffuse, opacity );
            #include <clipping_planes_fragment>
        
            ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
            vec3 totalEmissiveRadiance = emissive;
        
            #include <logdepthbuf_fragment>
            #include <map_fragment>
            #include <color_fragment>
            #include <alphamap_fragment>
            #include <alphatest_fragment>
            #include <alphahash_fragment>
            #include <roughnessmap_fragment>
            #include <metalnessmap_fragment>
            #include <normal_fragment_begin>
            #include <normal_fragment_maps>
            #include <clearcoat_normal_fragment_begin>
            #include <clearcoat_normal_fragment_maps>
            #include <emissivemap_fragment>
        
            // accumulation
            #include <lights_physical_fragment>
            #include <lights_fragment_begin>
            #include <lights_fragment_maps>
            #include <lights_fragment_end>
        
            // modulation
            #include <aomap_fragment>
        
            vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
            vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
        
            #include <transmission_fragment>

            vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
        
            #ifdef USE_SHEEN
        
                // Sheen energy compensation approximation calculation can be found at the end of
                // https://drive.google.com/file/d/1T0D1VSyR4AllqIJTQAraEIzjlb5h4FKH/view?usp=sharing
                float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
        
                outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
        
            #endif
        
            #ifdef USE_CLEARCOAT
        
                float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
        
                vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
        
                outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
        
            #endif

            
            #ifdef OPAQUE
              diffuseColor.a = 1.0;
            #endif

            #ifdef USE_TRANSMISSION
              diffuseColor.a *= material.transmissionAlpha;
            #endif

            vec4 offsetColor = texture2D(particleColor, vMyUV);


            gl_FragColor = vec4( offsetColor.rgb * outgoingLight.rgb, diffuseColor.a );

            //include <opaque_fragment>
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
            #include <fog_fragment>
            #include <premultiplied_alpha_fragment>
            #include <dithering_fragment>

            // gl_FragColor.rgb = (offsetColor.rgb);
          }
        `;
      };
      let mesh = new Mesh(ibg, mat);
      mesh.frustumCulled = false;

      mounter.clear();
      mounter.add(mesh);

      //
      //
      //
    }
    //

    return () => {
      canRun = false;
      cleans.forEach((it) => {
        it();
      });
    };
  }, [dx, dy, dz, gl, mounter, offsetGrid, px, py, pz]);

  useFrame((st, dt) => {
    onRender.current(st, dt);
  });
  return (
    <>
      {/*  */}

      <group position={offsetGrid.toArray()}>{show}</group>

      {/* <XROrigin position={[0, 10, 50]} /> */}
      {/*  */}
    </>
  );
}

export function ToolBox({}) {
  return (
    <>
      {/*  */}

      {/*  */}
    </>
  );
}

export function Runtime({ ui, io, useStore, onLoop }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);
  //   let InsertHTML = useStore((r) => r.InsertHTML) || (() => null);

  return (
    <>
      <Insert3D>
        <Suspense fallback={null}>
          <Content3D></Content3D>
        </Suspense>
      </Insert3D>
    </>
  );
}

//
