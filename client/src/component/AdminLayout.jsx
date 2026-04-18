import { Outlet } from "react-router-dom";
import Sidebar from "./AdminSidebar/AdminSidebar";
import AdminNavbar from "./Navbar/AdminNavbar";
//import Dashboard from "../../pages/Dashboard/Dashboard";

const AdminLayout = () => {
  return (
      
      <div className="flex h-screen overflow-hidden">

        {/* Top Navbar */}
        <AdminNavbar />

        {/* Sidebar */}
        <div className="flex flex-1 bg-gray-50">

          <Sidebar />

        {/* Page Content */}
          <div className="flex-1 p-6 overflow-auto mt-16 ml-1 ">

            <Outlet />
          </div>

       </div>
    </div>
  );
};

export default AdminLayout;