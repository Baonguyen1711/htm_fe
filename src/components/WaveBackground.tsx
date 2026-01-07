import React from "react";

const WaveBackground: React.FC = () => {
  const svgStyle: React.CSSProperties = {
    willChange: "transform",
    transformBox: "fill-box",
    transformOrigin: "0 0",
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Wave 1 - Bottom layer, slowest */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-48 animate-wave-slow"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={svgStyle}
        aria-hidden
      >
        <path
          // use explicit rgba so it's visible even if CSS var missing
          fill="rgba(255,255,255,0.06)"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Wave 2 - Middle layer */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-40 animate-wave-medium"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={svgStyle}
        aria-hidden
      >
        <path
          fill="rgba(255,255,255,0.04)"
          d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Wave 3 - Top layer, fastest */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-32 animate-wave-fast"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={svgStyle}
        aria-hidden
      >
        <path
          fill="rgba(255,255,255,0.03)"
          d="M0,256L48,261.3C96,267,192,277,288,266.7C384,256,480,224,576,218.7C672,213,768,235,864,245.3C960,256,1056,256,1152,245.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Floating particles */}
      <div className="absolute bottom-20 left-[10%] w-3 h-3 rounded-full bg-cyan-300/30 animate-float-slow" />
      <div className="absolute bottom-32 left-[25%] w-2 h-2 rounded-full bg-blue-300/20 animate-float-fast" />
      <div className="absolute bottom-24 left-[40%] w-4 h-4 rounded-full bg-cyan-200/25 animate-float-medium" />
      <div className="absolute bottom-40 left-[60%] w-2 h-2 rounded-full bg-blue-200/30 animate-float-slow" />
      <div className="absolute bottom-28 left-[75%] w-3 h-3 rounded-full bg-cyan-300/20 animate-float-medium" />
      <div className="absolute bottom-36 left-[90%] w-2 h-2 rounded-full bg-blue-300/25 animate-float-fast" />
    </div>
  );
};

export default WaveBackground;