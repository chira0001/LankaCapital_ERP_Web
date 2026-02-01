import React from 'react'
import { Link, Links, useNavigate } from "react-router-dom";
import Logo from '../../assets/Logo.png'
import Admin from '../../assets/Admin.png'
import CompanyLogo from '../ComapnyLogo/CompanyLogo';

const AdminNavbar = () => {
    return (
        <div className="bg-white text-black shadow-lg flex items-center justify-between px-4 min-h-16 md:px-25 md:min-h-12 md:py-1 py-3
        fixed top-0 left-0 w-full z-50
        ">
            <CompanyLogo />
            <img src={Admin} alt="" className='w-10 cursor-pointer transition-all hover:scale-[1.1]' />
        </div>
    )
}

export default AdminNavbar