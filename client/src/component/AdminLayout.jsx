import { Outlet } from "react-router-dom";
import Sidebar from "./AdminSidebar/AdminSidebar";
import AdminNavbar from "./Navbar/AdminNavbar";
import Footer from "./Footer/Footer";

const AdminLayout = () => {
  return (

    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      {/* <AdminNavbar /> */}
      <div className="flex h-full overflow-hidden">
        <aside className="w-fit min-w-[256px] bg-[#071428] border-r border-gray-800 overflow-hidden">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto  overflow-x-hidden bg-gray-50">
          <div className="min-h-full flex flex-col">
            <div className="flex-1 p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;