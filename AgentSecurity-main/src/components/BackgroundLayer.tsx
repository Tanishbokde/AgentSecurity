import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sparkle } from 'lucide-react';

export const BackgroundLayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.opacity = '0.45';
    container.appendChild(renderer.domElement);

    // Particle nodes
    const particleCount = 110;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    const silverColor = new THREE.Color('#C0C0C0');
    const redColor = new THREE.Color('#E10600');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;

      velocities.push({
        x: (Math.random() - 0.5) * 0.25,
        y: (Math.random() - 0.5) * 0.25,
        z: (Math.random() - 0.5) * 0.15,
      });

      // ~18% red nodes, remainder silver
      const isRed = Math.random() < 0.18;
      const c = isRed ? redColor : silverColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circle point texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Connecting Lines
    const maxConnections = particleCount * 5;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.12;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.12;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Tab visibility pause
    let isPaused = document.hidden;
    const handleVisibility = () => {
      isPaused = document.hidden;
      if (!isPaused && !animFrameIdRef.current) {
        animate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      if (isPaused) {
        animFrameIdRef.current = null;
        return;
      }

      if (!prefersReducedMotion) {
        targetX += (mouseX - targetX) * 0.04;
        targetY += (mouseY - targetY) * 0.04;
        camera.position.x = targetX;
        camera.position.y = -targetY;
        camera.lookAt(scene.position);

        const posArr = particleGeometry.attributes.position.array as Float32Array;
        let lineIdx = 0;

        for (let i = 0; i < particleCount; i++) {
          posArr[i * 3] += velocities[i].x;
          posArr[i * 3 + 1] += velocities[i].y;
          posArr[i * 3 + 2] += velocities[i].z;

          // Wrap boundaries
          if (posArr[i * 3] < -400 || posArr[i * 3] > 400) velocities[i].x *= -1;
          if (posArr[i * 3 + 1] < -300 || posArr[i * 3 + 1] > 300) velocities[i].y *= -1;
          if (posArr[i * 3 + 2] < -200 || posArr[i * 3 + 2] > 200) velocities[i].z *= -1;

          // Connect adjacent particles
          for (let j = i + 1; j < particleCount; j++) {
            const dx = posArr[i * 3] - posArr[j * 3];
            const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
            const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < 85 && lineIdx < maxConnections) {
              linePositions[lineIdx * 6] = posArr[i * 3];
              linePositions[lineIdx * 6 + 1] = posArr[i * 3 + 1];
              linePositions[lineIdx * 6 + 2] = posArr[i * 3 + 2];
              linePositions[lineIdx * 6 + 3] = posArr[j * 3];
              linePositions[lineIdx * 6 + 4] = posArr[j * 3 + 1];
              linePositions[lineIdx * 6 + 5] = posArr[j * 3 + 2];

              // Color line based on connected nodes
              const isEitherRed =
                colors[i * 3] > 0.8 || colors[j * 3] > 0.8;
              const r = isEitherRed ? 0.88 : 0.65;
              const g = isEitherRed ? 0.05 : 0.65;
              const b = isEitherRed ? 0.05 : 0.7;

              lineColors[lineIdx * 6] = r;
              lineColors[lineIdx * 6 + 1] = g;
              lineColors[lineIdx * 6 + 2] = b;
              lineColors[lineIdx * 6 + 3] = r;
              lineColors[lineIdx * 6 + 4] = g;
              lineColors[lineIdx * 6 + 5] = b;

              lineIdx++;
            }
          }
        }

        particleGeometry.attributes.position.needsUpdate = true;
        lineGeometry.attributes.position.needsUpdate = true;
        lineGeometry.attributes.color.needsUpdate = true;
        lineGeometry.setDrawRange(0, lineIdx * 2);
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);

      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      texture.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Deep black page background (#050506) */}
      <div className="absolute inset-0 bg-[#050506]" />

      {/* Soft radial red glows in corners */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(225, 6, 0, 0.08) 0%, rgba(5, 5, 6, 0) 70%)',
        }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 0, 0, 0.07) 0%, rgba(5, 5, 6, 0) 70%)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(255, 42, 42, 0.03) 0%, rgba(5, 5, 6, 0) 70%)',
        }}
      />

      {/* Subtle cyber grid and vignette overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(192, 192, 192, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(192, 192, 192, 0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(5, 5, 6, 0.85) 100%)',
        }}
      />

      {/* Three.js Interactive Particle Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-none" />

      {/* Large faint shield watermark behind center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.035] text-[#C0C0C0]">
        <svg width="600" height="600" viewBox="0 0 64 64" fill="none">
          <path
            d="M32 4L8 14.5V31C8 46.5 18.2 58.5 32 62C45.8 58.5 56 46.5 56 31V14.5L32 4Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <path
            d="M32 9L13 17.5V30.5C13 43 21 53 32 56C43 53 51 43 51 30.5V17.5L32 9Z"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <circle cx="32" cy="24" r="6" stroke="currentColor" strokeWidth="1" />
          <path
            d="M20 44C20 37.4 25.4 32 32 32C38.6 32 44 37.4 44 44"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Faint Monospace telemetry code text on right side */}
      <div className="hidden lg:block absolute right-10 top-24 xl:right-20 font-mono text-[10px] leading-relaxed text-[#8A8A92]/20 space-y-1.5 max-w-xs text-left pointer-events-none">
        <p className="text-[#FF2A2A]/40 font-semibold">// AGENT GUARD SECURITY ENCLAVE</p>
        <p>0x7FFD2B8A [SYS_INIT] PALETTE=BLACK_RED_SILVER</p>
        <p>CIPHER: AES-256-GCM-SHA384 [ACTIVE]</p>
        <p>ENCLAVE_STATUS: ZERO_TRUST_VERIFIED</p>
        <p>GUARDIAN_POLICY: ENFORCED (HASH_OK)</p>
        <p>AUTONOMY_SANDBOX: ISOLATED_ENCLAVE</p>
        <p>SPECTRE_CANARY: ARMED [STK_PROT_ON]</p>
        <p>NODE_DEFENSE: REALTIME_SURVEILLANCE</p>
        <p className="text-[#FF2A2A]/30 font-medium">// RESTRAINT_CORE_ENGAGED</p>
      </div>

      {/* Small silver sparkle icon at bottom right */}
      <div className="absolute bottom-6 right-8 opacity-20 text-[#C0C0C0]">
        <Sparkle
          size={40}
          className="stroke-[1.2] animate-pulse-subtle"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
