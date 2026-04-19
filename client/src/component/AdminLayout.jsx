import { Outlet } from "react-router-dom";
import Sidebar from "./AdminSidebar/AdminSidebar";
import AdminNavbar from "./Navbar/AdminNavbar";
import Footer from "./Footer/Footer";
//import Dashboard from "../../pages/Dashboard/Dashboard";

const AdminLayout = () => {
  return (
      
      <div className="flex flex-col min-h-screen">

        {/* Top Navbar */}
        <AdminNavbar />

        {/* main area */}
        <div className="flex flex-1 bg-gray-50">

          {/* Sidebar (FULL HEIGHT) */}
        <div className="w-64 bg-white border-r border-gray-200">
          <Sidebar />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-auto mt-16">
            <Outlet />
          </div>
        </div>

      </div>

        {/* Footer */}
        <Footer />
    </div>
  );
};

export default AdminLayout;