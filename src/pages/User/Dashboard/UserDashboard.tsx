import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, BarChart3 } from "lucide-react";
import { UserDashboardSideBar } from "../../../components/ui/UserDashboardSideBar";
import JoinRoom from "./JoinRoom";
import PersonalStats from "./PersonalStats";
import { toast } from 'react-toastify';
import SetupMatch from "../../Host/Dashboard/SetUpMatch";
import UploadTest from "../../Host/Dashboard/UploadTest";
import ViewTest from "../../Host/Dashboard/ViewTest";
import ViewHistory from "../../Host/Dashboard/History";

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState("join");
    const navigate = useNavigate();

  const handleLogout = () => {
    toast.success('Đăng xuất thành công!', { autoClose: 2000 });
    navigate("/");
  };

    const getTabTitle = () => {
        switch (activeTab) {
            case "join":
                return { title: "Tham Gia Phòng Thi", icon: LogIn };
            case "stats":
                return { title: "Thống Kê Kết Quả", icon: BarChart3 };
            default:
                return { title: "Dashboard", icon: LogIn };
        }
    };

    const { title, icon: Icon } = getTabTitle();

  return (
    <div className="h-screen  relative overflow-hidden flex">
      {/* Ocean background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1708864163871-311332fb9d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')] bg-cover bg-center" />
      </div>

      {/* Bubbles nhẹ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-15 animate-float"
            style={{
              width: `${Math.random() * 20 + 6}px`,
              height: `${Math.random() * 20 + 6}px`,
              left: `${Math.random() * 100}%`,
              bottom: `-30px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 15 + 15}s`,
            }}
          />
        ))}
      </div>

      <div className="flex w-full h-full">
        {/* Sidebar */}
        <UserDashboardSideBar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

        {/* Main */}
        <main className="flex-1 overflow-auto">
          {/* Page Title - copy style mẫu: text-3xl + text-muted mt-1 */}
          <div className="p-6">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            {/* <p className="text-cyan-300 mt-1">
              {activeTab === "join" ? "Tham gia phòng thi trực tuyến" : "Theo dõi kết quả thi đấu của bạn"}
            </p> */}
          </div>

          {/* Content Card - copy chính xác card mẫu: bg slate + blur, rounded-xl, shadow-sm, p-6 */}
          <div className="px-6 pb-6">
            <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                {activeTab === "join" && <JoinRoom />}
                {activeTab === "stats" && <PersonalStats />}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(100vh); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-100px) translateX(${Math.random() * 80 - 40}px); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
      `}</style>
    </div>
  );
};

export default UserDashboard;