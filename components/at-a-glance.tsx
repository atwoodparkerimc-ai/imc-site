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

    const particles: { x: number, y: number, r: number, a: number, speed: number, dist: number, baseAlpha: number, type: 'white' | 'red' | 'blue' }[] = [];
    // Optimized particle count: 280 keeps high visual density while drastically saving mobile CPU/battery
    const particleCount = 280;
    const center = size / 2;

    for (let i = 0; i < particleCount; i++) {
      const rand = Math.random();
      let type: 'white' | 'red' | 'blue' = 'white';
      if (rand > 0.8) {
        type = 'red'; // #ea1f27
      } else if (rand > 0.4) {
        type = 'blue'; // #0088ff
      }

      particles.push({
        x: 0, 
        y: 0,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * Math.PI * 2,
        dist: Math.random() * (center - 2),
        speed: (Math.random() - 0.5) * 0.008,
        baseAlpha: Math.random() * 0.85 + 0.15,
        type
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
        
        if (p.type === 'red') {
          ctx.fillStyle = `rgba(234, 31, 39, ${finalOpacity})`;
        } else if (p.type === 'blue') {
          ctx.fillStyle = `rgba(0, 136, 255, ${finalOpacity})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        }
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
  { prefix: "", value: "1995", label: "Year Established", borderColor: "#ea1f27", glowColor: "rgba(234,31,39,0.7)", shadowColor: "rgba(234,31,39,0.25)" },
  { prefix: "", value: "12,600", label: "Sq Ft Shop Space", borderColor: "#64748b", glowColor: "rgba(100,116,139,0.7)", shadowColor: "rgba(100,116,139,0.25)" },
  { prefix: "+", value: "75", label: "Specialized Craftsmen", borderColor: "#64748b", glowColor: "rgba(100,116,139,0.7)", shadowColor: "rgba(100,116,139,0.25)" },
  { prefix: "+", value: "21", label: "Manufacturers Served", borderColor: "#0088ff", glowColor: "rgba(0,136,255,0.7)", shadowColor: "rgba(0,136,255,0.25)" },
];

export default function AtAGlance() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
      {/* 2x2 Grid with uniform spacing across columns and rows (gap-8 on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8 justify-items-center">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col items-center justify-center w-full group cursor-default">
            
            {/* Sized Wrapper: Proportioned so orbit rings do not collide or overlap */}
            <div className="relative w-[140px] h-[140px] sm:w-60 sm:h-60 lg:w-64 lg:h-64 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              
              {/* Primary Neon Orbit Ring (Forward) */}
              <div 
                className="absolute -inset-1 sm:-inset-1.5 rounded-full border border-transparent opacity-80 animate-[spin_8s_linear_infinite] pointer-events-none transition-all duration-300 group-hover:opacity-100"
                style={{
                  borderTopColor: metric.borderColor,
                  borderBottomColor: metric.borderColor === '#ea1f27' ? '#0088ff' : metric.borderColor === '#0088ff' ? '#ea1f27' : '#64748b',
                  filter: `drop-shadow(0 0 6px ${metric.borderColor}) drop-shadow(0 0 12px ${metric.glowColor})`
                }}
              />
              
              {/* Secondary Accent Orbit Ring (Reverse) */}
              <div 
                className="absolute -inset-2.5 sm:-inset-3.5 rounded-full border border-transparent opacity-60 animate-[spin_14s_linear_infinite_reverse] pointer-events-none transition-all duration-300 group-hover:opacity-90"
                style={{
                  borderLeftColor: metric.borderColor === '#ea1f27' ? '#64748b' : '#ea1f27',
                  borderRightColor: metric.borderColor,
                  filter: `drop-shadow(0 0 8px ${metric.glowColor})`
                }}
              />

              {/* Ambient Circular Backlight Glow */}
              <div 
                className="absolute inset-0 rounded-full blur-lg sm:blur-xl pointer-events-none transition-colors duration-500"
                style={{ backgroundColor: metric.borderColor === '#ea1f27' ? 'rgba(234,31,39,0.1)' : metric.borderColor === '#0088ff' ? 'rgba(0,136,255,0.1)' : 'rgba(100,116,139,0.1)' }} 
              />

              {/* Main Housing Container */}
              <div 
                className="relative w-full h-full flex flex-col items-center justify-center rounded-full border bg-[#020b1a]/90 overflow-hidden transition-colors duration-300 px-2 sm:px-4 text-center shadow-inner"
                style={{ 
                  borderColor: metric.borderColor,
                  boxShadow: `inset 0 0 25px ${metric.shadowColor}`
                }}
              >
                <ParticleCloud />

                {/* Number & Prefix */}
                <div className="relative flex items-start z-10">
                  {metric.prefix && (
                    <span className="text-base sm:text-2xl lg:text-3xl font-bold text-white leading-none mt-0.5 sm:mt-1.5 mr-0.5 drop-shadow-md">
                      {metric.prefix}
                    </span>
                  )}
                  <span className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_16px_rgba(0,0,0,0.95)]">
                    {metric.value}
                  </span>
                </div>

                {/* Metric Label (Standardized Legible Scale: text-[10px] min on mobile) */}
                <div className="relative z-10 mt-1 sm:mt-2 max-w-[125px] sm:max-w-[190px]">
                  <span 
                    className="font-mono text-[10px] sm:text-xs lg:text-[13px] font-bold uppercase tracking-wider sm:tracking-[0.14em] leading-tight block group-hover:text-white transition-colors duration-300"
                    style={{
                      color: metric.borderColor === '#ea1f27' ? '#ea1f27' : metric.borderColor === '#0088ff' ? '#38bdf8' : '#94a3b8',
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