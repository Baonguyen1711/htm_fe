
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../shared/hooks/auth/useAuth';
import { Button } from '../../shared/components/ui';
import { toast } from 'react-toastify';
import { authApi } from '../../shared/services';


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (isLoading) return; // Prevent multiple login attempts

    setIsLoading(true); // Set loading state to true
    const toastId = toast.info('Đang xác thực, vui lòng chờ...', {
      position: 'top-right',
      autoClose: false, // Keep toast until manually dismissed or updated
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
    });

    try {
      const result = await login(email, password); // Call the login function
      if (result) {
        console.log('Login successful:', result);
        toast.dismiss(toastId); // Dismiss the loading toast
        // Show success toast before navigation
        toast.success('Đăng nhập thành công!', {
          position: 'top-right',
          autoClose: 2000,
        });
        // Wait for the success toast to be visible and for the auth cookie
        const isHost = await authApi.isHost()
        console.log("is host", isHost)
        await new Promise(resolve => setTimeout(resolve, 2000)); // Match autoClose duration
        if (isHost) {
          navigate('/host/dashboard');
        } else {
          navigate('/user/dashboard')
        }
      } else {
        toast.dismiss(toastId); // Dismiss the loading toast
        toast.error('Email hoặc mật khẩu không đúng!', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.dismiss(toastId); // Dismiss the loading toast
      toast.error('Email hoặc mật khẩu không đúng!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const StarBackground = () => {
    // Sinh ra khoảng 100 ngôi sao với các thuộc tính ngẫu nhiên
    const [stars] = useState(() =>
      [...Array(100)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1 + "px", // Kích thước từ 1px đến 3px
        delay: Math.random() * 5 + "s",     // Độ trễ hiệu ứng lấp lánh
        duration: Math.random() * 3 + 2 + "s", // Thời gian một chu kỳ lấp lánh
        opacity: Math.random() * 0.7 + 0.3,
      }))
    );

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
    >
      {/* 1. Lớp nền gradient tối */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" />

      {/* 2. Lớp sao ngẫu nhiên (Thay cho pattern cũ) */}
      <StarBackground />

      {/* 3. Lớp ánh sáng xanh mờ tạo chiều sâu */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,78,99,0.3)_0%,transparent_70%)]" />

      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4"
      >
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-blue-200 to-cyan-100 bg-clip-text">
              Hành Trình Magellan
            </h1>
            <p className="text-blue-200/90 text-lg">
              Đăng nhập để quản lý cuộc thi
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-400/30 rounded-xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Đăng nhập
            </h2>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-6">
                <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    type="email"
                    id="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-blue-200 text-sm font-medium mb-2" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    type="password"
                    id="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6 text-center">
                <a href="#" className="text-blue-300 hover:text-blue-200 text-sm transition-colors">
                  Quên mật khẩu?
                </a>
              </div>

              <button
                onClick={handleLogin}
                className={`w-full px-6 py-3 rounded-xl font-medium transition-all bg-slate-700/50  shadow-lg hover:bg-slate-700`}
              >
                Đăng nhập
              </button>

              {/* <Button
                type="button"
                onClick={handleLogin}
                variant="primary"
                size="lg"
                fullWidth
                className="font-medium shadow-lg"
                style={{ backgroundColor: '#001f3f' }}
              >
                Đăng nhập
              </Button> */}
            </form>

            <div className="mt-6 text-center">
              <p className="text-blue-200/70 text-sm">
                Muốn tham gia phòng thi?{' '}
                <Link
                  to="/join"
                  className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
                >
                  Tham gia ngay
                </Link>
              </p>
            </div>
            <div className="mt-6 text-center">
              <p className="text-blue-200/70 text-sm">
                Hoặc{' '}
                <Link
                  to="/spectatorJoin"
                  className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
                >
                  Tham gia phòng thi với tư cách khán giả
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-black hover:text-blue-200 text-sm transition-colors"
            >
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
      <style>
        {
          `@keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  .animate-twinkle {
    animation: twinkle linear infinite;
  }`
        }
      </style>
    </div>

  );

};

export default Login;
