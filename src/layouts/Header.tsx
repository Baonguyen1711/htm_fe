import React from 'react'

function Header() {
    return (
        <div className="relative z-20 bg-slate-900/20 backdrop-blur-md border-b border-blue-400/20 shadow-lg">
            <div className="flex justify-between items-center p-4 lg:p-6">
                {/* Logo and App Name */}
                <div className="flex items-center space-x-3 lg:space-x-4">
                    <img
                        src="/images/magellan-logo.png"
                        alt="Magellan Logo"
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full shadow-lg border-blue-400/50"
                    />
                    <div className="flex flex-col">
                        <h1 className="font-serif text-xl lg:text-2xl xl:text-3xl font-bold text-transparent bg-gradient-to-r from-blue-200 to-cyan-100 bg-clip-text">
                            Hành Trình Magellan
                        </h1>
                        <p className="text-xs lg:text-sm text-blue-200/80 font-light tracking-wide hidden sm:block">
                            Khám phá tri thức vượt đại dương
                        </p>
                    </div>
                </div>
                
                {/* User Info */}
                <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-400/50">
                        <span className="text-white text-sm lg:text-base font-semibold">👤</span>
                    </div>
                    <span className="text-blue-100 font-medium text-sm lg:text-base hidden sm:inline">
                        user name
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Header