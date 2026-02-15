import React, { useState } from 'react'

import CompanyLogo from '../ComapnyLogo/CompanyLogo';
import { Link } from 'react-router-dom';


const ReceptionistNavbar = ({ panelNames, panel, setPanel }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 left-0 w-full bg-white text-black shadow-lg z-50">
            <div className="
              flex items-center justify-between
              px-4 py-3
              min-h-16
              md:min-h-12 md:px-24
              ">
                <CompanyLogo />

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
                <div className="flex flex-col p-4 gap-2">
                    {panelNames.map((value, key) => (
                        <button
                            key={key}
                            className={value.css + " p-2 hover:bg-gray-100 rounded-lg"}
                            onClick={() => {
                                setPanel(value.func);
                                setIsOpen(false);
                            }}
                        >
                            {value.icon}
                            {value.name}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}

export default ReceptionistNavbar
