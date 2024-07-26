// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// useEffect, useRef, useState
//

import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
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
} from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";

//
function Content3D() {
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
    ///////////
    ///////////
    ///////////
    ///////////
    ///////////
    // particle

    let dimension = Math.floor(Math.pow(256 * 256, 1 / 3));
    let dx = dimension * 1;
    let dz = dimension * 1;
    let dy = dimension * 1;

    let px = 16;
    let py = 16;
    let pz = 256;

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

    let particlePositionInitTex = gpuParticle.createTexture();
    {
      let arr = particlePositionInitTex.image.data;
      let i = 0;
      for (let z = 0; z < pz; z++) {
        for (let y = 0; y < py; y++) {
          for (let x = 0; x < px; x++) {
            arr[i * 4 + 0] = 10 * Math.random();
            arr[i * 4 + 1] = 10 * Math.random();
            arr[i * 4 + 2] = 10 * Math.random();
            arr[i * 4 + 3] = 0;

            i++;
          }
        }
      }
      particlePositionInitTex.needsUpdate = true;
    }

    let particlePositionVar = gpuParticle.addVariable(
      "particlePosition",
      particlePositionShader,
      particlePositionInitTex
    );

    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    let particleVelocityShader = `
        #define iResolution vec2(${pw.toFixed(0)}, ${pw.toFixed(0)})

        #define boundMax vec3(${dx.toFixed(1)},${dy.toFixed(1)},${dz.toFixed(1)})
        #define boundMin vec3(${(0).toFixed(1)},${(0).toFixed(1)},${(0).toFixed(1)})

        uniform float delta;
        void main (void) {
            vec2 myUV = gl_FragCoord.xy / iResolution;

            vec4 particlePositionData = texture2D(particlePosition, myUV);
            vec4 particleVelocityData = texture2D(particleVelocity, myUV);

            vec3 outputPos = particlePositionData.rgb;

            vec3 outputVel = particleVelocityData.rgb;

            outputVel.y -= 0.1 * delta;
            
            if (outputPos.x >= boundMax.x) {
                outputVel.x += -1.0 * delta;
                outputVel.x *= delta * 0.5;
            }
            if (outputPos.y >= boundMax.y) {
                outputVel.y += -1.0 * delta;
                outputVel.y *= delta * 0.5;
            }
            if (outputPos.z >= boundMax.z) {
                outputVel.z += -1.0 * delta;
                outputVel.z *= delta * 0.5;
            }

            if (outputPos.x <= boundMin.x) {
                outputVel.x += 1.0 * delta;
                outputVel.x *= delta * 0.5;
            }
            if (outputPos.y <= boundMin.y) {
                outputVel.y += 1.0 * delta;
                outputVel.y *= delta * 0.5;
            }
            if (outputPos.z <= boundMin.z) {
                outputVel.z += 1.0 * delta;
                outputVel.z *= delta * 0.5;
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

    onRender.current = (st, dt) => {
      particleVelocityVar.material.uniforms.delta.value = dt;
      slotComputeGPU.compute();
      gpuParticle.compute();
    };

    //////////////////////////////////////////////////////////////////////
    ///////////
    ///////////
    ///////////
    ///////////
    ///////////
    // slots

    let tx = dx * dz;
    let ty = dy;
    let COUNT_DIMENSIONS = dx * dy * dz;

    let slotComputeGPU = new GPUComputationRenderer(tx, ty, gl);
    let slotComputeShader = `
        #define iResolution vec2(${tx.toFixed(0)}, ${ty.toFixed(0)})
        #define dx ${dx.toFixed(1)}
        #define dy ${dy.toFixed(1)}
        #define dz ${dz.toFixed(1)}

        uniform sampler2D uvTex;
        uniform sampler2D particlePositionTex;

        vec3 uvTo3d (vec2 uv, vec3 grid) {
            // grid
            float dx = grid.x;
            float dy = grid.y;
            float dz = grid.z;
            
            // uv to 3d
            float uvx = uv.x;
            float uvy = uv.y;
            float tx = uvx * dx * dy;
            float ty = uvy * dy;
            
            float dxdz = tx;
            float _3dx = floor(dxdz / ${dz.toFixed(1)});
            float _3dy = ty;
            float _3dz = floor(dxdz / dx);

            return vec3(_3dx, _3dy, _3dz);
        }


        vec2 p3DToUV (vec3 pos, vec3 grid) {

            float _3dx = pos.x;
            float _3dy = pos.y;
            float _3dz = pos.z;

            float dx = grid.x;
            float dy = grid.y;
            float dz = grid.z;


            // 3d to uv
            vec2 myUV = vec2(
                (_3dx + _3dz * dz) / (dx * dz),
                _3dy / dy
            );

            return myUV;
        }

        void main (void) {
            // float maxX = dx;
            // float maxY = ${dy.toFixed(1)};
            // float maxZ = ${dz.toFixed(1)};
           
            float uvx = gl_FragCoord.x / iResolution.x;
            float uvy = gl_FragCoord.y / iResolution.y;

            vec2 uv = vec2(uvx, uvy);
            
            // vec4 uvData = texture2D(uvTex, uv);

            vec4 posData = texture2D(particlePositionTex, uv);
            
            ///////
            
            /////// vec4 posData = texture2D(particlePositionTex, p3DToUV(worldPos, vec3(dx, dy, dz)));


            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);



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

    let err = slotComputeGPU.init();
    if (err) {
      console.error(err);
      return;
    }

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
      ibg.copy(new SphereGeometry(1, 23, 23));

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

      let mat = new MeshPhysicalMaterial({
        color: new Color("#ff0000"),
        side: DoubleSide,
        transparent: true,
      });

      mat.onBeforeCompile = (shader, renderer) => {
        shader.uniforms.particlePosition = {
          value:
            gpuParticle.getCurrentRenderTarget(particlePositionVar).texture,
        };

        setInterval(() => {
          shader.uniforms.particlePosition.value =
            gpuParticle.getCurrentRenderTarget(particlePositionVar).texture;
        });

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

    vec4 offset = texture2D(particlePosition, offsetUV);

    vec3 transformed = vec3( position * 0.05 + offset.rgb );

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
        
            #include <opaque_fragment>
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
            #include <fog_fragment>
            #include <premultiplied_alpha_fragment>
            #include <dithering_fragment>
        
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
  }, [gl, mounter]);

  useFrame((st, dt) => {
    onRender.current(st, dt);
  });
  return (
    <>
      {/*  */}

      {show}

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
