import React, { useState } from 'react'
import Logo from '../../assets/Logo.png'
import CompanyLogo from '../ComapnyLogo/CompanyLogo';


const ReceptionistNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 w-full bg-white text-black shadow-lg z-50">
            <div className="
              flex items-center justify-between
              px-4 py-3
              min-h-16
              md:min-h-12 md:px-24
              ">
                <CompanyLogo />

                <nav className="hidden md:flex gap-8">
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

                <button
                    className="md:hidden text-2xl"
                    onClick={() => setIsOpen(prev => !prev)}
                >
                    {isOpen ? "✕" : "☰"}
                </button>
            </div>

            <div
                className={`
                  md:hidden
                  absolute top-full left-0 w-full
                  bg-white shadow-md
                  transition-all duration-300 ease-in-out
                  ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}
                  `}
            >
                <nav className="flex flex-col items-center gap-6 py-6">
                    <div className="cursor-pointer hover:text-blue-600">Home</div>
                    <div className="cursor-pointer hover:text-blue-600">About</div>
                    <div className="cursor-pointer hover:text-blue-600">Contact</div>

                    <div className="flex gap-4 pt-4">
                        <button className="px-4 py-1.5 bg-black text-white rounded">
                            Login
                        </button>
                        <button className="px-4 py-1.5 border border-black rounded">
                            Sign Up
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default ReceptionistNavbar