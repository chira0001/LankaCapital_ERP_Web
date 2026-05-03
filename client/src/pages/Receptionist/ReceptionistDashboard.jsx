import React, { useEffect, useState } from 'react'
import { Link, useNavigate, Outlet } from 'react-router-dom'
import ReceptionistNavbar from '../../component/Navbar/ReceptionistNavbar'
import Footer from '../../component/Footer/Footer'
import HomeImg from '../../assets/Home.jpg'
import axiosAPI from '../../api/axiosAPI'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const [panel, setPanel] = useState('view');
    const panelNames = [
        {
            name: "Home",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.4 0 .77-.24.92-.62.15-.37.07-.8-.22-1.09l-8.99-9a.996.996 0 0 0-1.41 0l-9.01 9c-.29.29-.37.72-.22 1.09s.52.62.92.62Zm9-8.59 6 6V20H6v-9.59z"></path></svg>,
            css: `flex gap-3 items-center ${panel === 'home' ? "text-black" : "text-gray-400"}`,
            func: 'home'
        },
        {
            name: "Create Loan",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72M20 9v6h-7V9zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2z"></path><circle cx="16" cy="12" r="1.5"></circle></svg>,
            css: `flex gap-3 items-center ${panel === 'loan' ? "text-black" : "text-gray-400"}`,
            func: 'loan'
        },
        {
            name: "View Customer",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2 .82-2 2-2 2 .82 2 2M3 20h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1m4-5h2c1.65 0 3 1.35 3 3H4c0-1.65 1.35-3 3-3m14-3.5c0-2-1.5-3.5-3.5-3.5S14 9.5 14 11.5s1.5 3.5 3.5 3.5c.62 0 1.18-.16 1.67-.42l2.12 2.12 1.41-1.41-2.12-2.12c.26-.49.42-1.05.42-1.67M17.5 13c-.88 0-1.5-.62-1.5-1.5s.62-1.5 1.5-1.5 1.5.62 1.5 1.5-.62 1.5-1.5 1.5"></path></svg>,
            css: `flex w-full gap-3 items-center ${panel === 'view' ? "text-black" : "text-gray-400"}`,
            func: 'view'
        },
        {
            name: "Add Salary",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m.89-9.4c1.44-.53 2.61-1.28 2.61-2.85 0-1.93-1.55-3.25-4-3.25-2.59 0-4 1.44-4 3.38h1.75c0-.84.57-1.63 2.25-1.63 1.5 0 2.25.66 2.25 1.5 0 .87-.66 1.47-2.53 2.22-1.88.72-3.22 1.59-3.22 3.44V15h1.75v-.5c0-1.16.97-1.84 2.72-2.53 1.84-.66 3.47-1.5 3.47-3.47 0-2.28-1.97-3.75-4.5-3.75-2.84 0-4.5 1.69-4.5 4h1.75c0-1.22.66-2.25 2.75-2.25 1.72 0 2.75.78 2.75 2 0 1.03-.81 1.62-2.61 2.19z"></path></svg>,
            css: `flex gap-3 items-center ${panel === 'salary' ? "text-black" : "text-gray-400"}`,
            func: 'salary'
        },
        {
            name: "Settings",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M22 12.5v-1h-1.03c-.04-.78-.18-1.54-.41-2.26l.95-.37-.36-.93-.95.37c-.38-.85-.89-1.62-1.5-2.3l.73-.73-.71-.71-.73.73c-.57-.51-1.2-.95-1.89-1.3l.42-.93-.91-.41-.42.94a8.9 8.9 0 0 0-2.69-.57V2h-1v1.03c-.78.04-1.54.18-2.26.41l-.37-.95-.93.36.37.95c-.85.38-1.62.89-2.3 1.5l-.73-.73-.71.71.73.73c-.51.57-.95 1.2-1.3 1.89l-.93-.42-.41.91.94.42a8.9 8.9 0 0 0-.57 2.69H2v1h1.03c.04.78.18 1.54.41 2.26l-.95.37.36.93.95-.37c.38.85.89 1.62 1.5 2.3l-.73.73.71.71.73-.73c.57.51 1.2.95 1.89 1.3l-.42.93.91.41.42-.94a8.9 8.9 0 0 0 2.69.57V22h1v-1.03c.78-.04 1.54-.18 2.26-.41l.37.95.93-.36-.37-.95c.85-.38 1.62-.89 2.3-1.5l.73.73.71-.71-.73-.73c.51-.57.95-1.2 1.3-1.89l.93.42.41-.91-.94-.42a8.9 8.9 0 0 0 .57-2.69zM12 5c3.1 0 5.72 2.02 6.65 4.81l-4.05.71c-.52-.91-1.48-1.53-2.6-1.53-.37 0-.72.08-1.05.2L8.31 6.05a6.9 6.9 0 0 1 3.68-1.06Zm1 7c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m-4.31 6.17a6.99 6.99 0 0 1-1.9-10.83l2.64 3.14c-.26.45-.42.96-.42 1.51 0 .93.43 1.75 1.1 2.3L8.7 18.15ZM12 19c-.49 0-.97-.05-1.43-.15l1.4-3.85H12a2.99 2.99 0 0 0 2.95-2.5l4.04-.71c0 .07.01.14.01.22 0 3.86-3.14 7-7 7Z"></path></svg>,
            css: `flex gap-3 w-full items-center ${panel === 'settings' ? "text-red-700" : "text-red-300"}`,
            func: 'settings'
        }
    ];

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className='bg-gray-100 w-full text-black flex gap-8 h-fit md:min-h-dvh p-8'>
                <div className='bg-white md:w-[25%] p-8 rounded-2xl shadow-xl hidden md:flex md:flex-col gap-4'>
                    {panelNames.map((value, key) => (
                        <button key={key} className={value.css} onClick={() => {
                            navigate(`/reception/${value.func}`)
                            setPanel(value.func)
                        }}>
                            {value.icon}
                            {value.name}
                        </button>
                    ))}
                </div>

                <div className='flex-1 bg-white p-8 rounded-2xl shadow-xl'>
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default ReceptionistDashboard