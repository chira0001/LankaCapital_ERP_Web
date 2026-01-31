import React from 'react'

import Logo from '../../assets/Logo.png'

const CommonNavbar = () => {
    return (
        <div className="
        bg-white text-black shadow-lg mb-8
        flex items-center justify-between
        px-4 py-3
        min-h-16
        md:min-h-12 md:px-25 md:py-1
        ">
            <img
                src={Logo}
                alt="Logo"
                className="cursor-pointer w-[clamp(4rem,8vw,6rem)] object-contain"
            />
            <nav className="hidden md:flex gap-8 w-auto">
                <div className="cursor-pointer hover:text-blue-600">Home</div>
                <div className="cursor-pointer hover:text-blue-600">About</div>
                <div className="cursor-pointer hover:text-blue-600">Contact</div>
            </nav>
            <div className="hidden md:flex gap-4">
                <button className="px-4 py-1.5 bg-black text-white rounded">
                    Login
                </button>
                <button className="px-4 py-1.5 border border-black rounded">
                    Sign Up
                </button>
            </div>
            <button className="md:hidden">
                ☰
            </button>
        </div>
    )
}

export default CommonNavbar