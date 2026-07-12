import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// SOLVEN4 holographic command core — rotating rings, wireframe polyhedron,
// orbiting nodes, pulsing center. Tinted by `accent`. Lazy-load this.
function CoreRig({ accent }) {
  const rings = useRef();
  const poly = useRef();
  const nodes = useRef();
  const col = useMemo(() => new THREE.Color(accent), [accent]);

  const nodeData = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({
      r: 1.15 + (i % 3) * 0.28,
      speed: (i % 2 ? 1 : -1) * (0.25 + (i % 3) * 0.12),
      phase: (i / 6) * Math.PI * 2,
      tilt: (i % 2) * 0.5,
    })), []
  );

  useFrame((state, d) => {
    if (rings.current) { rings.current.rotation.y += d * 0.18; rings.current.rotation.x += d * 0.06; }
    if (poly.current) { poly.current.rotation.y -= d * 0.25; poly.current.rotation.z += d * 0.08; }
    if (nodes.current) {
      const t = state.clock.elapsedTime;
      nodes.current.children.forEach((m, i) => {
        const nd = nodeData[i];
        m.position.set(
          Math.cos(t * nd.speed + nd.phase) * nd.r,
          Math.sin(t * nd.speed + nd.phase) * nd.r * (0.9 - nd.tilt * 0.4),
          Math.sin(t * nd.speed * 0.7 + nd.phase) * nd.r * nd.tilt
        );
      });
    }
  });

  return (
    <group>
      {/* concentric rings */}
      <group ref={rings}>
        {[1.0, 0.78, 1.22].map((r, i) => (
          <mesh key={i} rotation={[Math.PI / 2 + i * 0.6, i * 0.4, 0]}>
            <torusGeometry args={[r, 0.006, 10, 140]} />
            <meshBasicMaterial color={col} toneMapped={false} transparent opacity={0.75 - i * 0.15} />
          </mesh>
        ))}
      </group>

      {/* wireframe polyhedron */}
      <mesh ref={poly}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshBasicMaterial color={col} wireframe toneMapped={false} transparent opacity={0.55} />
      </mesh>

      {/* pulsing core */}
      <mesh>
        <sphereGeometry args={[0.17, 32, 32]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshBasicMaterial color={col} toneMapped={false} transparent opacity={0.25} />
      </mesh>

      {/* orbiting nodes */}
      <group ref={nodes}>
        {nodeData.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshBasicMaterial color={col} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function HoloCore({ accent = '#6366f1', className, style }) {
  return (
    <Canvas
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 3.4], fov: 45 }}
    >
      <Float speed={1.3} rotationIntensity={0.35} floatIntensity={0.5}>
        <CoreRig accent={accent} />
      </Float>
      <EffectComposer>
        <Bloom intensity={1.35} luminanceThreshold={0.08} luminanceSmoothing={0.9} mipmapBlur />
        <ChromaticAberration offset={[0.0006, 0.0006]} />
      </EffectComposer>
    </Canvas>
  );
}
