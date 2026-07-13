import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ────────────────────────────────────────────────────────────────────────
   SOLVEN4 signature instrument — now a TRUE WebGL holographic core.
   Same public API as before: <HoloCore accent="#6366f1" variant="core" />
   variants:  core (HUB) · pulse (EDGE) · network (FORGE) · neural (ORACLE) · reactor (NEXUS)
   Tinted entirely by `accent`. Wrapped upstream in a WebGL error boundary +
   Suspense fallback, so if a device can't do WebGL the static glow shows instead.
──────────────────────────────────────────────────────────────────────── */

const REDUCE = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function useAccent(accent) {
  return useMemo(() => new THREE.Color(accent || '#6366f1'), [accent]);
}

/* ── icosahedron wireframe + glowing nucleus (HUB) ─────────────────────── */
function CoreInstrument({ color }) {
  const outer = useRef();
  const inner = useRef();
  const nucleus = useRef();

  const geo = useMemo(() => new THREE.IcosahedronGeometry(1.35, 0), []);
  const geoInner = useMemo(() => new THREE.IcosahedronGeometry(0.85, 1), []);

  useFrame((state, dt) => {
    if (REDUCE) return;
    const s = Math.min(dt, 0.05);
    if (outer.current) { outer.current.rotation.y += s * 0.28; outer.current.rotation.x += s * 0.12; }
    if (inner.current) { inner.current.rotation.y -= s * 0.42; inner.current.rotation.z += s * 0.18; }
    if (nucleus.current) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.12;
      nucleus.current.scale.setScalar(p);
    }
  });

  return (
    <group>
      <lineSegments ref={outer}>
        <edgesGeometry args={[geo]} />
        <lineBasicMaterial color={color} transparent opacity={0.65} />
      </lineSegments>
      <mesh ref={inner}>
        <primitive object={geoInner} attach="geometry" />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.25} />
      </mesh>
      <mesh ref={nucleus}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <VertexNodes geometry={geo} color={color} />
    </group>
  );
}

/* glowing dots on each vertex of a geometry */
function VertexNodes({ geometry, color, size = 0.05 }) {
  const positions = useMemo(() => {
    const p = geometry.attributes.position;
    const seen = new Set();
    const out = [];
    for (let i = 0; i < p.count; i++) {
      const x = +p.getX(i).toFixed(3), y = +p.getY(i).toFixed(3), z = +p.getZ(i).toFixed(3);
      const k = `${x},${y},${z}`;
      if (seen.has(k)) continue;
      seen.add(k); out.push(x, y, z);
    }
    return new Float32Array(out);
  }, [geometry]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.95} />
    </points>
  );
}

/* ── orbiting rings (used by core / reactor) ───────────────────────────── */
function Rings({ color, count = 3, dashed = false }) {
  const group = useRef();
  useFrame((_, dt) => {
    if (REDUCE || !group.current) return;
    group.current.children.forEach((c, i) => {
      c.rotation.z += (dt * (i % 2 ? -0.35 : 0.5)) * 0.6;
    });
  });
  const rings = useMemo(() => Array.from({ length: count }, (_, i) => ({
    r: 1.7 + i * 0.42,
    rot: [Math.PI / 2 + (i - 1) * 0.5, i * 0.4, i * 0.9],
    op: 0.5 - i * 0.1,
  })), [count]);

  return (
    <group ref={group}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.rot}>
          <torusGeometry args={[ring.r, dashed ? 0.006 : 0.012, 8, 96]} />
          <meshBasicMaterial color={color} transparent opacity={ring.op} />
        </mesh>
      ))}
    </group>
  );
}

/* ── neural / network node cloud with connections ──────────────────────── */
function NeuralInstrument({ color, network = false }) {
  const group = useRef();
  const nodeCount = network ? 30 : 20;

  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < nodeCount; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = network ? 1.55 : 1.2 + Math.random() * 0.3;
      arr.push(new THREE.Vector3(
        Math.sin(ph) * Math.cos(th) * r,
        Math.sin(ph) * Math.sin(th) * r * (network ? 0.7 : 1),
        Math.cos(ph) * r
      ));
    }
    return arr;
  }, [nodeCount, network]);

  const nodePositions = useMemo(() => {
    const f = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => { f[i * 3] = n.x; f[i * 3 + 1] = n.y; f[i * 3 + 2] = n.z; });
    return f;
  }, [nodes]);

  const linePositions = useMemo(() => {
    const segs = [];
    const maxD = network ? 1.5 : 1.35;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < maxD) {
          segs.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    return new Float32Array(segs);
  }, [nodes, network]);

  useFrame((state, dt) => {
    if (REDUCE || !group.current) return;
    group.current.rotation.y += dt * 0.18;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.12;
  });

  return (
    <group ref={group}>
      {network && (
        <mesh>
          <sphereGeometry args={[1.58, 24, 16]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.12} />
        </mesh>
      )}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.28} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.09} sizeAttenuation transparent opacity={0.95} />
      </points>
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ── oscilloscope waveform in 3D (EDGE) ────────────────────────────────── */
function PulseInstrument({ color }) {
  const lineRef = useRef();
  const dotRef = useRef();
  const N = 160;
  const width = 4;

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    return g;
  }, []);

  const grid = useMemo(() => {
    const pts = [];
    for (let i = -2; i <= 2; i++) {
      pts.push(-width / 2, i * 0.4, 0, width / 2, i * 0.4, 0);
      pts.push((i / 2) * (width / 2), -0.9, 0, (i / 2) * (width / 2), 0.9, 0);
    }
    return new Float32Array(pts);
  }, []);

  useFrame((state) => {
    const t = REDUCE ? 0 : state.clock.elapsedTime;
    const pos = geom.attributes.position;
    for (let i = 0; i < N; i++) {
      const x = -width / 2 + (i / (N - 1)) * width;
      const ph = i * 0.22 - t * 3.2;
      let y = Math.sin(ph) * 0.32 + Math.sin(ph * 2.3) * 0.16;
      if (i % 40 === 18) y += Math.sin(ph * 6) * 0.4;
      pos.setXYZ(i, x, y, 0);
    }
    pos.needsUpdate = true;
    if (dotRef.current) {
      const prog = REDUCE ? 0.5 : (t * 0.35) % 1;
      const x = -width / 2 + prog * width;
      const ph = prog * (N - 1) * 0.22 - t * 3.2;
      dotRef.current.position.set(x, Math.sin(ph) * 0.32 + Math.sin(ph * 2.3) * 0.16, 0);
    }
  });

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[grid, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.12} />
      </lineSegments>
      <line ref={lineRef} geometry={geom}>
        <lineBasicMaterial color={color} transparent opacity={0.95} />
      </line>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ── reactor: concentric rings + spiraling particles + bright core ─────── */
function ReactorInstrument({ color }) {
  const spiral = useRef();
  const P = 260;

  const positions = useMemo(() => {
    const f = new Float32Array(P * 3);
    for (let i = 0; i < P; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.4 + Math.random() * 1.5;
      f[i * 3] = Math.cos(a) * r;
      f[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      f[i * 3 + 2] = Math.sin(a) * r;
    }
    return f;
  }, []);

  useFrame((_, dt) => {
    if (REDUCE || !spiral.current) return;
    spiral.current.rotation.y += dt * 0.6;
  });

  return (
    <group>
      <Rings color={color} count={4} dashed />
      <points ref={spiral}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.05} sizeAttenuation transparent opacity={0.8} />
      </points>
      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ── ambient dust common to all instruments ────────────────────────────── */
function Dust({ color }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const N = 120;
    const f = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      f[i * 3] = (Math.random() - 0.5) * 8;
      f[i * 3 + 1] = (Math.random() - 0.5) * 6;
      f[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
    }
    return f;
  }, []);
  useFrame((_, dt) => {
    if (REDUCE || !ref.current) return;
    ref.current.rotation.y += dt * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.03} sizeAttenuation transparent opacity={0.4} />
    </points>
  );
}

function Scene({ accent, variant }) {
  const color = useAccent(accent);
  const rig = useRef();
  const { pointer } = useThree();

  useFrame(() => {
    if (REDUCE || !rig.current) return;
    // subtle parallax toward pointer — the "alive" cinematic feel
    rig.current.rotation.y += ((pointer.x * 0.35) - rig.current.rotation.y) * 0.04;
    rig.current.rotation.x += ((-pointer.y * 0.28) - rig.current.rotation.x) * 0.04;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <group ref={rig}>
        {variant === 'pulse' && <PulseInstrument color={color} />}
        {variant === 'reactor' && <ReactorInstrument color={color} />}
        {variant === 'neural' && <NeuralInstrument color={color} />}
        {variant === 'network' && <NeuralInstrument color={color} network />}
        {(variant === 'core' || !['pulse', 'reactor', 'neural', 'network'].includes(variant)) && (
          <>
            <CoreInstrument color={color} />
            <Rings color={color} count={2} />
          </>
        )}
        <Dust color={color} />
      </group>
      <EffectComposer>
        <Bloom intensity={1.15} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.25} darkness={0.65} />
      </EffectComposer>
    </>
  );
}

export default function HoloCore({ accent = '#6366f1', variant = 'core', className, style }) {
  return (
    <Canvas
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={REDUCE ? 'demand' : 'always'}
    >
      <Scene accent={accent} variant={variant} />
    </Canvas>
  );
}
