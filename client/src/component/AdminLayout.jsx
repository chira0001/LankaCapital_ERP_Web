import { Outlet } from "react-router-dom";
import Sidebar from "./AdminSidebar/AdminSidebar";
import AdminNavbar from "./Navbar/AdminNavbar";
import Footer from "./Footer/Footer";

const AdminLayout = () => {
  return (

    <div className="h-screen w-full overflow-hidden bg-gray-100">
      {/* <AdminNavbar /> */}
      <div className="flex h-full flex-col overflow-hidden md:flex-row">
        <aside className="w-full shrink-0 border-b border-gray-800 bg-[#071428] md:w-fit md:min-w-[256px] md:border-b-0 md:border-r">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          <div className="min-h-full flex flex-col">
            <div className="flex-1 p-3 sm:p-4 lg:p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;