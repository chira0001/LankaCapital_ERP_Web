import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  TrendingUp,
  DollarSign,
  Users,
  UserCheck,
  CreditCard,
  Target,
  Layers,
  UserPlus,
  ClipboardList,
  Settings,
  X,
  LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import CompanyLogo from "../ComapnyLogo/CompanyLogo";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/ad/dashboard" },
  { name: "Loan Applications", icon: FileText, path: "/ad/loan-applications" },
  { name: "Customer Management", icon: Users, path: "/ad/customers" },
  { name: "User Management", icon: UserPlus, path: "/ad/users" },
  { name: "Petty Cash", icon: CreditCard, path: "/ad/petty-cash" },
  { name: "Financial Reports", icon: BarChart2, path: "/ad/reports" },
  { name: "System Configuration", icon: Settings, path: "/ad/settings" },
];

const Sidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const logoutFunc = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <div className="h-full w-full bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800">

        {/* Logo / System Name */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div>
            <h1 className="text-lg font-semibold text-white tracking-wide">
              NKRS LANKA CAPITAL
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Administration Panel
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-4 px-2">
            Main Menu
          </p>

          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <li key={index}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? "bg-slate-800 text-white"
                        : "hover:bg-slate-800/60 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active Indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-md"></span>
                        )}

                        <Icon
                          size={18}
                          className={`${isActive
                            ? "text-blue-400"
                            : "text-slate-400 group-hover:text-white"
                            }`}
                        />

                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div
            onClick={() => navigate("/ad/profile")}
            className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-800 transition"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-semibold">
              D
            </div>

            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                director@email.com
              </p>
              <p className="text-xs text-slate-400">Director</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg bg-red-600/90 hover:bg-red-600 text-white transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 relative">

            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <LogOut className="text-red-600" size={24} />
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                Confirm Logout
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                You are about to log out of your session.
              </p>

              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={logoutFunc}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                >
                  Logout
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;