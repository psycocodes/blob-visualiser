import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { MathUtils } from "three";

import vertexShader from "./vertexShader";
import fragmentShader from "./fragmentShader";
import { useFrame } from "@react-three/fiber";

export default function Blob({
  theme = 0,
  intensity = 0,
  gradient = ["#56ab2f", "#a8e063"],
}: {
  theme?: number;
  intensity?: number;
  gradient?: string[];
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_intensity: { value: 0.3 },
      u_color1: { value: new THREE.Color(gradient[0]) },
      u_color2: { value: new THREE.Color(gradient[1]) },
    }),
    [theme, gradient]
  );
  useFrame((state) => {
    const { clock } = state;
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();

      material.uniforms.u_intensity.value = MathUtils.lerp(
        material.uniforms.u_intensity.value,
        intensity,
        0.02
      );
    }
  });
  return (
    <mesh ref={mesh} scale={1.5} position={[0, 0, 0]}>
      <icosahedronGeometry args={[2, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
