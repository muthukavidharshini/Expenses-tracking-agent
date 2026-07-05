import React, { useEffect, useRef, useState } from 'react';
import { DollarSign, TrendingUp, Wallet, CreditCard, Percent, Sparkles } from 'lucide-react';

function AnimatedBackground() {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle colors
    const colors = [
      '#3B82F6', // Accent Blue
      '#8B5CF6', // Accent Purple
      '#EC4899', // Accent Pink
      '#06B6D4',  // Accent Cyan
    ];

    // Particles array
    const particles = [];
    const particleCount = 75;
    const maxDistance = 110;
    
    // Mouse positioning for repulsion
    const mouse = {
      x: null,
      y: null,
      radius: 120
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      setIsHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Particle template
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5; // Small dots
        this.speedX = (Math.random() * 0.3) - 0.15; // Slow drift
        this.speedY = (Math.random() * 0.3) - 0.15;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.twinkleSpeed = Math.random() * 0.015 + 0.005;
        this.opacity = Math.random() * 0.6 + 0.15;
        this.opacityDirection = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        // Twinkling effect
        this.opacity += this.twinkleSpeed * this.opacityDirection;
        if (this.opacity >= 0.8) {
          this.opacityDirection = -1;
        } else if (this.opacity <= 0.1) {
          this.opacityDirection = 1;
        }

        // Drifting movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce on boundaries
        if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
        if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

        // Mouse repulsion
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.hypot(dx, dy);
          if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = dx / distance;
            let directionY = dy / distance;
            this.x -= directionX * force * 1.5;
            this.y -= directionY * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Extract RGB hex and write as rgba for clean transparency
        ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.shadowBlur = this.size > 2 ? 8 : 0;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background base color: #050816
      ctx.fillStyle = '#050816';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grids
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.007)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw constellation lines
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.hypot(dx, dy);

          if (distance < maxDistance) {
            let opacity = (1 - (distance / maxDistance)) * 0.12;
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`; // purple tint connections
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      // Animate & draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Canvas Particle Field */}
      <canvas ref={canvasRef} style={{ display: 'block', width: '100vw', height: '100vh' }} />
      
      {/* CSS-in-JS Animations and Styles */}
      <style>{`
        @keyframes float-slow-1 {
          0% { transform: translateY(0) rotate(0deg) translateX(0); }
          50% { transform: translateY(-25px) rotate(180deg) translateX(15px); }
          100% { transform: translateY(0) rotate(360deg) translateX(0); }
        }
        @keyframes float-slow-2 {
          0% { transform: translateY(0) rotate(0deg) translateX(0); }
          50% { transform: translateY(-40px) rotate(-120deg) translateX(-20px); }
          100% { transform: translateY(0) rotate(-360deg) translateX(0); }
        }
        @keyframes float-slow-3 {
          0% { transform: translateY(0) rotate(0deg) translateX(0); }
          50% { transform: translateY(30px) rotate(90deg) translateX(25px); }
          100% { transform: translateY(0) rotate(360deg) translateX(0); }
        }
        @keyframes move-aurora-blue {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15vw, 10vh) scale(1.2); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes move-aurora-purple {
          0% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-10vw, -15vh) scale(0.9); }
          100% { transform: translate(0, 0) scale(1.1); }
        }
        @keyframes move-aurora-pink {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8vw, -10vh) scale(1.15); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes wave-flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Mouse Radial Glow Follower */}
      {isHovering && (
        <div style={{
          position: 'absolute',
          left: mousePos.x - 250,
          top: mousePos.y - 250,
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.04) 50%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'transform 0.1s ease'
        }} />
      )}

      {/* Ambient Aurora lights (Mesh / Orbs) */}
      {/* Accent Purple Orb */}
      <div style={{
        position: 'absolute',
        width: '45vw',
        height: '45vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.09) 0%, transparent 75%)',
        filter: 'blur(90px)',
        top: '-10%',
        left: '-5%',
        animation: 'move-aurora-purple 22s infinite ease-in-out',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Accent Blue/Cyan Orb */}
      <div style={{
        position: 'absolute',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 80%)',
        filter: 'blur(100px)',
        bottom: '-15%',
        right: '-10%',
        animation: 'move-aurora-blue 28s infinite ease-in-out',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Accent Pink Orb */}
      <div style={{
        position: 'absolute',
        width: '35vw',
        height: '35vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, transparent 75%)',
        filter: 'blur(80px)',
        top: '30%',
        right: '15%',
        animation: 'move-aurora-pink 25s infinite ease-in-out',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Floating Finance Vector Icons */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', animation: 'float-slow-1 18s infinite ease-in-out', opacity: 0.18, zIndex: 3, color: '#3B82F6' }}>
        <DollarSign size={32} strokeWidth={1.5} />
      </div>
      <div style={{ position: 'absolute', top: '45%', left: '4%', animation: 'float-slow-2 22s infinite ease-in-out', opacity: 0.12, zIndex: 3, color: '#8B5CF6' }}>
        <Wallet size={36} strokeWidth={1.5} />
      </div>
      <div style={{ position: 'absolute', top: '25%', right: '8%', animation: 'float-slow-3 20s infinite ease-in-out', opacity: 0.15, zIndex: 3, color: '#EC4899' }}>
        <CreditCard size={30} strokeWidth={1.5} />
      </div>
      <div style={{ position: 'absolute', bottom: '25%', left: '15%', animation: 'float-slow-3 24s infinite ease-in-out', opacity: 0.12, zIndex: 3, color: '#06B6D4' }}>
        <TrendingUp size={34} strokeWidth={1.5} />
      </div>
      <div style={{ position: 'absolute', bottom: '35%', right: '12%', animation: 'float-slow-1 16s infinite ease-in-out', opacity: 0.16, zIndex: 3, color: '#3B82F6' }}>
        <Percent size={28} strokeWidth={1.5} />
      </div>
      <div style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', animation: 'float-slow-2 25s infinite ease-in-out', opacity: 0.1, zIndex: 3, color: '#8B5CF6' }}>
        <Sparkles size={24} strokeWidth={1.5} />
      </div>

      {/* Wave at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '200%',
        height: '120px',
        overflow: 'hidden',
        lineHeight: 0,
        transform: 'translateZ(0)',
        opacity: 0.15,
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          style={{
            position: 'relative',
            display: 'block',
            width: '100%',
            height: '100%',
            animation: 'wave-flow 20s linear infinite'
          }}
        >
          <path 
            d="M0,0 C150,90 350,120 600,90 C850,60 1050,90 1200,60 L1200,120 L0,120 Z" 
            style={{ fill: '#0B1023' }} 
          />
          <path 
            d="M1200,0 C1350,90 1550,120 1800,90 C2050,60 2250,90 2400,60 L2400,120 L1200,120 Z" 
            style={{ fill: '#0B1023' }} 
          />
        </svg>
      </div>
    </div>
  );
}

export default AnimatedBackground;
