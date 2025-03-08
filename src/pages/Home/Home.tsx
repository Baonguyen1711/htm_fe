import React, { useState, useEffect } from "react";

import banner from "../../assets/banner.jpg";
import card from "../../assets/card.jpg";
import ending from "../../assets/ending.jpg";

import Footer from "../../layouts/Footer";

function Home() {
  const images = [ending, card, banner];

  const [index, setIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("giới-thiệu");

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Chuyển ảnh mỗi 3 giây

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white text-black">
      {/* Banner */}
      <div className="relative w-full h-[400px] bg-cover bg-center" style={{ backgroundImage: `url(${banner})` }}>
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Cards */}
      <div className="relative flex justify-center gap-6 py-10 -mt-40 max-w-5xl mx-auto">
        {["Bản Lĩnh Hải Vương", "Vượt Thái Bình Dương", "Chinh Phục Đỉnh Cao", "Đương đầu Thử Thách"].map((title, index) => (
          <div
            key={index}
            className="relative bg-white shadow-lg rounded-xl overflow-hidden w-52 transform transition-transform duration-300 hover:scale-105 cursor-pointer"
          >
            <img src={card} alt={title} className="w-full h-60 object-cover rounded-xl" />
            <div className="absolute bottom-0 w-full bg-black/50 text-white text-sm font-semibold text-center py-1">
              {title}
            </div>
          </div>
        ))}
      </div>

      {/* Giới thiệu + Ảnh */}
      <div className="flex items-center justify-between max-w-5xl mx-auto p-6 gap-10">
        {/* Phần giới thiệu */}
        <div className="w-1/2">
          {/* Tabs */}
          <div className="relative flex justify-center space-x-6 text-lg font-bold border-b border-gray-300">
            {["Giới thiệu", "Thông tin ứng dụng"].map((tab) => {
              const tabKey = tab.toLowerCase().replace(/\s/g, "-");
              return (
                <button
                  key={tab}
                  className={`relative pb-2 transition-all ${activeTab === tabKey ? "text-black" : "text-gray-500"}`}
                  onClick={() => setActiveTab(tabKey)}
                >
                  {tab}
                  <div className={`absolute left-0 bottom-0 w-full h-[3px] bg-black transition-all ${activeTab === tabKey ? "scale-x-100" : "scale-x-0"}`} />
                </button>
              );
            })}
          </div>

          {/* Nội dung hiển thị */}
          <div className="mt-6 relative h-[120px] overflow-hidden">
            <div className={`absolute w-full transition-opacity duration-500 ${activeTab === "giới-thiệu" ? "opacity-100" : "opacity-0"}`}>
              <p className="text-gray-700">
                Hành trình Magellan (HTM) là một cuộc thi kiến thức dành cho học sinh THPT tại Quảng Nam, được tổ chức và quản lý bởi học sinh trường THPT chuyên Nguyễn Bỉnh Khiêm.
              </p>
            </div>

            <div className={`absolute w-full transition-opacity duration-500 ${activeTab === "thông-tin-ứng-dụng" ? "opacity-100" : "opacity-0"}`}>
              <p className="text-gray-700">
              Với sứ mệnh lan tỏa niềm đam mê khám phá tri thức, đội ngũ Hành Trình Magellan đã phát triển một nền tảng trực tuyến mô phỏng một trận đấu theo format của chương trình, giúp học sinh THPT không chỉ rèn luyện kiến thức mà còn trải nghiệm những thử thách hấp dẫn như một hành trình thực thụ.
              </p>
            </div>
          </div>

          {/* Nút bấm */}
          <div className="flex gap-4 mt-6 justify-center">
            <button className="px-4 py-2 bg-black text-white rounded-lg">Tham gia phòng thi</button>
            <button className="px-4 py-2 border border-black rounded-lg">Đăng nhập</button>
          </div>
        </div>

        {/* Hình ảnh */}
        <div className="relative w-1/2 h-64">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Group"
              className={`absolute w-full h-full object-cover rounded-lg shadow-lg transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
      </div>

      {/*Footer*/ }
      <Footer/>
    </div>
  );
}

export default Home;
