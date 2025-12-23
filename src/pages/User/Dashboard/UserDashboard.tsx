import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, BarChart3 } from "lucide-react";
import { UserDashboardSideBar } from "../../../components/ui/UserDashboardSideBar";
import JoinRoom from "../../JoinRoom/JoinRoom";
import PersonalStats from "./PersonalStats";
import { toast } from 'react-toastify';

const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState("join");
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
        <div className="flex min-h-screen w-full">
            {/* Background */}
            <div className="ocean-background" />
            <div className="stars-overlay" />
            <div className="wave-overlay" />

            {/* Sidebar */}
            <UserDashboardSideBar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

            {/* Main Content */}
            <main className="flex-1 relative z-10 overflow-auto">
                {/* Header */}
                <header className="sticky top-0 z-20 backdrop-blur-md bg-background/50 border-b border-border/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-light to-ocean-mid flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gradient">{title}</h1>
                    </div>
                </header>

                {/* Content */}
                <div className="p-2">
                    <div className="glass-card min-h-[calc(100vh-120px)]">
                        {activeTab === "join" && <JoinRoom />}
                        {activeTab === "stats" && <PersonalStats />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
