import { Color, Object3D, PlaneGeometry, ShaderMaterial, Vector3 } from "three";
import { GPUComputationRenderer } from "./GPUComputationRenderer.js";
import gpgpu from "./gpgpu.frag";
import displayVert from "./display-v.vert";
import displayFrag from "./display-f.frag";
import { Points } from "three";
import { getCanvasCube } from "../CanvasCube/CanvasCube.jsx";
export class Spike extends Object3D {
  static uuid = Math.random();
  constructor({ ui, renderer, pointer, tCube }) {
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
    let SIZE = 256;

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
    let mainColor = new Color("#ffffff");

    // env.getSetting("main-color").stream((v) => {
    //   mainColor.set(v);
    // }, "hex");
    // let tCube = await env.getAnyCode("canvas-texture", "main").run(api);

    // display part

    //

    //
    let geometry = new PlaneGeometry(1.0, 1.0, SIZE - 1, SIZE - 1);
    let makeMaterial = () => {
      let rect = renderer.domElement.getBoundingClientRect();
      let displayV = displayVert;
      let displayF = displayFrag;

      return new ShaderMaterial({
        // blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        vertexShader: displayV,
        fragmentShader: displayF,
        defines: {
          aspectRatio: `${Number(rect.width / rect.height).toFixed(1)}`,
          resolution:
            "vec2( " +
            rect.width.toFixed(1) +
            ", " +
            rect.height.toFixed(1) +
            " )",
        },
        uniforms: {
          mainColor: { value: mainColor },

          time: { value: 0 },
          opacity: { value: 0.5 },
          posTex: { value: null },

          tCube: { value: tCube },

          indexerTexture: { value: indexerTexture },
          pointSize: { value: window.devicePixelRatio || 1.0 },
        },
      });
    };

    let material = makeMaterial();
    let points = new Points(geometry, material);

    // env.getCode("display-v").stream(() => {
    //   material = makeMaterial();
    //   points.material = material;
    // });
    // env.getCode("display-f").stream(() => {
    //   material = makeMaterial();
    //   points.material = material;
    // });

    // let points = ev.points = new Points(geometry, material)
    points.matrixAutoUpdate = true;
    points.updateMatrix();
    points.frustumCulled = false;

    this.compute = () => {
      procSim();

      if (ticker % 2 === 0) {
        gpuCompute.doRenderTarget(pongMat, pongTarget);
      } else {
        gpuCompute.doRenderTarget(pingMat, pingTarget);
      }

      if (ticker % 2 === 0) {
        material.uniforms.posTex.value = pongTarget.texture;
      } else {
        material.uniforms.posTex.value = pingTarget.texture;
      }
      ticker++;

      material.uniforms.time.value = window.performance.now() * 0.0001;

      mouseV3.x = pointer.x;
      mouseV3.y = pointer.y;
    };
    object.display = points;
    object.mouse = mouseV3;

    // this.add(points);
  }
}
