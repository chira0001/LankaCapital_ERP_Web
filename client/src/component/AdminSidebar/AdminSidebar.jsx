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
  X
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/ad/dashboard" },
  { name: "Loan Applications", icon: FileText, path: "/ad/loan-applications" },
  { name: "Portfolio Overview", icon: BarChart2, path: "/ad/portfolio" },
  { name: "Loan Performance", icon: TrendingUp, path: "/ad/performance" },
  { name: "Revenue Tracking", icon: DollarSign, path: "/ad/revenue" },
  { name: "Customer Management", icon: Users, path: "/ad/customers" },
  { name: "Field Officer Performance", icon: UserCheck, path: "/ad/officers" },
  { name: "Petty Cash", icon: CreditCard, path: "/ad/petty-cash" },
  { name: "Financial Reports", icon: BarChart2, path: "/ad/reports" },
  { name: "Performance & Targets", icon: Target, path: "/ad/targets" },
  { name: "Loan Categories", icon: Layers, path: "/ad/categories" },
  { name: "User Management", icon: UserPlus, path: "/ad/users" },
  { name: "Audit Logs", icon: ClipboardList, path: "/ad/audit" },
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
    <div className="h-full flex flex-col bg-[#071428] text-white overflow-hidden">

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                  text-gray-300 hover:bg-gray-800 hover:text-yellow-500
                  ${isActive ? "bg-yellow-600 text-black font-semibold shadow" : ""}`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </ul>
      </div>

      {/* Bottom Profile Box */}
      <div className="p-3 border-t border-gray-800">

        <div className="bg-[#0f1d35] border border-gray-700 rounded-2xl p-4">

          <div
            onClick={() => navigate("/ad/profile")}
            className="flex items-center gap-3 cursor-pointer hover:bg-[#162544] rounded-xl p-2 transition"
          >
            <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center text-black font-bold text-lg">
              P
            </div>

            <div className="overflow-hidden">
              <h3 className="text-sm font-semibold truncate">
                director@email.com
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Director
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="mt-4 w-full bg-[#243557] hover:bg-red-600 rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
          >
            Logout
          </button>

        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">

            {/* Close Icon */}
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                <X className="text-red-600" size={28} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800">
              Confirm Logout
            </h2>

            <p className="text-gray-500 text-center mt-2">
              Are you sure you want to logout from your account?
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={logoutFunc}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow-lg shadow-red-200"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;