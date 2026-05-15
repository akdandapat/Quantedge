'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface RiskSurfaceProps {
  paths: number[][];
}

function AnimatedMesh({ geometry }: { geometry: THREE.BufferGeometry }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timer = useMemo(() => new THREE.Timer(), []);

  useFrame(() => {
    timer.update();
    if (meshRef.current) {
      // Spin the surface horizontally over time using Timer.getElapsed()
      meshRef.current.rotation.z = timer.getElapsed() * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} geometry={geometry}>
      <meshStandardMaterial 
        vertexColors={true}
        wireframe={true}
        transparent={true}
        opacity={0.9}
        emissive="#000000"
      />
    </mesh>
  );
}

function CameraLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.copy(state.camera.position);
    }
  });
  return <pointLight ref={lightRef} intensity={0.8} color="#ffffff" />;
}

export default function RiskSurface({ paths }: RiskSurfaceProps) {
  const geometry = useMemo(() => {
    if (!paths || paths.length === 0) return null;

    // Sample paths to prevent the wireframe from becoming a solid unintelligible block
    const MAX_PATHS = 120; 
    const step = Math.max(1, Math.floor(paths.length / MAX_PATHS));
    const sampledPaths = paths.filter((_, i) => i % step === 0);

    const numPaths = sampledPaths.length;
    const numDays = sampledPaths[0].length;
    
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (let i = 0; i < numPaths; i++) {
      for (let j = 0; j < numDays; j++) {
        const p = sampledPaths[i][j];
        if (p < minPrice) minPrice = p;
        if (p > maxPrice) maxPrice = p;
      }
    }
    
    const priceRange = maxPrice - minPrice || 1;
    
    // Create a PlaneGeometry where Width = Time, Height = Simulation Path
    const geo = new THREE.PlaneGeometry(20, 20, numDays - 1, numPaths - 1);
    const positions = geo.attributes.position.array as Float32Array;
    
    const colors = new Float32Array(positions.length);
    const colorLow = new THREE.Color("#f43f5e"); // Rose-500
    const colorHigh = new THREE.Color("#10b981"); // Emerald-500

    for (let i = 0; i < numPaths; i++) {
      for (let j = 0; j < numDays; j++) {
        const idx = i * numDays + j;
        const price = sampledPaths[i][j];
        // Normalize price to a vertical height between 0 and 10
        const normalizedPrice = ((price - minPrice) / priceRange) * 10;
        // Z is the 3rd element. Plane is initially on X-Y, we map Z to price so when rotated to X-Z it becomes height.
        positions[idx * 3 + 2] = normalizedPrice;

        const t = Math.min(1, Math.max(0, (price - minPrice) / priceRange));
        const vertexColor = colorLow.clone().lerp(colorHigh, t);
        
        colors[idx * 3] = vertexColor.r;
        colors[idx * 3 + 1] = vertexColor.g;
        colors[idx * 3 + 2] = vertexColor.b;
      }
    }
    
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [paths]);

  if (!paths || paths.length === 0 || !geometry) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 min-h-[500px]">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
        <p className="text-lg font-medium text-slate-300">Simulation Visualization Area</p>
        <p className="text-sm mt-2 text-slate-500 max-w-sm mx-auto text-center">
          Awaiting Monte Carlo paths. Click "Run Analytics" to generate the 3D risk manifold.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] cursor-grab active:cursor-grabbing rounded-xl overflow-hidden">
      <Canvas camera={{ position: [15, 12, 15], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 20, 10]} intensity={1} color="#ffffff" />
        <CameraLight />
        
        <AnimatedMesh geometry={geometry} />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2 - 0.05} // keep camera above the floor
        />
        <gridHelper args={[25, 25, '#1e293b', '#0f172a']} position={[0, -5.1, 0]} />
      </Canvas>
    </div>
  );
}
