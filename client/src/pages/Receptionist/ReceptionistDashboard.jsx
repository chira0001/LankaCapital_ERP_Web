import React, { useState } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReceptionistDashboard = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const currentPanel = location.pathname.split('/').pop();

    const panelNames = [
        {
            name: "Home",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.4 0 .77-.24.92-.62.15-.37.07-.8-.22-1.09l-8.99-9a.996.996 0 0 0-1.41 0l-9.01 9c-.29.29-.37.72-.22 1.09s.52.62.92.62Zm9-8.59 6 6V20H6v-9.59z"></path></svg>
            ),
            css: `flex gap-3 items-center transition-all duration-200 ${currentPanel === 'home' || currentPanel === 're' ? "text-black font-semibold border border-black shadow-md" : "text-gray-400 hover:text-black"
                }`,
            func: 'home'
        },
        {
            name: "Create Loan",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72M20 9v6h-7V9zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2z"></path><circle cx="16" cy="12" r="1.5"></circle></svg>
            ),
            css: `flex gap-3 items-center transition-all duration-200 ${currentPanel === 'loan' ? "text-black font-semibold border border-black shadow-md" : "text-gray-400 hover:text-black"
                }`,
            func: 'loan'
        },
        {
            name: "View Customer",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2 .82-2 2-2 2 .82 2 2M3 20h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1m4-5h2c1.65 0 3 1.35 3 3H4c0-1.65 1.35-3 3-3m14-3.5c0-2-1.5-3.5-3.5-3.5S14 9.5 14 11.5s1.5 3.5 3.5 3.5c.62 0 1.18-.16 1.67-.42l2.12 2.12 1.41-1.41-2.12-2.12c.26-.49.42-1.05.42-1.67M17.5 13c-.88 0-1.5-.62-1.5-1.5s.62-1.5 1.5-1.5 1.5.62 1.5 1.5-.62 1.5-1.5 1.5"></path></svg>
            ),
            css: `flex gap-3 items-center transition-all duration-200 ${currentPanel === 'view' ? "text-black font-semibold border border-black shadow-md" : "text-gray-400 hover:text-black"
                }`,
            func: 'view'
        },
        {
            name: "Add Salary",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" ><path d="M15.5 11a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5"></path><path d="M12 13.5c0-.82.4-1.53 1-1.99-.42-.32-.93-.51-1.5-.51a2.5 2.5 0 0 0 0 5c.57 0 1.08-.19 1.5-.51a2.5 2.5 0 0 1-1-1.99"></path><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2M4 18V6h16v12z"></path></svg>

            ),
            css: `flex gap-3 items-center transition-all duration-200 ${currentPanel === 'salary' ? "text-black font-semibold border border-black shadow-md" : "text-gray-400 hover:text-black"
                }`,
            func: 'salary'
        },
        {
            name: "Monthly Expenses",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" ><path d="M20 7h-3V3c0-.33-.16-.64-.43-.82a.98.98 0 0 0-.92-.11L3.28 6.82C2.51 7.11 2 7.87 2 8.69V20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2m-5-2.54V7H8.39zM4 20V9h16v2h-5c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h5v2zm16-4h-5v-3h5z"></path></svg>
            ),
            css: `flex gap-3 items-center transition-all duration-200 ${currentPanel === 'monthlyExp' ? "text-black font-semibold border border-black shadow-md" : "text-gray-400 hover:text-black"
                }`,
            func: 'monthlyExp'
        },
        {
            name: "Monthly Petty Cash",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" ><path d="M21 8H7c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1m-1 8c-1.1 0-2 .9-2 2h-8c0-1.1-.9-2-2-2v-4c1.1 0 2-.9 2-2h8c0 1.1.9 2 2 2z"></path><path d="M18 4H3c-.55 0-1 .45-1 1v11h2V6h14zm-4 8a2 2 0 1 0 0 4 2 2 0 1 0 0-4"></path></svg>
            ),
            css: `flex gap-3 items-center transition-all duration-200 ${currentPanel === 'monthlyPetty' ? "text-black font-semibold border border-black shadow-md" : "text-gray-400 hover:text-black"
                }`,
            func: 'monthlyPetty'
        },
        {
            name: "Business Financials",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" ><path d="M20 7h-3V3c0-.33-.16-.64-.43-.82a.98.98 0 0 0-.92-.11L3.28 6.82C2.51 7.11 2 7.87 2 8.69V20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2m-5-2.54V7H8.39zM4 20V9h16v2h-5c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h5v2zm16-4h-5v-3h5z"></path></svg>
            ),
            css: `flex gap-3 items-center transition-all duration-200 ${currentPanel === 'financials' ? "text-black font-semibold border border-black shadow-md" : "text-gray-400 hover:text-black"
                }`,
            func: 'financials'
        },
        {
            name: "Settings",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M22 12.5v-1h-1.03c-.04-.78-.18-1.54-.41-2.26l.95-.37-.36-.93-.95.37c-.38-.85-.89-1.62-1.5-2.3l.73-.73-.71-.71-.73.73c-.57-.51-1.2-.95-1.89-1.3l.42-.93-.91-.41-.42.94a8.9 8.9 0 0 0-2.69-.57V2h-1v1.03c-.78.04-1.54.18-2.26.41l-.37-.95-.93.36.37.95c-.85.38-1.62.89-2.3 1.5l-.73-.73-.71.71.73.73c-.51.57-.95 1.2-1.3 1.89l-.93-.42-.41.91.94.42a8.9 8.9 0 0 0-.57 2.69H2v1h1.03c.04.78.18 1.54.41 2.26l-.95.37.36.93.95-.37c.38.85.89 1.62 1.5 2.3l-.73.73.71.71.73-.73c.57.51 1.2.95 1.89 1.3l-.42.93.91.41.42-.94a8.9 8.9 0 0 0 2.69.57V22h1v-1.03c.78-.04 1.54-.18 2.26-.41l.37.95.93-.36-.37-.95c.85-.38 1.62-.89 2.3-1.5l.73.73.71-.71-.73-.73c.51-.57.95-1.2 1.3-1.89l.93.42.41-.91-.94-.42a8.9 8.9 0 0 0 .57-2.69zM12 5c3.1 0 5.72 2.02 6.65 4.81l-4.05.71c-.52-.91-1.48-1.53-2.6-1.53-.37 0-.72.08-1.05.2L8.31 6.05a6.9 6.9 0 0 1 3.68-1.06Zm1 7c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m-4.31 6.17a6.99 6.99 0 0 1-1.9-10.83l2.64 3.14c-.26.45-.42.96-.42 1.51 0 .93.43 1.75 1.1 2.3L8.7 18.15ZM12 19c-.49 0-.97-.05-1.43-.15l1.4-3.85H12a2.99 2.99 0 0 0 2.95-2.5l4.04-.71c0 .07.01.14.01.22 0 3.86-3.14 7-7 7Z"></path></svg>
            ),
            css: `flex gap-3 items-center transition-all duration-200 ${currentPanel === 'settings'
                ? "text-red-700 font-semibold border border-red-700 shadow-md"
                : "text-red-300 hover:text-red-700"
                }`,
            func: 'settings'
        },
        {
            name: "Logout",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" ><path d="M15 11H8v2h7v4l6-5-6-5z"></path><path d="M5 21h7v-2H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2"></path></svg>
            ),
            css: `flex gap-3 items-center text-gray-400 hover:bg-black hover:text-white hover:border hover:border-black transition-all duration-200`,
            func: 'logout'
        }
    ];

    const logoutFunc = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className='bg-gray-100 w-full text-black flex gap-8 h-screen p-6 overflow-hidden'>
                {/* Sidebar */}
                <div className='bg-white md:w-[25%] px-3 py-6 rounded-2xl shadow-xl hidden md:flex md:flex-col  gap-6'>
                    {panelNames.map((value, key) => (
                        <button
                            key={key}
                            className={value.css}
                            onClick={() => {
                                value.func === 'logout'
                                    ? setShowLogoutModal(true)
                                    : navigate(`/re/${value.func}`)
                            }}
                        >
                            {value.icon}
                            <span>{value.name}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className='flex-1 bg-white p-6 rounded-2xl shadow-xl overflow-y-auto'>
                    <Outlet />
                </div>

                {/* Modal */}
                {showLogoutModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-[fadeIn_.2s_ease-in-out]">

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="bg-red-100 p-4 rounded-full">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="32"
                                        height="32"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        className="text-red-600"
                                    >
                                        <path d="M15 11H8v2h7v4l6-5-6-5z"></path>
                                        <path d="M5 21h7v-2H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2"></path>
                                    </svg>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-center text-gray-800">
                                Confirm Logout
                            </h2>

                            {/* Description */}
                            <p className="text-gray-500 text-center mt-2">
                                Are you sure you want to logout from your account?
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3 mt-6">

                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-300"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={logoutFunc}
                                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-lg shadow-red-200"
                                >
                                    Logout
                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default ReceptionistDashboard