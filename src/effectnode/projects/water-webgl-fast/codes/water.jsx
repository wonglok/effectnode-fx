// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// useEffect, useRef, useState
//

import { useFrame, useThree } from "@react-three/fiber";
// import { XROrigin } from "@react-three/xr";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  FrontSide,
  HalfFloatType,
  IcosahedronGeometry,
  MeshStandardMaterial,
  Uniform,
  Vector3,
  MeshNormalMaterial,

  //
  BufferGeometry,
  NoBlending,
  SpriteMaterial,
  BoxGeometry,
  CircleGeometry,
  Clock,
} from "three";
import {
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  WebGLRenderer,
  SphereGeometry,

  //
  Object3D,
  DataTexture,
  DoubleSide,
  FloatType,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  RGBAFormat,
} from "three";
import {
  FloatVertexAttributeTexture,
  MeshBVH,
  BVHShaderGLSL,
  SAH,
  MeshBVHUniformStruct,
} from "three-mesh-bvh";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { fromHalfFloat } from "three/src/extras/DataUtils";
import { Insert3D } from "./main";
import { Bvh, Gltf, Stats } from "@react-three/drei";

const DebugGridCounter = true && process.env.NODE_ENV === "development";

//

function Content3D({ ui, files }) {
  let dx = 10;
  let dy = 10;
  let dz = 10;

  let offsetGrid = useMemo(() => {
    return new Vector3(dx * -0.5, 0, dz * -1.25);
  }, [dx, dz]);

  let gravityFactor = useMemo(() => {
    return new Uniform(1.0);
  }, []);

  let pressureFactor = useMemo(() => {
    return new Uniform(1.0);
  }, []);

  useEffect(() => {
    if (!isNaN(ui.gravityFactor)) {
      gravityFactor.value = ui.gravityFactor;
    }
    if (!isNaN(ui.pressureFactor)) {
      pressureFactor.value = ui.pressureFactor;
    }
  }, [gravityFactor, pressureFactor, ui.gravityFactor, ui.pressureFactor]);
  //

  let sideCount = 64 * 1;

  let px = Math.floor(Math.sqrt(sideCount));
  let py = Math.floor(Math.sqrt(sideCount));
  let pz = sideCount;

  let [{ show, show2 }, setMounter] = useState({
    show: null,
    show2: null,
  });

  let gl = useThree((r) => r.gl);
  let onRender = useRef(() => {});
  useEffect(() => {
    let loops = [];
    let cleans = [];

    let coordFunctions = ({
      px,
      py,
      pz,
      //
      dx,
      dy,
      dz,
    }) => `

    #define grids vec3(${dx.toFixed(1)}, ${dy.toFixed(1)}, ${dz.toFixed(1)})
    #define particles vec3(${px.toFixed(1)}, ${py.toFixed(1)}, ${pz.toFixed(1)})
    
    float smoothKernel (float smoothRadius, float dist ) {
      float volume = float(64.0 * ${Math.PI}) * pow(smoothRadius, 9.0) / 315.0;
      float value = max(0.0, pow(smoothRadius, 2.0)) - pow(dist, 2.0);
      return pow(value, 3.0) / volume;
    }

     vec3 uvToWorld (vec2 uv, vec3 sourceGrid) {
        // // sourceGrid
        // float dx = sourceGrid.x;
        // float dy = sourceGrid.y;
        // float dz = sourceGrid.z;

        // uv to 3d
        float uvx = uv.x;
        float uvy = uv.y;
        float tx = uvx * sourceGrid.x * sourceGrid.z;
        float ty = uvy * sourceGrid.z;
        
        float _3dx = (tx / sourceGrid.x);
        float _3dy = (tx / sourceGrid.y);
        float _3dz = (ty);

        vec3 pos = vec3(_3dx, _3dy, _3dz);

        // pos.x = max(min(pos.x, grids.x), 0.0);
        // pos.y = max(min(pos.y, grids.y), 0.0);
        // pos.z = max(min(pos.z, grids.z), 0.0);

        return pos;
    }

    vec2 worldToUV (vec3 pos, vec3 sourceGrid) {
        // pos.x = max(min(pos.x, sourceGrid.x), 0.0);
        // pos.y = max(min(pos.y, sourceGrid.y), 0.0);
        // pos.z = max(min(pos.z, sourceGrid.z), 0.0);

        //
        float _3dx = pos.x;
        float _3dy = pos.y;
        float _3dz = pos.z;

        float dx = sourceGrid.x;
        float dy = sourceGrid.y;
        float dz = sourceGrid.z;

        // 3d to uv
        vec2 myUV = vec2(
            (_3dx + _3dy * dx) / (sourceGrid.x * sourceGrid.y),
            (_3dz) / sourceGrid.z
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
    // gpuParticle.setDataType(HalfFloatType);

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
            
            if (outputPos.x > boundMax.x) {
                outputPos.x = boundMax.x;
            }
            if (outputPos.y > boundMax.y) {
                outputPos.y = boundMax.y;
            }
            if (outputPos.z > boundMax.z) {
                outputPos.z = boundMax.z;
            }

            if (outputPos.x < boundMin.x) {
                outputPos.x = boundMin.x;
            }
            if (outputPos.y < boundMin.y) {
                outputPos.y = boundMin.y;
            }
            if (outputPos.z < boundMin.z) {
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

            let color = ["#ff0000", "#ffffff", "#0000ff"];
            let idx = Math.floor(color.length * r);
            let current = new Color()
              .set(color[idx])
              .convertLinearToSRGB()
              .offsetHSL(0, 0.0, 0.0);

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
    loops.push((st, dt) => {
      particlePositionVar.material.uniforms.delta.value = dt;
    });

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
        uniform float mouseDown;
        
      
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

            vec3 velPressure = vec3(0.0);
            for (int z = -1; z <= 1; z++) {
              for (int y = -1; y <= 1; y++) {
                for (int x = -1; x <= 1; x++) {
                  if (x == 0 && y == 0 && z == 0) {
                    continue;
                  }

                  vec3 centerSlot =  floor(outputPos) + 0.5;
                  vec3 nextby = vec3(
                    float(x), 
                    float(y), 
                    float(z)
                  );
                  
                  vec3 sidePos = nextby + outputPos;

                  vec2 particleUV = worldToUV(sidePos, grids);
                  vec2 slotUV = worldToUV(sidePos, grids);

                  vec4 slot = texture2D(gridTex, slotUV);

                  // vec4 posData = texture2D(particlePosition, particleUV);
              
                  float pressure = slot.x;
                  
                  vec3 diff = nextby;

                  float dist = length(diff);

                  float edge = pow(grids.x * grids.y * grids.z, 1.0 / 3.0);

                  if (!isnan(pressure)) {
                    velPressure += diff * dist * pressure * delta * pressureFactor * smoothKernel(edge * 1.5, dist);
                  }

                  //
                }
              }
            }

            // pressure
            // outputVel += velPressure; 
            outputVel.x += velPressure.x * 1.5; 
            outputVel.y += velPressure.y * 1.5; 
            outputVel.z += velPressure.z * 1.5; 

            // gravityFactor
            outputVel.y += -0.015 * gravityFactor * delta * outputPos.y;

            // mouse
            float mouseRadius = 5.0;
            float mouseForceSize = sdSphere(pointerWorld, mouseRadius);
            vec3 normalParticleMouse = normalize(outputPos.rgb - pointerWorld);
            
            // mouse
            if (length(outputPos - pointerWorld) <= mouseRadius) {
              outputVel.rgb += normalParticleMouse * delta * 1.05 * mouseDown;
            }


            if (outputPos.x >= boundMax.x) {
                outputVel.x += -0.5 * delta;
                // outputVel.x *= 0.1;
            }
            if (outputPos.y >= boundMax.y) {
                outputVel.y += -0.5 * delta;
                // outputVel.y *= 0.1;
            }
            if (outputPos.z >= boundMax.z) {
                outputVel.z += -0.5 * delta;
                // outputVel.z *= 0.1;
            }

            if (outputPos.x <= boundMin.x) {
                outputVel.x += 0.5 * delta;
                // outputVel.x *= 0.1;
            }
            if (outputPos.y <= boundMin.y) {
                outputVel.y += 0.5 * delta;
                // outputVel.y *= 0.1;
            }
            if (outputPos.z <= boundMin.z) {
                outputVel.z += 0.5 * delta;
                // outputVel.z *= 0.1;
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
    particleVelocityVar.material.uniforms.mouseDown = { value: 1 };
    window.addEventListener("mousedown", () => {
      particleVelocityVar.material.uniforms.mouseDown.value = -1;
    });
    window.addEventListener("mouseup", () => {
      particleVelocityVar.material.uniforms.mouseDown.value = 1;
    });

    particleVelocityVar.material.uniforms.delta = { value: 0 };
    loops.push((st, dt) => {
      particleVelocityVar.material.uniforms.delta.value = dt;
    });
    particleVelocityVar.material.uniforms.pointerWorld = {
      value: new Vector3(0, 0, -10).sub(offsetGrid),
    };
    particleVelocityVar.material.uniforms.pressureFactor = pressureFactor;
    particleVelocityVar.material.uniforms.gravityFactor = gravityFactor;

    let hh = ({ detail }) => {
      particleVelocityVar.material.uniforms.pointerWorld.value.fromArray([
        !isNaN(detail[0]) ? detail[0] : 0,
        !isNaN(detail[1]) ? detail[1] : 0,
        !isNaN(detail[2]) ? detail[2] : 0,
      ]);
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

    loops.push((st, dt) => {
      particlePositionVar.material.uniforms.delta.value = dt;
    });

    //////////////////////////////////////////////////////////////////////
    ///////////
    /////////////////////////
    // - particle to uvs - //
    /////////////////////////
    ///////////

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

        uniform sampler2D particlePositionTexture;
        uniform sampler2D particleVelocityTexture;

        void main (void) {
            float uvx = gl_FragCoord.x / iResolution.x;
            float uvy = gl_FragCoord.y / iResolution.y;

            vec2 uv = vec2(uvx, uvy);

            vec3 slotPosition = uvToWorld(uv, grids);

            float counter = 0.0;
            float reset = 0.0;

            float edge = pow(grids.x * grids.y * grids.z, 1.0 / 3.0);
            for (int z = 0; z < int(particles.z); z++) {
              float i = 0.0;
              for (int y = 0; y < int(particles.y); y++) {
                for (int x = 0; x < int(particles.x); x++) {
                  //

                  vec4 particlePosition = texture2D(
                    particlePositionTexture, 
                    vec2(i / particles.x * particles.y, float(z) / particles.z)
                  );

                  float dist = length(particlePosition.rgb - slotPosition);
        
                  float adder = smoothKernel(edge * 1.75, dist);

                  if (!isnan(counter + adder) && !isnan(counter) && !isnan(adder)) {
                    counter += adder;
                  }

                  // if (
                  //   true
                  //   && particlePosition.x >= slotPosition.x - 10.0 / grids.x
                  //   && particlePosition.x <= slotPosition.x + 10.0 / grids.x
                  //   && particlePosition.y >= slotPosition.y - 10.0 / grids.y
                  //   && particlePosition.y <= slotPosition.y + 10.0 / grids.y
                  //   && particlePosition.z >= slotPosition.z - 10.0 / grids.z
                  //   && particlePosition.z <= slotPosition.z + 10.0 / grids.z
                  // ) {
                  // }
                 
                  i++;

                }
              }
            }

            gl_FragColor = vec4(counter, counter, counter, counter);

        }
    `;

    //
    //
    // let uvTex = slotComputeGPU.createTexture();
    // let vec4UV = [];
    // for (let z = 0; z < dz; z++) {
    //   let i = 0;
    //   for (let y = 0; y < dy; y++) {
    //     for (let x = 0; x < dx; x++) {
    //       ///
    //       vec4UV.push(i / (dx * dy), z / dz, 0, 0);
    //       i++;
    //     }
    //   }
    // }
    // {
    //   for (let i = 0; i < vec4UV.length; i++) {
    //     uvTex.image.data[i] = vec4UV[i];
    //   }
    //   uvTex.needsUpdate = true;
    // }
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

    // slotComputeVar.material.uniforms.uvTex = { value: uvTex };
    slotComputeVar.material.uniforms.particlePositionTexture = {
      value: gpuParticle.getCurrentRenderTarget(particlePositionVar).texture,
    };
    slotComputeVar.material.uniforms.particleVelocityTexture = {
      value: gpuParticle.getCurrentRenderTarget(particleVelocityVar).texture,
    };
    slotComputeGPU.setDataType(FloatType);
    let err = slotComputeGPU.init();
    if (err) {
      console.error(err);
      return;
    }
    loops.push(() => {
      slotComputeGPU.compute();
      slotComputeVar.material.uniforms.particlePositionTexture = {
        value: gpuParticle.getCurrentRenderTarget(particlePositionVar).texture,
      };
      slotComputeVar.material.uniforms.particleVelocityTexture = {
        value: gpuParticle.getCurrentRenderTarget(particleVelocityVar).texture,
      };
    });

    //////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////
    ///////////
    ///////////
    ///////////
    ///////////
    ///////////////
    // - render kernel - //
    ///////////////

    loops.push((st, dt) => {
      if (DebugGridCounter) {
        let arr = new Float32Array(new Array(Math.floor(tx * ty * 4)));

        /** @type {WebGLRenderer} */
        let gl = st.gl;
        gl.readRenderTargetPixels(
          slotComputeGPU.getCurrentRenderTarget(slotComputeVar),
          0,
          0,
          tx,
          ty,
          arr
        );

        console.log(
          arr.map((r) => r)[0],
          arr.map((r) => r)[1],
          arr.map((r) => r)[2],
          arr.map((r) => r)[3]
        );
      }
    });
    let myClock = new Clock();
    onRender.current = (st) => {
      let dt = myClock.getDelta();
      if (dt >= 1) {
        dt = 1;
      }

      loops.forEach((r) => r(st, dt));
      //
    };

    //////////////////////////////////////////////////////////////////////
    ////// RENDER ////////
    //////////////////////////////////////////////////////////////////////

    {
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
        offset.push(0, 0, 0);
      }

      //
      //
      //

      let ibg = new InstancedBufferGeometry();
      ibg.copy(new IcosahedronGeometry(1, 0));
      ibg.scale(0.2, 0.2, 0.2);
      ibg.rotateX(Math.PI * 0.25 * 0.0);
      ibg.rotateZ(Math.PI * 0.25 * 0.0);

      ibg.instanceCount = COUNT_PARTICLE;

      ibg.setAttribute(
        "offsetPositionAttr",
        new InstancedBufferAttribute(new Float32Array(offset), 3)
      );

      ibg.setAttribute(
        "offsetUV",
        new InstancedBufferAttribute(new Float32Array(uv), 2)
      );

      //
      //
      //
      //

      let mat = new MeshStandardMaterial({
        flatShading: true,
        color: new Color("#ffffff"),
        emissive: new Color("#000000"),
        metalness: 0.0,
        roughness: 1,
        transparent: true,
        opacity: 0.8,
        side: FrontSide,
        transparent: true,
        depthWrite: true,
        depthTest: true,
      });

      mat.onBeforeCompile = (shader, renderer) => {
        shader.uniforms.particleColor = {
          value: particleColorInitTex,
        };
        shader.uniforms.particlePosition = {
          value:
            gpuParticle.getCurrentRenderTarget(particlePositionVar).texture,
        };
        shader.uniforms.particleVelocity = {
          value:
            gpuParticle.getCurrentRenderTarget(particleVelocityVar).texture,
        };

        loops.push(() => {
          shader.uniforms.particleColor.value = particleColorInitTex;
          shader.uniforms.particlePosition.value =
            gpuParticle.getCurrentRenderTarget(particlePositionVar).texture;
          shader.uniforms.particleVelocity.value =
            gpuParticle.getCurrentRenderTarget(particleVelocityVar).texture;

          gpuParticle.compute();
        });

        //

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
        uniform sampler2D particlePosition;
        uniform sampler2D particleVelocity;

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

            // vec4 offsetColor = texture2D(particleColor, vMyUV);
            vec4 offsetVelocity = texture2D(particleVelocity, vMyUV);

            //
            
            gl_FragColor = vec4(outgoingLight * (1.0 - offsetVelocity.rgb * 2.5) * mix(vec3(0.0, 0.1, 1.0), vec3(0.2, 1.0, 0.8), 2.0 * length(offsetVelocity.rgb)), diffuseColor.a );
            
            //

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

      let ball = new Mesh(
        new SphereGeometry(1, 32, 32),
        new MeshNormalMaterial({
          //
          //
        })
      );

      console.log("building", ball);

      //

      loops.push(() => {
        ball.position.copy(
          particleVelocityVar.material.uniforms.pointerWorld.value
        );
      });

      setMounter((s) => {
        return {
          ...s,
          ...{
            show: (
              <>
                <primitive object={mesh}></primitive>
                <primitive object={ball}></primitive>
              </>
            ),
          },
        };
      });

      //
    }
    //

    return () => {
      cleans.forEach((it) => {
        it();
      });
    };

    //
    //
    //
  }, [dx, dy, dz, gl, gravityFactor, offsetGrid, pressureFactor, px, py, pz]);

  useFrame((st, dt) => {
    onRender.current(st, dt);
  });
  return (
    <>
      {/*  */}
      <Bvh>
        <group
          onPointerMove={(ev) => {
            window.dispatchEvent(
              new CustomEvent("pointerWorld", { detail: ev.point.toArray() })
            );
          }}
        >
          {/*  */}
          {/*  */}
          {/*  */}

          {files["/places/church-2.glb"] && (
            <>
              <Suspense fallback={null}>
                <Gltf useDraco src={files["/places/church-2.glb"]}></Gltf>
              </Suspense>
            </>
          )}
          {/*  */}
          {/*  */}
        </group>
        <group position={offsetGrid.toArray()}>
          <group>
            {show2}
            {show}
          </group>
        </group>

        {/* <XROrigin position={[0, 10, 50]} /> */}
        {/*  */}
      </Bvh>
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

export function Runtime({ ui, io, useStore, files }) {
  return (
    <>
      <Insert3D>
        <Stats></Stats>
        <Suspense fallback={null}>
          <Content3D files={files} ui={ui}></Content3D>
        </Suspense>
      </Insert3D>
    </>
  );
}

//
