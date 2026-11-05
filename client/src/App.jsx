import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import CommonNavbar from './component/Navbar/CommonNavbar'
import Footer from './component/Footer/Footer'
import { Toaster } from "@/components/ui/sonner";//add sonner toaster for notifications
import { jwtDecode } from 'jwt-decode'

import Home from './pages/User/Home'
import About from './pages/User/About'
import Contact from "./pages/User/Contact";
import Login from "./pages/User/Login";
import Signup from "./pages/User/Signup";

import AdminLayout from "./component/AdminLayout";
import LoanApplications from "./pages/Admin/LoanApplication";
import Dashboard from "./pages/Admin/Dashboard";
// import PortfolioOverview from "./pages/Admin/PortfolioOverviewPage";
// import LoanPerformance from "./pages/Admin/LoanPerformancePage";
// import RevenueTracking from "./pages/Admin/RevenueTrackingPage";
import CustomerManagementPage from "./pages/Admin/CustomerManagementPage";
import FieldOfficerPerformancePage from "./pages/Admin/FeildOfficerPerformance";
import PettyCashPage from "./pages/Admin/PettyCashPage";
import FinancialReportsPage from "./pages/Admin/FinancialReportsPage";
// import PerformanceTargetsPages from "./pages/Admin/PerformanceTargetsPages";
import UserManagementPage from "./pages/Admin/UserManagementPage";
// import AuditLogsPage from "./pages/Admin/AuditLogsPage";
import SystemConfigurationPage from "./pages/Admin/SystemConfigurationPage";
import AdminProfile from "./pages/Admin/AdminProfile";
import { useAdminMenuAccess } from "@/lib/adminMenuAccess";
import { ADMIN_MENU_ITEMS } from "@/lib/adminMenuItems";

import ReceptionistDashboard from "./pages/Receptionist/ReceptionistDashboard";
import ReceptionistHome from "./pages/Receptionist/ReceptionistHome";
import ReceptionistLoan from "./pages/Receptionist/ReceptionistLoan";
import ReceptionistSalary from "./pages/Receptionist/ReceptionistSalary";
import ReceptionistView from "./pages/Receptionist/ReceptionistView";
import ReceptionistSetting from "./pages/Receptionist/ReceptionistSetting";
import ReceptionistMonthlyExpense from "./pages/Receptionist/ReceptionistMonthlyExpense";
import ReceptionistPettyCash from "./pages/Receptionist/ReceptionistPettyCash";
import LoanSummary from "./component/LoanSummary/LoanSummary";
import Salary from "./pages/Admin/Salary";

const getUser = () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    console.log("Invalid token");
    return null;
  }
};

const ProtectedRoute = ({ children, role }) => {
  const user = getUser();

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but has the wrong role
  if (user.role !== role) {

    if (user.role === "ADMIN") {
      return <Navigate to="/ad/dashboard" replace />;
    }

    if (user.role === "RECEPTIONIST") {
      return <Navigate to="/re/home" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  // Correct role
  return children;
};

const AdminMenuRoute = ({ permission, children }) => {
  const { isLoading, isSuperAdmin, permissions } = useAdminMenuAccess();

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading access...</div>;
  }
  if (isSuperAdmin || permissions.includes(permission)) return children;

  const firstAllowedItem = ADMIN_MENU_ITEMS.find((item) => permissions.includes(item.id));
  return <Navigate to={firstAllowedItem?.path ?? "/ad/profile"} replace />;
};

const PublicRoute = ({ children }) => {
  const user = getUser();

  // User not logged in
  if (!user) {
    return children;
  }

  // Admin already logged in
  if (user.role === "ADMIN") {
    return <Navigate to="/ad/dashboard" replace />;
  }

  // Receptionist already logged in
  if (user.role === "RECEPTIONIST") {
    return <Navigate to="/re/home" replace />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>}></Route>
        <Route path="/about" element={<PublicRoute><About /></PublicRoute>}></Route>
        <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>}></Route>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>}></Route>
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>}></Route>

        <Route path="/ad" element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminMenuRoute permission="dashboard"><Dashboard /></AdminMenuRoute>} />
          <Route path="dashboard" element={<AdminMenuRoute permission="dashboard"><Dashboard /></AdminMenuRoute>} />
          <Route path="loan-applications" element={<AdminMenuRoute permission="loan-applications"><LoanApplications /></AdminMenuRoute>} />
          <Route path="loan-summary" element={<AdminMenuRoute permission="loan-summary"><LoanSummary /></AdminMenuRoute>} />
          {/* <Route path="portfolio" element={<PortfolioOverview />} /> */}
          {/* <Route path="performance" element={<LoanPerformance />} /> */}
          {/* <Route path="revenue" element={<RevenueTracking />} /> */}
          <Route path="salary" element={<AdminMenuRoute permission="salary"><Salary /></AdminMenuRoute>} />
          <Route path="customers" element={<AdminMenuRoute permission="customers"><CustomerManagementPage /></AdminMenuRoute>} />
          <Route path="officers" element={<AdminMenuRoute permission="officers"><FieldOfficerPerformancePage /></AdminMenuRoute>} />
          <Route path="admin-exp" element={<AdminMenuRoute permission="admin-exp"><PettyCashPage /></AdminMenuRoute>} />
          {/* <Route path="petty-cash" element={<PettyCashPage />} /> */}
          <Route path="financials" element={<AdminMenuRoute permission="financials"><FinancialReportsPage /></AdminMenuRoute>} />
          {/* <Route path="targets" element={<PerformanceTargetsPages />} /> */}
          <Route path="users" element={<AdminMenuRoute permission="users"><UserManagementPage /></AdminMenuRoute>} />
          {/* <Route path="audit" element={<AuditLogsPage />} /> */}
          <Route path="settings" element={<AdminMenuRoute permission="settings"><SystemConfigurationPage /></AdminMenuRoute>} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="/re" element={
          <ProtectedRoute role="RECEPTIONIST">
            <ReceptionistDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<ReceptionistHome />} />
          <Route path="home" element={<ReceptionistHome />} />
          <Route path="loan" element={<ReceptionistLoan />} />
          <Route path="loan-summary" element={<LoanSummary />} />
          <Route path="salary" element={<ReceptionistSalary />} />
          <Route path="view" element={<ReceptionistView />} />
          {/* <Route path="monthlyExp" element={<ReceptionistMonthlyExpense />} /> */}
          <Route path="admin-exp" element={<ReceptionistPettyCash />} />
          {/* <Route path="monthlyPetty" element={<ReceptionistPettyCash />} /> */}
          <Route path="settings" element={<ReceptionistSetting />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App;