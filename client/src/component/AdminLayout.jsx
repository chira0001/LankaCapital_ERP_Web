import { Outlet } from "react-router-dom";
import Sidebar from "./AdminSidebar/AdminSidebar";
import AdminNavbar from "./Navbar/AdminNavbar";
import Footer from "./Footer/Footer";
//import Dashboard from "../../pages/Dashboard/Dashboard";


/*
const AdminLayout = () => {
  return (
      
      <div className="flex flex-col min-h-screen">

        \* Navbar *\/
        <AdminNavbar />

        \* Main Content Area *\/
        <div className="flex flex-1 bg-gray-50">

          \* Sidebar *\/
        <div className="w-64 bg-white border-r border-gray-200">
          <Sidebar />
        </div>

          \* Main Content *\/
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-auto mt-16">
            <Outlet />
          </div>
        </div>

      </div>

        \* Footer *\/
        <Footer />
    </div>
  );
};

export default AdminLayout;
*/


const AdminLayout = () => {
  return (

    <div className="h-screen w-screen overflow-hidden bg-gray-100">

      {/* Navbar */}
      <AdminNavbar />

      {/* Main Layout */}
      <div className="flex h-full pt-16 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-64 min-w-[256px] bg-[#071428] border-r border-gray-800 overflow-hidden">

          <Sidebar />

        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto  overflow-x-hidden bg-gray-50">

          <div className="min-h-full flex flex-col">

            {/* Page Content */}
            <div className="flex-1 p-6">

              <Outlet />

            </div>

            {/* Footer */}
            <Footer />

          </div>

        </main>

      </div>

    </div>
  );
};

export default AdminLayout;