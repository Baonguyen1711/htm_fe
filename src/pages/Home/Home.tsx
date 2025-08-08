import React, { useState, useEffect } from "react";
import Footer from "../../components/ui/Footer";
import { Button } from '../../shared/components/ui';

function Home() {

  const images = [
    "/banner.jpg",
    "/card.jpg", 
    "/ending.jpg"
  ];

  const [index, setIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("gioi-thieu");

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const cardTitles = ["Bản Lĩnh Hải Vương", "Vượt Thái Bình Dương", "Chinh Phục Đỉnh Cao", "Đương đầu Thử Thách"];

  return (
    <div className="min-h-screen relative overflow-auto">
      {/* Ocean/Starry Night Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-blue-600">
        {/* Stars overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:100px_100px]"></div>
        {/* Ocean waves effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/50 to-transparent"></div>
        {/* Subtle animated waves */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10">
        {/* Hero Banner */}
        <div className="relative w-full h-[400px] bg-gradient-to-r from-blue-800/80 via-cyan-700/80 to-blue-900/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/30 to-slate-900/50"></div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white">
              <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-4 text-transparent bg-gradient-to-r from-blue-200 to-cyan-100 bg-clip-text">
                Hành Trình Magellan
              </h1>
              <p className="text-xl lg:text-2xl text-blue-200/90 font-light tracking-wide">
                Khám phá tri thức vượt đại dương
              </p>
            </div>
          </div>
        </div>

        {/* Challenge Cards */}
        <div className="relative flex justify-center gap-4 lg:gap-6 py-10 -mt-40 max-w-6xl mx-auto px-4">
          {cardTitles.map((title, cardIndex) => (
            <div
              key={cardIndex}
              className="relative bg-slate-800/80 backdrop-blur-sm border border-blue-400/30 shadow-2xl overflow-hidden w-44 lg:w-52 transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20 cursor-pointer group rounded-lg"
            >
              <div className="relative h-48 lg:h-60 overflow-hidden">
                <img 
                  src={`/card.jpg`} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              </div>
              <div className="absolute bottom-0 w-full p-3">
                <div className="text-white text-sm lg:text-base font-semibold text-center">
                  {title}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Section */}
        <div className="flex flex-col lg:flex-row items-start justify-between max-w-6xl mx-auto p-6 gap-10">
          {/* Introduction Section */}
          <div className="w-full lg:w-1/2">
            {/* Custom Tabs */}
            <div className="w-full">
              <div className="flex w-full bg-slate-800/80 backdrop-blur-sm border border-blue-400/30 rounded-md">
                <Button
                  onClick={() => setActiveTab("gioi-thieu")}
                  variant={activeTab === "gioi-thieu" ? "primary" : "ghost"}
                  size="sm"
                  className={`flex-1 text-sm font-medium rounded-l-md transition-colors ${
                    activeTab === "gioi-thieu"
                      ? ""
                      : "text-blue-200 hover:bg-blue-600/20"
                  }`}
                >
                  Giới thiệu
                </Button>
                <Button
                  onClick={() => setActiveTab("thong-tin")}
                  variant={activeTab === "thong-tin" ? "primary" : "ghost"}
                  size="sm"
                  className={`flex-1 text-sm font-medium rounded-r-md transition-colors ${
                    activeTab === "thong-tin"
                      ? ""
                      : "text-blue-200 hover:bg-blue-600/20"
                  }`}
                >
                  Thông tin ứng dụng
                </Button>
              </div>
              
              <div className="mt-6">
                {activeTab === "gioi-thieu" && (
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-blue-400/30 p-6 shadow-xl">
                    <p className="text-blue-100 leading-relaxed">
                      Hành trình Magellan (HTM) là một cuộc thi kiến thức dành cho học sinh THPT tại Quảng Nam, được tổ chức và quản lý bởi học sinh trường THPT chuyên Nguyễn Bỉnh Khiêm.
                    </p>
                  </div>
                )}
                
                {activeTab === "thong-tin" && (
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-blue-400/30 p-6 shadow-xl">
                    <p className="text-blue-100 leading-relaxed">
                      Với sứ mệnh lan tỏa niềm đam mê khám phá tri thức, đội ngũ Hành Trình Magellan đã phát triển một nền tảng trực tuyến mô phỏng một trận đấu theo format của chương trình, giúp học sinh THPT không chỉ rèn luyện kiến thức mà còn trải nghiệm những thử thách hấp dẫn như một hành trình thực thụ.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
              <Button
                onClick={() => window.location.href = "/join"}
                variant="primary"
                size="lg"
                className="font-medium shadow-lg"
              >
                Tham gia phòng thi
              </Button>
              <Button
                onClick={() => window.location.href = "/spectatorJoin"}
                variant="primary"
                size="lg"
                className="font-medium shadow-lg"
              >
                Tham gia phòng thi với tư cách khán giả
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-medium backdrop-blur-sm"
              >
                Luật chơi
              </Button>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="relative w-full lg:w-1/2 h-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl border border-blue-400/30">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Magellan Journey"
                className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
            
            {/* Image indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? "bg-blue-400 w-6" : "bg-white/50 w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Placeholder */}
        <div className="mt-20 border-t border-blue-400/30 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto p-8 text-center">
            <p className="text-blue-200/80">
              © 2025 Hành Trình Magellan. 
              <br/>
              Developed by Nguyen Van Duy Bao
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
