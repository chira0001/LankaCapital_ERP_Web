import { LayoutDashboard } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
import { FileText, BarChart2, TrendingUp, DollarSign, Users, UserCheck, CreditCard, Target, Layers, UserPlus, ClipboardList, Settings } from "lucide-react";


const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Loan Applications", icon: FileText, path: "/admin/loan-applications" },
  { name: "Portfolio Overview", icon: BarChart2, path: "/admin/portfolio" },
  { name: "Loan Performance", icon: TrendingUp, path: "/admin/performance" },
  { name: "Revenue Tracking", icon: DollarSign, path: "/admin/revenue" },
  { name: "Customer Management", icon: Users, path: "/admin/customers" },
  { name: "Field Officer Performance", icon: UserCheck, path: "/admin/officers" },
  { name: "Petty Cash", icon: CreditCard, path: "/admin/petty-cash" },
  { name: "Financial Reports", icon: BarChart2, path: "/admin/reports" },
  { name: "Performance & Targets", icon: Target, path: "/admin/targets" },
  { name: "Loan Categories", icon: Layers, path: "/admin/categories" },
  { name: "User Management", icon: UserPlus, path: "/admin/users" },
  { name: "Audit Logs", icon: ClipboardList, path: "/admin/audit" },
  { name: "System Configuration", icon: Settings, path: "/admin/settings" },
];


const Sidebar = () => {
  return (
    <div className="w-64 mt-22 h-full min-h-screen bg-[#071428] text-white flex flex-col px-3 py-4 overflow-y-auto border-r border-gray-800 min-w-[220px] max-w-[280px]">

{/* menu Section */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
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

</div>

  );
};

export default Sidebar;


{/*
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

*/}
