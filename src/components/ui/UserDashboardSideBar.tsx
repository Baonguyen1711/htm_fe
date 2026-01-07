import { useState } from "react";
import { LogIn, BarChart3, LogOut, ChevronLeft, ChevronRight, Settings, Upload, Eye, History } from "lucide-react";
import useAuth from "../../shared/hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";
interface UserDashboardSideBarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onLogout: () => void;
  isHost?: boolean;
}

const playerMenuItems = [
  { id: "join", label: "Tham Gia Phòng", icon: LogIn },
  { id: "stats", label: "Thống Kê Kết Quả", icon: BarChart3 },
];

const hostMenuItems = [
  { id: "view", label: "Xem đề thi", icon: Eye },
  { id: "upload", label: "Tải lên đề thi", icon: Upload },
  { id: "setup", label: "Thiết lập trận đấu", icon: Settings },
  { id: "history", label: "Xem lịch sử", icon: History },
];


export function UserDashboardSideBar({
  activeTab,
  onTabChange,
  onLogout,
  isHost = false,
}: UserDashboardSideBarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = isHost ? hostMenuItems : playerMenuItems;
  const roleTitle = isHost ? "Host" : "Người Chơi";
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside
      className={`relative flex flex-col h-screen glass-card backdrop-blur-2xl border-r border-cyan-800/30 transition-all duration-500 ease-out ${collapsed ? "w-16" : "w-64"
        }`}
    >
      {/* Header - gọn như mẫu */}
      <div className="shrink-0 px-4 py-5 border-b border-cyan-700/30">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center">
            <img src="/images/magellan-logo.png" className="w-8 h-8 text-slate-900" ></img>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-white">Hành trình Magellan</h2>            </div>
          )}
        </div>
      </div>

      {/* Navigation - copy spacing mẫu: py-3, gap-3, text-sm */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${collapsed ? "justify-center px-3" : ""
                } ${isActive
                  ? "bg-slate-800/60 text-white shadow-md ring-1 ring-cyan-400/50"
                  : " hover:bg-cyan-500/10 hover:text-white"
                }`}
            >
              <div className={`p-2 rounded-lg ${isActive ? "bg-slate-800/60" : "bg-cyan-500/10 group-hover:bg-cyan-500/20"} transition-all`}>
                <Icon className="w-5 h-5" />
              </div>
              {!collapsed && (
                <span className={`text-sm font-medium ${isActive ? "text-white" : "group-hover:text-white"}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer - Logout + Collapse */}
      <div className="shrink-0 px-3 py-4 border-t border-cyan-700/30 space-y-3">
        {/* Logout */}
        <button
          onClick={async () => {
            await logout()
            localStorage.clear()
            navigate("/")
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${collapsed ? "justify-center px-3" : ""
            } text-rose-300 hover:bg-rose-500/10 hover:text-rose-200`}
        >
          <div className="p-2 rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 transition-all">
            <LogOut className="w-5 h-5" />
          </div>
          {!collapsed && <span className="text-sm font-medium">Đăng Xuất</span>}
        </button>

        {/* Collapse Toggle - nhỏ gọn, hiện đại */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-8 h-8 rounded-full bg-slate-800/60 backdrop-blur-md border border-cyan-400/50 shadow-lg hover:bg-cyan-500/40 hover:scale-110 flex items-center justify-center transition-all duration-300"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-cyan-200" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-cyan-200" />
          )}
        </button>
      </div>
    </aside>
  );
}