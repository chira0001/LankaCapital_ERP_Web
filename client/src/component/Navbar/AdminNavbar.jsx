import React from 'react'
import { Link, Links, useNavigate } from "react-router-dom";
import Logo from '../../assets/Logo.png'
import Admin from '../../assets/Admin.png'

const AdminNavbar = () => {
    return (
        <div className="bg-white w-screen text-black shadow-lg mb-8 flex items-center justify-between px-4 min-h-16 md:px-25 md:min-h-12 md:py-1 py-3">
            <img
                src={Logo}
                alt="Logo"
                className="cursor-pointer w-[clamp(4rem,8vw,6rem)] object-contain"
            />
            <img src={Admin} alt="" className='w-10 cursor-pointer' />
        </div>
    )
}

export default AdminNavbar