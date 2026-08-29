import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  UserPlus,
  WalletMinimal,
  Settings,
  X,
  LogOut,
  UserCheck,
  Summary,
  CircleUser,
  Files,
  Binoculars,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import CompanyLogo from "../ComapnyLogo/CompanyLogo";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/ad/dashboard" },
  { name: "Loan Applications", icon: FileText, path: "/ad/loan-applications" },
  { name: "Loan Summary", icon: Summary, path: "/ad/loan-summary" },
  { name: "Petty Cash", icon: WalletMinimal, path: "/ad/petty-cash" },
  { name: "Financials", icon: Files, path: "/ad/financials" },
  { name: "Customer Management", icon: Users, path: "/ad/customers" },
  { name: "User Management", icon: CircleUser, path: "/ad/users" },
  { name: "Salary Management", icon: WalletMinimal, path: "/ad/salary" },
  { name: "Field Officer Collection", icon: Binoculars, path: "/ad/officers" },
  { name: "System Configuration", icon: Settings, path: "/ad/settings" },
];

const Sidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const logoutFunc = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      {/* ===================== Mobile Sidebar (like ReceptionistDashboard) ===================== */}
      <div className="flex md:hidden w-full flex-col bg-slate-950 text-slate-300 border-b border-slate-800">
        {/* Top mini header + actions */}
        <div className="flex items-center justify-between px-3 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-wide text-white">
              NKRS LANKA CAPITAL
            </h1>
            <p className="text-[10px] text-slate-400">Administration Panel</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Profile (same functionality as desktop profile section) */}
            <button
              onClick={() => navigate("/ad/profile")}
              className="shrink-0 rounded-lg p-2 transition hover:bg-slate-800/60"
              aria-label="Profile"
            >
              <UserCheck size={18} className="text-slate-300" />
            </button>

            {/* Logout (opens same modal) */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="shrink-0 rounded-lg p-2 transition hover:bg-red-600/20"
              aria-label="Logout"
            >
              <LogOut size={18} className="text-red-400" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll menu */}
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden px-2 pb-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `shrink-0 flex items-center justify-center rounded-lg px-3 py-2 transition-all duration-200
                   ${isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800/60 hover:text-white"}`
                }
                aria-label={item.name}
                title={item.name}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={`${isActive ? "text-blue-400" : "text-slate-400"}`}
                    />
                    <span className="sr-only">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* ===================== Desktop Sidebar (original) ===================== */}
      <div className="hidden md:flex h-full w-full bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800">
        {/* Logo / System Name */}
        <div className="flex h-20 items-center border-b border-slate-800 px-3 sm:px-4 lg:px-6">
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white sm:text-base lg:text-lg">
              NKRS LANKA CAPITAL
            </h1>
            <p className="mt-1 text-[9px] text-slate-400 sm:text-[10px] lg:text-xs">
              Administration Panel
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 sm:px-4 sm:py-4 lg:py-6">
          <p className="mb-3 px-2 text-[9px] uppercase tracking-wider text-slate-500 sm:mb-4 sm:text-[10px] lg:text-xs">
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
                      `group relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 sm:gap-3 sm:px-4 sm:py-3 sm:text-sm
                      ${
                        isActive
                          ? "bg-slate-800 text-white"
                          : "hover:bg-slate-800/60 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active Indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-0 h-full w-1 rounded-r-md bg-blue-500"></span>
                        )}

                        <Icon
                          size={16}
                          className={`sm:h-5 sm:w-5 ${
                            isActive
                              ? "text-blue-400"
                              : "text-slate-400 group-hover:text-white"
                          }`}
                        />

                        <span className="hidden sm:inline">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Profile Section */}
        <div className="border-t border-slate-800 bg-slate-900 p-3 sm:p-4 lg:p-4">
          <div
            onClick={() => navigate("/ad/profile")}
            className="cursor-pointer rounded-lg p-2 transition hover:bg-slate-800 sm:p-3"
          >
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-medium text-white sm:text-sm">
                {username}
              </p>
              <p className="text-[11px] text-slate-400 sm:text-xs">Profile</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600/90 py-2 text-xs transition hover:bg-red-600 text-white sm:mt-4 sm:py-2.5 sm:text-sm"
          >
            <LogOut size={14} className="sm:h-4 sm:w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* ===================== Logout Modal (unchanged) ===================== */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-xl bg-white p-4 shadow-2xl sm:p-6">
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