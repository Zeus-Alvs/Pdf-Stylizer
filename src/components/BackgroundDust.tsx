"use client";

import { useEffect, useRef } from 'react';

export default function BackgroundDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Controla a densidade
    let particleCount = Math.floor((width * height) / 7000); 
    let particles: Particle[] = [];
    let animationFrameId: number;
    
    let mouse = {
      x: -1000,
      y: -1000,
      radius: 120
    };

    class Particle {
      baseX: number;
      baseY: number;
      x: number;
      y: number;
      size: number;
      opacity: number;
      vx: number;
      vy: number;

      constructor() {
        this.baseX = Math.random() * width;
        this.baseY = Math.random() * height;
        this.x = this.baseX;
        this.y = this.baseY;
        this.size = Math.random() * 1.0 + 1.0; 
        this.opacity = Math.random() * 0.35 + 0.10; 
        
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1 - 0.15; 
      }
      
      update() {
        this.baseX += this.vx;
        this.baseY += this.vy;
        
        if (this.baseX < 0) this.baseX = width;
        if (this.baseX > width) this.baseX = 0;
        if (this.baseY < 0) this.baseY = height;
        if (this.baseY > height) this.baseY = 0;
        
        let dx = mouse.x - this.baseX;
        let dy = mouse.y - this.baseY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let force = Math.pow((mouse.radius - distance) / mouse.radius, 2);
          
          let pushX = forceDirectionX * force * 30;
          let pushY = forceDirectionY * force * 30;
          
          this.x = this.baseX - pushX;
          this.y = this.baseY - pushY;
        } else {
          this.x -= (this.x - this.baseX) * 0.05;
          this.y -= (this.y - this.baseY) * 0.05;
        }
      }
      
      draw() {
        if (!ctx) return;
        // Substitua esta cor RGBA para combinar com o tema do seu novo projeto
        ctx.fillStyle = `rgba(201, 169, 110, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particleCount = Math.floor((width * height) / 7000);
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    init();
    animate();

    // Cleanup function para não vazar memória no React
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
