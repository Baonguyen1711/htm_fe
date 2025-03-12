import React from 'react'

function Header() {
    return (
        <div className="flex justify-between items-center bg-white p-3 rounded-lg">
            <div className="flex items-center space-x-2">
                <img
                    src="https://via.placeholder.com/40"
                    alt="Logo"
                    className="w-10 h-10 rounded-full"
                />
                <h1 className="font-bold text-lg">HTM</h1>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <span>user name</span>
            </div>
        </div>
    )
}

export default Header