'use client';

import { useEffect, useRef } from 'react';

interface Agent {
  x: number;
  y: number;
  speed: number;
  direction: 'up' | 'down' | 'left' | 'right';
  trail: { x: number; y: number }[];
  maxTrailLength: number;
  isPacket: boolean;
  packetTimer: number;
}

interface PulseNode {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  alpha: number;
}

export default function BlueprintBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const CELL_SIZE = 48;
    const isMobile = width < 768;
    const AGENT_COUNT = isMobile ? 18 : 40;

    // Mouse coordinates for cursor attraction / push
    const mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    // Scroll parallax tracking
    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Snap to nearest grid line
    const snapToGrid = (val: number) => Math.round(val / CELL_SIZE) * CELL_SIZE;

    // Initialize Agents
    const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
    const agents: Agent[] = [];

    for (let i = 0; i < AGENT_COUNT; i++) {
      const startX = snapToGrid(Math.random() * width);
      const startY = snapToGrid(Math.random() * height);
      agents.push({
        x: startX,
        y: startY,
        speed: 30 + Math.random() * 40, // 30-70 px/s
        direction: directions[Math.floor(Math.random() * directions.length)],
        trail: [],
        maxTrailLength: 40 + Math.random() * 40,
        isPacket: false,
        packetTimer: 0,
      });
    }

    // Node Pulses
    const pulseNodes: PulseNode[] = [];
    let pulseInterval = setInterval(() => {
      const col = Math.floor(Math.random() * (width / CELL_SIZE));
      const row = Math.floor(Math.random() * (height / CELL_SIZE));
      pulseNodes.push({
        x: col * CELL_SIZE,
        y: row * CELL_SIZE,
        size: 0,
        maxSize: 32,
        alpha: 1,
      });
    }, 9000); // 8-12 seconds

    // Data packet flash every ~6s
    let packetInterval = setInterval(() => {
      if (agents.length === 0) return;
      const targetAgent = agents[Math.floor(Math.random() * agents.length)];
      targetAgent.isPacket = true;
      targetAgent.packetTimer = 1.5; // 1.5 seconds
    }, 6000);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);

    // If user prefers reduced motion, draw once and stop
    if (prefersReducedMotion) {
      // Draw static graph paper grid
      ctx.fillStyle = '#0B1F3A';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(242, 239, 230, 0.06)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= width; x += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Static yellow points
      ctx.fillStyle = '#FFD23F';
      for (let i = 0; i < 15; i++) {
        const x = snapToGrid(Math.random() * width);
        const y = snapToGrid(Math.random() * height);
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
      return;
    }

    // Main Animation Loop with delta time
    let lastTime = performance.now();

    const draw = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // seconds
      lastTime = currentTime;

      // 1. Clear with base Navy
      ctx.fillStyle = '#0B1F3A';
      ctx.fillRect(0, 0, width, height);

      // Parallax grid offset (shifts up to 12px)
      const offsetY = (scrollY * 0.03) % CELL_SIZE;

      // 2. Draw Graph-Paper Grid (48px cells)
      for (let x = 0; x <= width; x += CELL_SIZE) {
        const colIndex = Math.round(x / CELL_SIZE);
        const isMajor = colIndex % 5 === 0;

        // Base opacity 6%, 5th line 12%
        let strokeAlpha = isMajor ? 0.12 : 0.06;

        // Mouse proximity highlight (within 160px)
        if (mouse.active) {
          const dist = Math.abs(x - mouse.x);
          if (dist < 160) {
            const factor = 1 - dist / 160;
            strokeAlpha = Math.max(strokeAlpha, 0.06 + factor * 0.29); // up to 35%
          }
        }

        ctx.strokeStyle = `rgba(242, 239, 230, ${strokeAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }

      for (let y = -CELL_SIZE; y <= height + CELL_SIZE; y += CELL_SIZE) {
        const adjustedY = y + offsetY;
        const rowIndex = Math.round(y / CELL_SIZE);
        const isMajor = rowIndex % 5 === 0;

        let strokeAlpha = isMajor ? 0.12 : 0.06;

        if (mouse.active) {
          const dist = Math.abs(adjustedY - mouse.y);
          if (dist < 160) {
            const factor = 1 - dist / 160;
            strokeAlpha = Math.max(strokeAlpha, 0.06 + factor * 0.29);
          }
        }

        ctx.strokeStyle = `rgba(242, 239, 230, ${strokeAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, adjustedY + 0.5);
        ctx.lineTo(width, adjustedY + 0.5);
        ctx.stroke();
      }

      // 3. Update & Draw Node Pulses (expanding square outline)
      for (let i = pulseNodes.length - 1; i >= 0; i--) {
        const node = pulseNodes[i];
        node.size += 28 * dt;
        node.alpha -= 0.9 * dt;

        if (node.alpha <= 0) {
          pulseNodes.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(255, 210, 63, ${node.alpha})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(node.x - node.size / 2, node.y - node.size / 2, node.size, node.size);
      }

      // 4. Update & Draw Agents
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];

        // Store trail
        agent.trail.unshift({ x: agent.x, y: agent.y });
        if (agent.trail.length > agent.maxTrailLength) {
          agent.trail.pop();
        }

        // Move along direction
        const step = agent.speed * dt;
        let prevCoord = agent.direction === 'left' || agent.direction === 'right' ? agent.x : agent.y;

        if (agent.direction === 'left') agent.x -= step;
        else if (agent.direction === 'right') agent.x += step;
        else if (agent.direction === 'up') agent.y -= step;
        else if (agent.direction === 'down') agent.y += step;

        let newCoord = agent.direction === 'left' || agent.direction === 'right' ? agent.x : agent.y;

        // Check if agent crossed a grid intersection
        const crossedGridLine =
          Math.floor(Math.min(prevCoord, newCoord) / CELL_SIZE) !==
          Math.floor(Math.max(prevCoord, newCoord) / CELL_SIZE);

        if (crossedGridLine) {
          // Snap exact perpendicular alignment
          if (agent.direction === 'left' || agent.direction === 'right') {
            agent.y = snapToGrid(agent.y);
          } else {
            agent.x = snapToGrid(agent.x);
          }

          // 25% chance of turning 90 degrees
          if (Math.random() < 0.25) {
            if (agent.direction === 'left' || agent.direction === 'right') {
              agent.direction = Math.random() < 0.5 ? 'up' : 'down';
            } else {
              agent.direction = Math.random() < 0.5 ? 'left' : 'right';
            }
          }
        }

        // Cursor push force (agents steer away gently if within 100px)
        if (mouse.active) {
          const dx = agent.x - mouse.x;
          const dy = agent.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 100 && dist > 0) {
            // Push along current axis
            if (Math.abs(dx) > Math.abs(dy)) {
              agent.direction = dx > 0 ? 'right' : 'left';
            } else {
              agent.direction = dy > 0 ? 'down' : 'up';
            }
          }
        }

        // Screen wrap / respawn at edge
        if (agent.x < -CELL_SIZE || agent.x > width + CELL_SIZE || agent.y < -CELL_SIZE || agent.y > height + CELL_SIZE) {
          const edge = Math.floor(Math.random() * 4);
          if (edge === 0) {
            // top
            agent.x = snapToGrid(Math.random() * width);
            agent.y = 0;
            agent.direction = 'down';
          } else if (edge === 1) {
            // bottom
            agent.x = snapToGrid(Math.random() * width);
            agent.y = snapToGrid(height);
            agent.direction = 'up';
          } else if (edge === 2) {
            // left
            agent.x = 0;
            agent.y = snapToGrid(Math.random() * height);
            agent.direction = 'right';
          } else {
            // right
            agent.x = snapToGrid(width);
            agent.y = snapToGrid(Math.random() * height);
            agent.direction = 'left';
          }
          agent.trail = [];
        }

        // Packet timer
        if (agent.isPacket) {
          agent.packetTimer -= dt;
          if (agent.packetTimer <= 0) {
            agent.isPacket = false;
          }
        }

        // Draw fading trail
        for (let t = 0; t < agent.trail.length; t++) {
          const p = agent.trail[t];
          const alpha = (1 - t / agent.trail.length) * (agent.isPacket ? 0.75 : 0.45);
          ctx.fillStyle = `rgba(255, 210, 63, ${alpha})`;
          ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        }

        // Draw agent square (3x3px normal, 5x5px if packet)
        const size = agent.isPacket ? 5 : 3;
        ctx.fillStyle = '#FFD23F';
        ctx.fillRect(agent.x - size / 2, agent.y - size / 2, size, size);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Pause on hidden tab
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(pulseInterval);
      clearInterval(packetInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Light navy vignette at edges to keep periphery subtle */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(11,31,58,0.6)_100%)] pointer-events-none" />
    </div>
  );
}
