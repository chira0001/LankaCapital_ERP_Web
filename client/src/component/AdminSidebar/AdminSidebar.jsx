import { LayoutDashboard } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { FileText, BarChart2, TrendingUp, DollarSign, Users, UserCheck, CreditCard, Target, Layers, UserPlus, ClipboardList, Settings} from "lucide-react";
import { UserCircle } from "lucide-react";


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
//  { name: "Profile", icon: UserCircle, path: "/admin/profile" },
];


const Sidebar = () => {
  return (
    <div className="h-full flex flex-col bg-[#071428] text-white overflow-hidden ">

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-5">

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
      <div className="p-3 border-t border-gray-800 bg-[#071428]">

        <NavLink
          to="/ad/profile"
          className="block bg-[#0f1d35] border border-gray-700 rounded-2xl p-4 hover:bg-[#162544] transition-all duration-200"
        >

          <div className="flex items-center gap-3">

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center text-black font-bold text-lg">
              P
            </div>

            {/* User Info */}
            <div className="overflow-hidden">
              <h3 className="text-sm font-semibold truncate">
                director@email.com
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                Director
              </p>
            </div>
          </div>

          {/* Logout */}
          <button className="mt-4 w-full bg-[#243557] hover:bg-red-600 rounded-xl py-2.5 text-sm font-medium transition-all duration-200">
            Logout
          </button>

        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;







//uncomment this not latter part
/*
const Sidebar = () => {
  return (
    <div className="w-64 h-full bg-[#071428] text-white flex flex-col border-r border-gray-800 ">

\* Menu Items *\/
      <div className="flex-1 overflow-y-auto  px-3 py-24">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink 
                to={item.path}
                key={index}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                   text-gray-300
                   hover:bg-gray-800 hover:!text-yellow-500
                  ${
                    isActive
                     ? "bg-yellow-600 !text-black font-semibold shadow"
                     : ""
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            );
          }
          )}
        </ul>

      </div>

\* User Profile & Logout *\/
      <NavLink
        to="/admin/profile"
        className="mx-3 mb-3 bg-[#0f1d35] border border-gray-700 rounded-xl p-3 hover:bg-[#162544] transition-all duration-200"
      >

        <div className="flex items-center gap-3">

          \* User Avatar *\/
          <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-black font-bold">
            P
          </div>

          \* User Info *\/
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-semibold truncate">
              director@email.com
            </h3>

            <p className="text-xs text-gray-400">
              Director
            </p>
          </div>
        </div>

        \* Logout Button *\/
        <button className="mt-3 w-full bg-[#1f2d4a] hover:bg-red-600 transition-all duration-200 rounded-lg py-2 text-sm font-medium">
          Logout
        </button>

      </NavLink>

      

</div>

  );
};

export default Sidebar;

*/


/*{
const Sidebar = () => {
  return (
    <div style={styles.sidebar}>
      
      <ul style={styles.menu}>
        {menuItems.map((item, index) => (
          <li key={index}>
            <item.icon />
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    backgroundColor: "#000", // dark gray
    color: "white",
    padding: "20px",
    boxSizing: "border-box",
  },
  menu: {
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
  },
};

export default Sidebar;
        <li>Performance & Targets</li>
        <li>Revenue Tracking</li>
        <li>Customer Management</li>
        <li>Field Officer Performance</li>
        <li>Petty Cash</li>
        <li>Loan Categories</li>
        <li>User Management</li>
        <li>Audit Logs</li>
        <li>System Configuration</li>
        <li>Profile</li>
      </ul>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    backgroundColor: "#000", // dark gray
    color: "white",
    padding: "20px",
    boxSizing: "border-box",
  },
  menu: {
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
  },
};

export default Sidebar;

}*/
