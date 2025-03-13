import React, { useState, useEffect } from 'react';
import banner from "../../assets/banner.jpg";
import card from "../../assets/card.jpg";
import ending from "../../assets/ending.jpg";

const Login = () => {
    const images = [banner, card, ending];

    // State để kiểm soát trạng thái hoán đổi
    const [isSwapped, setIsSwapped] = useState(false);

    const handleJoinRoomClick = () => {
        setIsSwapped(!isSwapped); // Đổi trạng thái để hoán đổi
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-300">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg flex border-2 border-gray-300 relative h-[500px]">
                {/* Phần chào mừng với animation */}
                <div
                    className={`absolute top-0 w-1/2 h-full bg-blue-600 text-white p-8 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${isSwapped
                            ? 'left-1/2 rounded-l-0 rounded-l-[4rem]'
                            : 'left-0 rounded-r-[4rem] rounded-l-0'
                        }`}
                    style={{ minHeight: '100%' }}
                >
                    <h2 className="text-3xl font-bold mb-4">Chào mừng đến với Hành Trình Magellan</h2>
                </div>

                {/* Phần form đăng nhập */}
                <div
                    className={`absolute top-0 w-1/2 h-full p-8 transition-all duration-1000 ease-in-out ${isSwapped
                            ? 'left-0 rounded-r-0 rounded-l-[4rem]'
                            : 'left-1/2 rounded-l-0 rounded-r-0'
                        }`}
                    style={{ minHeight: '100%' }}
                >
                    {
                        !isSwapped ?
                            <>
                                <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
                                <form>
                                    <div className="mb-6 relative">
                                        <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="username">
                                            Username
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg bg-gray-200"
                                            type="text"
                                            id="username"
                                            placeholder="Enter your username"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">👤</span>
                                    </div>
                                    <div className="mb-6 relative">
                                        <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="password">
                                            Password
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg bg-gray-200"
                                            type="password"
                                            id="password"
                                            placeholder="Enter your password"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">🔒</span>
                                    </div>
                                    <div className="mb-6 flex items-center space-x-4">
                                        <a href="#" className="text-lg text-blue-600 hover:underline">Forgot Password?</a>
                                        <a
                                            href="#"
                                            className="text-lg text-green-600 hover:underline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleJoinRoomClick();
                                            }}
                                        >
                                            Join Room
                                        </a>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full max-w-xs px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
                                    >
                                        Login
                                    </button>
                                </form>
                            </>
                            :
                            <>
                                <h2 className="text-3xl font-bold text-center mb-8">Join room</h2>
                                <form>
                                    <div className="mb-6 relative">
                                        <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="roomid">
                                            Room ID
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg bg-gray-200"
                                            type="text"
                                            id="roomid"
                                            placeholder="Enter room id"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">👤</span>
                                    </div>
                                    <div className="mb-6 relative">
                                        <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="password">
                                            Password
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg bg-gray-200"
                                            type="password"
                                            id="password"
                                            placeholder="Enter room password"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">🔒</span>
                                    </div>
                                    {/* <div className="mb-6 relative">
                                        <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="username">
                                            Name
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg bg-gray-200"
                                            type="password"
                                            id="password"
                                            placeholder="Enter your name "
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">🔒</span>
                                    </div> */}
                                    <div className="mb-6 flex items-center space-x-4">
                                        <a href="#" className="text-lg text-blue-600 hover:underline">Forgot Password?</a>
                                        <a
                                            href="#"
                                            className="text-lg text-green-600 hover:underline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleJoinRoomClick();
                                            }}
                                        >
                                            Login
                                        </a>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full max-w-xs px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
                                    >
                                        Join room
                                    </button>
                                </form>
                            </>
                    }

                </div>
            </div>
        </div>
    );
};

export default Login;