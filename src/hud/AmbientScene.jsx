import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const REDUCE = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── receding holographic grid floor (the HUD "deck") ──────────────────── */
function GridFloor({ color }) {
  const ref = useRef();
  const geom = useMemo(() => {
    const size = 60, div = 60;
    const g = new THREE.BufferGeometry();
    const verts = [];
    const step = size / div;
    const half = size / 2;
    for (let i = 0; i <= div; i++) {
      const p = -half + i * step;
      verts.push(-half, 0, p, half, 0, p);
      verts.push(p, 0, -half, p, 0, half);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return g;
  }, []);

  useFrame((state) => {
    if (REDUCE || !ref.current) return;
    // scroll the grid toward the camera for infinite-deck motion
    ref.current.position.z = (state.clock.elapsedTime * 0.6) % 1;
  });

  return (
    <group position={[0, -3, 0]} rotation={[0, 0, 0]}>
      <lineSegments ref={ref} geometry={geom}>
        <lineBasicMaterial color={color} transparent opacity={0.1} />
      </lineSegments>
    </group>
  );
}

/* ── deep floating star / data motes ───────────────────────────────────── */
function Motes({ color }) {
  const ref = useRef();
  const { positions, count } = useMemo(() => {
    const count = 700;
    const f = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      f[i * 3] = (Math.random() - 0.5) * 40;
      f[i * 3 + 1] = (Math.random() - 0.5) * 24;
      f[i * 3 + 2] = (Math.random() - 0.5) * 30 - 8;
    }
    return { positions: f, count };
  }, []);

  useFrame((state) => {
    if (REDUCE || !ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.06} sizeAttenuation transparent opacity={0.55} />
    </points>
  );
}

/* ── slow-drifting distant wire icosphere (a giant "planet core") ──────── */
function DistantCore({ color }) {
  const ref = useRef();
  const geo = useMemo(() => new THREE.IcosahedronGeometry(6, 1), []);
  useFrame((_, dt) => {
    if (REDUCE || !ref.current) return;
    ref.current.rotation.y += dt * 0.03;
    ref.current.rotation.x += dt * 0.01;
  });
  return (
    <mesh ref={ref} position={[10, 4, -18]}>
      <primitive object={geo} attach="geometry" />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.06} />
    </mesh>
  );
}

function Rig({ children }) {
  const rig = useRef();
  const { pointer } = useThree();
  useFrame(() => {
    if (REDUCE || !rig.current) return;
    rig.current.rotation.y += ((pointer.x * 0.12) - rig.current.rotation.y) * 0.02;
    rig.current.rotation.x += ((-pointer.y * 0.08) - rig.current.rotation.x) * 0.02;
  });
  return <group ref={rig}>{children}</group>;
}

function Scene({ accent }) {
  const color = useMemo(() => new THREE.Color(accent || '#6366f1'), [accent]);
  return (
    <>
      <Rig>
        <GridFloor color={color} />
        <Motes color={color} />
        <DistantCore color={color} />
      </Rig>
      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur radius={0.8} />
      </EffectComposer>
    </>
  );
}

export default function AmbientScene({ accent = '#6366f1' }) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%', display: 'block' }}
      camera={{ position: [0, 1.5, 9], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={REDUCE ? 'demand' : 'always'}
    >
      <Scene accent={accent} />
    </Canvas>
  );
}
