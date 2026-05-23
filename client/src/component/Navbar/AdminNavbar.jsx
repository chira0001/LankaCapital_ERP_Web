import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Search, Bell } from "lucide-react";

import Logo from '../../assets/Logo.png';
import Admin from '../../assets/Admin.png';

import CompanyLogo from '../ComapnyLogo/CompanyLogo';

/*
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
*/

const AdminNavbar = () => {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const pages = [
    { keyword: "dashboard", path: "/admin/dashboard" },
    { keyword: "loan", path: "/admin/loan-applications" },
    { keyword: "portfolio", path: "/admin/portfolio" },
    { keyword: "performance", path: "/admin/performance" },
    { keyword: "revenue", path: "/admin/revenue" },
    { keyword: "customers", path: "/admin/customers" },
    { keyword: "officers", path: "/admin/officers" },
    { keyword: "petty cash", path: "/admin/petty-cash" },
    { keyword: "reports", path: "/admin/reports" },
    { keyword: "targets", path: "/admin/targets" },
    { keyword: "categories", path: "/admin/categories" },
    { keyword: "users", path: "/admin/users" },
    { keyword: "audit", path: "/admin/audit" },
    { keyword: "settings", path: "/admin/settings" },
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    const found = pages.find((page) =>
      page.keyword.toLowerCase().includes(value.toLowerCase())
    );

    if (found && value.length > 1) {
      navigate(found.path);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between">

      {/* Left */}
      <div>
        <CompanyLogo />
      </div>

      {/* Search */}
      <div className="w-[420px] relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search pages..."
          className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
          <Bell size={20} />

          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-black">
          P
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;