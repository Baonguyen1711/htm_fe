import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, BarChart3 } from "lucide-react";
import { UserDashboardSideBar } from "../../../components/ui/UserDashboardSideBar";
import SetupMatch from "./SetUpMatch";
import UploadTest from "./UploadTest";
import { toast } from 'react-toastify';
import ViewTest from "./ViewTest";
import ViewHistory from "./History";

const HostDashboard = () => {
    const [activeTab, setActiveTab] = useState("setup");
    const navigate = useNavigate();

    const handleLogout = () => {
        toast.success('Đăng xuất thành công!', {
            position: 'top-right',
            autoClose: 2000,
        });
        navigate("/");
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case "setup":
                return { title: "Thiết lập trận đấu", icon: LogIn };
            case "upload":
                return { title: "Tải lên đề thi", icon: BarChart3 };
            case "view":
                return { title: "Xem và chỉnh sửa đề thi", icon: BarChart3 };
            case "history":
                return { title: "Lịch Sử Trận Đấu", icon: BarChart3 };
            default:
                return { title: "Dashboard", icon: LogIn };
        }
    };

    const { title, icon: Icon } = getTabTitle();

    return (
        <div className="h-screen bg-slate-800/60 relative flex">
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

            {/* Sidebar */}
            <UserDashboardSideBar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} isHost={true} />

            {/* Main Content */}
            <main className="flex-1 relative z-10 overflow-auto">

                <div className="p-6">
                    <h2 className="text-3xl font-bold text-white">{title}</h2>
                    {/* <p className="text-cyan-300 mt-1">
              {activeTab === "join" ? "Tham gia phòng thi trực tuyến" : "Theo dõi kết quả thi đấu của bạn"}
            </p> */}
                </div>
                {/* Content */}

                <div className="px-6 pb-6">
                    <div className="bg-slate-800/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6">
                            {activeTab === "setup" && <SetupMatch />}
                            {activeTab === "upload" && <UploadTest />}
                            {activeTab === "view" && <ViewTest />}
                            {activeTab === "history" && <ViewHistory />}
                        </div>
                    </div>
                </div>
                {/* <div className="p-6">
                    <div className="glass-card min-h-[calc(100vh-120px)]"
                        style={{
                            backgroundColor: ""
                        }}
                    >
                        {activeTab === "setup" && <SetupMatch />}
                        {activeTab === "upload" && <UploadTest />}
                        {activeTab === "view" && <ViewTest />}
                        {activeTab === "history" && <ViewHistory />}
                    </div>
                </div> */}
            </main>
        </div>
    );
};

export default HostDashboard;
