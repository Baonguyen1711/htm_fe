import React, { useEffect, useState } from "react";
import WaveBackground from "../../components/WaveBackground";

export default function App() {
  const images = ["/banner.jpg", "/card.jpg", "/ending.jpg"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setIndex((p) => (p + 1) % images.length);
    }, 3500);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600"
      style={{
        backgroundImage: "url('/images/background_curve_3.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      {/* <WaveBackground /> */}

      {/* Header */}
      <header className="relative z-10 border-b border-cyan-700/40 px-6 py-4 flex gap-4 items-center">
        <img src="/images/magellan-logo.png" className="w-10 h-10" alt="Magellan Logo" />
        <div>
          <h1 className="text-white text-2xl font-bold">Hành Trình Magellan</h1>
          <p className="text-white/70 text-sm">Khám phá tri thức vượt đại dương</p>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 px-6 md:px-16 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <h1 className="text-6xl font-bold text-white leading-tight">
              Hành Trình <br /> Magellan
            </h1>
            <p className="text-white/80 max-w-lg"
              style={{
                marginBottom: "100px",
              }}
            >
              Nền tảng thi đấu trực tuyến của hành trình Magellan (HTM) - một cuộc thi kiến thức dành cho học sinh THPT tại Quảng Nam, tổ chức và quản lý bởi
              học sinh THPT chuyên Nguyễn Bỉnh Khiêm. <br/>
            </p>
            <button className="px-8 py-4 rounded-full text-white font-semibold hover:scale-105 transition"
              style={{
                backgroundColor: "#001f3f",
              }}

              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Bắt đầu ngay
            </button>
          </div>

          {/* Carousel */}
          <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl">
            {images.map((img, i) => (
              <div
                key={img}
                className={`absolute inset-0 bg-cover bg-center transition-all duration-1000
                  ${i === index ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                style={{ backgroundImage: `url(${img})` }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-400/30 text-center p-8 text-black/50">
        © 2025 Hành Trình Magellan <br />
        Developed by Nguyen Van Duy Bao
      </footer>
    </div>
  );
}