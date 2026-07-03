import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// A single floating tactile card component
function NoteCard3D({ 
  position, 
  color, 
  rotation, 
  scale = [1.8, 1.2, 0.08], 
  scrollProgress, 
  index,
  mouse
}: { 
  position: [number, number, number]; 
  color: string; 
  rotation: [number, number, number]; 
  scale?: [number, number, number]; 
  scrollProgress: number; 
  index: number;
  mouse: React.MutableRefObject<[number, number]>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Targets for smooth interpolation
  const targetPos = new THREE.Vector3(...position);
  const targetRot = new THREE.Euler(...rotation);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.getElapsedTime();

    // Stage-specific modifications based on scroll progress
    if (scrollProgress < 0.25) {
      // Stage 0: Scattered floaty state
      const bounce = Math.sin(t * 1.5 + index) * 0.15;
      meshRef.current.position.y = position[1] + bounce;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0], 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, position[2], 0.1);
      
      // Hover effect (tilted parallax)
      const mouseInfluenceX = hovered ? mouse.current[0] * 0.5 : 0;
      const mouseInfluenceY = hovered ? mouse.current[1] * 0.5 : 0;
      
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, rotation[0] + mouseInfluenceY, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotation[1] + mouseInfluenceX, 0.1);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, rotation[2] + Math.sin(t * 0.5 + index) * 0.02, 0.1);
    } 
    else if (scrollProgress >= 0.25 && scrollProgress < 0.5) {
      // Stage 1: Auth Shield / Lock Stage
      // Cards pull together in a neat defensive cluster
      const radius = 1.2;
      const angle = (index / 4) * Math.PI * 2;
      
      const shieldX = Math.cos(angle) * radius;
      const shieldY = Math.sin(angle) * radius - 0.2;
      const shieldZ = -1;

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, shieldX, 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, shieldY, 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, shieldZ, 0.1);

      // Facing outwards
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, angle + Math.PI / 2, 0.1);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
    } 
    else if (scrollProgress >= 0.5 && scrollProgress < 0.75) {
      // Stage 2: Admin Sorted Rows
      // Row 1 (index 0, 1) and Row 2 (index 2, 3)
      const row = index < 2 ? 0.6 : -0.6;
      const col = (index % 2 === 0) ? -1.2 : 1.2;
      
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, col, 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, row, 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0, 0.1);

      // Flat facing the camera
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
    } 
    else {
      // Stage 3: Code Block / Flipping grid
      // Cards flip and stack
      const stackY = -index * 0.15;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, -1.8, 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, stackY, 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, -0.5, 0.1);

      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0.4, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, -0.6, 0.1);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0.1, 0.1);
    }

    // Material scale adjustments on hover
    const targetScale = hovered && scrollProgress < 0.25 ? 1.1 : 1.0;
    meshRef.current.scale.set(
      scale[0] * targetScale,
      scale[1] * targetScale,
      scale[2] * targetScale
    );
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.65}
        metalness={0.05}
        clearcoat={0.1}
        clearcoatRoughness={0.2}
        shadowSide={THREE.DoubleSide}
      />
    </mesh>
  );
}

// A background particle grid for environmental light & texture
function LightParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    // Subtle drift
    pointsRef.current.rotation.y = t * 0.02;
    pointsRef.current.rotation.x = t * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#CECAC2"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.6}
      />
    </points>
  );
}

// Scene controller for lighting and camera position
function SceneController({ scrollProgress }: { scrollProgress: number }) {
  useFrame((state) => {
    // Smoothly animate camera dolly based on scroll stages
    let targetZ = 6.0;
    let targetX = 0;
    let targetY = 0;

    if (scrollProgress >= 0.25 && scrollProgress < 0.5) {
      targetZ = 5.2;
      targetX = -0.5;
    } else if (scrollProgress >= 0.5 && scrollProgress < 0.75) {
      targetZ = 4.8;
      targetX = 0;
    } else if (scrollProgress >= 0.75) {
      targetZ = 5.5;
      targetX = 0.8;
    }

    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.08);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.08);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.08);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[4, 5, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-4, -2, -2]} intensity={0.4} color="#E8DCD0" />
      <pointLight position={[0, 4, -2]} intensity={0.5} color="#FAF6F0" />
    </>
  );
}

export default function ThreeScene() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const mouse = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = window.scrollY / totalScroll;
        setScrollProgress(progress);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      ];
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Card configurations: warm, tactile, earthy tones
  const cards = [
    { position: [-1.9, 1.2, 0] as [number, number, number], color: '#E9C46A', rotation: [-0.1, 0.15, -0.05] as [number, number, number] }, // Warm Sand/Yellow
    { position: [1.8, 1.0, 0.2] as [number, number, number], color: '#E76F51', rotation: [0.12, -0.1, 0.08] as [number, number, number] },  // Clay Orange
    { position: [-1.6, -1.2, -0.1] as [number, number, number], color: '#2A9D8F', rotation: [0.05, -0.05, -0.08] as [number, number, number] }, // Sage Green
    { position: [1.5, -1.1, 0.1] as [number, number, number], color: '#264653', rotation: [-0.08, 0.12, 0.05] as [number, number, number] },  // Deep Indigo
  ];

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#FAFAF8]">
      {/* Light subtle grid texture overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      
      <Canvas
        shadows
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ pointerEvents: 'auto' }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneController scrollProgress={scrollProgress} />
        <LightParticles />
        {cards.map((card, i) => (
          <NoteCard3D
            key={i}
            index={i}
            position={card.position}
            color={card.color}
            rotation={card.rotation}
            scrollProgress={scrollProgress}
            mouse={mouse}
          />
        ))}
      </Canvas>
    </div>
  );
}
