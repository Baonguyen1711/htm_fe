import { useState } from "react";
import { LogIn, Key, Hash, Loader2 } from "lucide-react";
import { toast } from 'react-toastify';

export default function JoinRoom() {
    const [roomCode, setRoomCode] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!roomCode.trim()) {
            toast.error('lỗi khi tham gia phòng', {
                position: 'top-right',
                autoClose: 2000,
            });
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success('Tham gia thành công!', {
            position: 'top-right',
            autoClose: 2000,
        });
        setIsLoading(false);
        // Reset form
        setRoomCode("");
        setPassword("");
    };

    return (
        <div className="p-8">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-ocean-light to-ocean-mid flex items-center justify-center shadow-glow">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gradient mb-2">Tham Gia Phòng Thi</h2>
                    <p className="text-muted-foreground">Nhập mã phòng để bắt đầu thi đấu</p>
                </div>

                {/* Form */}
                <form onSubmit={handleJoinRoom} className="space-y-6">
                    {/* Room Code Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Mã Phòng</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Nhập mã phòng (VD: ABC123)"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="w-full pl-11 h-12 bg-background/50 border border-border/50 rounded-lg text-lg tracking-wider font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">
                            Mật Khẩu <span className="text-muted-foreground">(nếu có)</span>
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu phòng"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 h-12 bg-background/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !roomCode.trim()}
                        className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-ocean-mid to-ocean-light hover:from-ocean-light hover:to-ocean-mid text-white font-semibold text-lg rounded-lg shadow-glow transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Đang tham gia...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Tham Gia Phòng
                            </>
                        )}
                    </button>
                </form>

                {/* Tips */}
                <div className="mt-8 p-4 rounded-xl bg-ocean-deep/30 border border-ocean-mid/20">
                    <h4 className="font-medium text-ocean-light mb-2">💡 Mẹo</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Mã phòng được cung cấp bởi người tạo phòng</li>
                        <li>• Một số phòng có thể yêu cầu mật khẩu</li>
                        <li>• Đảm bảo kết nối internet ổn định</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
