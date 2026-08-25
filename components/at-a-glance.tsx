"use client";
import { useEffect, useRef } from 'react';

const ParticleCloud = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 240; 
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.scale(2, 2);

    const particles: { x: number, y: number, r: number, a: number, speed: number, dist: number, baseAlpha: number, isWhite: boolean }[] = [];
    const particleCount = 600;
    const center = size / 2;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 0, 
        y: 0,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * Math.PI * 2,
        dist: Math.random() * (center - 2),
        speed: (Math.random() - 0.5) * 0.008,
        baseAlpha: Math.random() * 0.85 + 0.15,
        isWhite: Math.random() > 0.7
      });
    }

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, size, size);
      
      particles.forEach(p => {
        p.a += p.speed;
        p.x = center + Math.cos(p.a) * p.dist;
        p.y = center + Math.sin(p.a) * p.dist;

        const distanceFromCenter = Math.sqrt(Math.pow(p.x - center, 2) + Math.pow(p.y - center, 2));
        const edgeFade = Math.max(0, 1 - (distanceFromCenter / (center - 4)));
        const finalOpacity = edgeFade * p.baseAlpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.isWhite ? `rgba(255, 255, 255, ${finalOpacity})` : `rgba(0, 136, 255, ${finalOpacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 rounded-full mix-blend-screen pointer-events-none" />;
};

const metrics = [
  { prefix: "", value: "1995", label: "Year Established" },
  { prefix: "", value: "12,600", label: "Sq Ft Shop Space" },
  { prefix: "+", value: "75", label: "Specialized Craftsmen" },
  { prefix: "+", value: "21", label: "Manufacturers Served" },
];

export default function AtAGlance() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 justify-items-center">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col items-center justify-center w-full group cursor-default">
            
            {/* Sized Wrapper */}
            <div className="relative w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              
              {/* Primary Neon Orbit Ring (Forward) */}
              <div 
                className="absolute -inset-1.5 rounded-full border border-transparent border-t-[#00a6ff] border-b-[#0066ff] opacity-80 animate-[spin_8s_linear_infinite] pointer-events-none transition-all duration-300 group-hover:opacity-100"
                style={{
                  filter: 'drop-shadow(0 0 8px #00a6ff) drop-shadow(0 0 16px rgba(0,166,255,0.7))'
                }}
              />
              
              {/* Secondary Accent Orbit Ring (Reverse) */}
              <div 
                className="absolute -inset-3.5 rounded-full border border-transparent border-l-[#38bdf8] border-r-[#0088ff] opacity-60 animate-[spin_14s_linear_infinite_reverse] pointer-events-none transition-all duration-300 group-hover:opacity-90"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.6))'
                }}
              />

              {/* Ambient Circular Backlight Glow */}
              <div className="absolute inset-0 rounded-full bg-[#0088ff]/10 blur-xl pointer-events-none group-hover:bg-[#0088ff]/25 transition-colors duration-500" />

              {/* Main Housing Container */}
              <div className="relative w-full h-full flex flex-col items-center justify-center rounded-full border border-[#0088ff]/50 group-hover:border-[#00a6ff] shadow-[inset_0_0_35px_rgba(0,136,255,0.25)] bg-[#020b1a]/90 overflow-hidden transition-colors duration-300 px-4 text-center">
                <ParticleCloud />

                {/* Number & Prefix */}
                <div className="relative flex items-start z-10">
                  {metric.prefix && (
                    <span className="text-2xl sm:text-3xl font-bold text-white leading-none mt-1.5 mr-0.5 drop-shadow-md">
                      {metric.prefix}
                    </span>
                  )}
                  <span className="text-5xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_16px_rgba(0,0,0,0.95)]">
                    {metric.value}
                  </span>
                </div>

                {/* Prominent, Larger Metric Label */}
                <div className="relative z-10 mt-2 max-w-[190px]">
                  <span 
                    className="text-xs sm:text-[13px] font-black text-[#38bdf8] uppercase tracking-[0.14em] leading-tight block group-hover:text-white transition-colors duration-300"
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.95), 0 0 14px rgba(0, 136, 255, 0.7)'
                    }}
                  >
                    {metric.label}
                  </span>
                </div>

              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}