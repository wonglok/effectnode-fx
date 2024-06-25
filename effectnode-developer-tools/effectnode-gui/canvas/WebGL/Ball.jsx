import { Canvas } from "@react-three/fiber";
import { EnergyArtCompo } from "./EnergyArt/EnergyArtCompo";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { PerspectiveCamera } from "@react-three/drei";

export function Ball() {
  // Yo
  return (
    <Canvas className="w-full h-full">
      <color attach="background" args={["#000000"]}></color>
      <PerspectiveCamera makeDefault position={[0, 0, 150]}></PerspectiveCamera>
      <EnergyArtCompo></EnergyArtCompo>
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={5.5}
          luminanceThreshold={0.15}
          mipmapBlur={true}
        ></Bloom>
      </EffectComposer>
    </Canvas>
  );
}
