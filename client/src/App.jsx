import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";//add sonner toaster for notifications
import { jwtDecode } from 'jwt-decode'

import AdminLayout from "./component/AdminLayout";
import { useAdminMenuAccess } from "@/lib/adminMenuAccess";
import { ADMIN_MENU_ITEMS } from "@/lib/adminMenuItems";

const Home = lazy(() => import("./pages/User/Home"));
const About = lazy(() => import("./pages/User/About"));
const Contact = lazy(() => import("./pages/User/Contact"));
const Login = lazy(() => import("./pages/User/Login"));
const Signup = lazy(() => import("./pages/User/Signup"));
const LoanApplications = lazy(() => import("./pages/Admin/LoanApplication"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const CustomerManagementPage = lazy(() => import("./pages/Admin/CustomerManagementPage"));
const FieldOfficerPerformancePage = lazy(() => import("./pages/Admin/FeildOfficerPerformance"));
const AdministrativeExpensePage = lazy(() => import("./pages/Admin/AdministrativeExpensePage"));
const FinancialReportsPage = lazy(() => import("./pages/Admin/FinancialReportsPage"));
const UserManagementPage = lazy(() => import("./pages/Admin/UserManagementPage"));
const SystemConfigurationPage = lazy(() => import("./pages/Admin/SystemConfigurationPage"));
const AdminProfile = lazy(() => import("./pages/Admin/AdminProfile"));
const Salary = lazy(() => import("./pages/Admin/Salary"));
const ReceptionistDashboard = lazy(() => import("./pages/Receptionist/ReceptionistDashboard"));
const ReceptionistHome = lazy(() => import("./pages/Receptionist/ReceptionistHome"));
const ReceptionistLoan = lazy(() => import("./pages/Receptionist/ReceptionistLoan"));
const ReceptionistSalary = lazy(() => import("./pages/Receptionist/ReceptionistSalary"));
const ReceptionistView = lazy(() => import("./pages/Receptionist/ReceptionistView"));
const ReceptionistSetting = lazy(() => import("./pages/Receptionist/ReceptionistSetting"));
const ReceptionistAdministrativeExpense = lazy(() => import("./pages/Receptionist/ReceptionistAdministrativeExpense"));
const LoanSummary = lazy(() => import("./component/LoanSummary/LoanSummary"));

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

const RouteLoading = () => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black motion-reduce:animate-none" />
    <span className="sr-only">Loading page...</span>
  </div>
);

const AdminMenuRoute = ({ permission, children }) => {
  const { isLoading, isSuperAdmin, permissions } = useAdminMenuAccess();

  if (isLoading) {
    return (
      <div
        className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10"
        role="status"
        aria-live="polite"
      >
        <div className="w-full max-w-xl rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 shrink-0 animate-spin rounded-full border-4 border-gray-200 border-t-black motion-reduce:animate-none"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Loading Access Details
              </p>
              <p className="text-xs text-gray-500">
                Please wait while we verify your access...
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="h-10 w-full animate-pulse rounded border border-gray-100 bg-gray-50 motion-reduce:animate-none"
              />
            ))}
          </div>

          <span className="sr-only">Loading access...</span>
        </div>
      </div>
    );
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
      <Suspense fallback={<RouteLoading />}>
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
          <Route path="salary" element={<AdminMenuRoute permission="salary"><Salary /></AdminMenuRoute>} />
          <Route path="customers" element={<AdminMenuRoute permission="customers"><CustomerManagementPage /></AdminMenuRoute>} />
          <Route path="officers" element={<AdminMenuRoute permission="officers"><FieldOfficerPerformancePage /></AdminMenuRoute>} />
          <Route path="admin-exp" element={<AdminMenuRoute permission="admin-exp"><AdministrativeExpensePage /></AdminMenuRoute>} />
          <Route path="financials" element={<AdminMenuRoute permission="financials"><FinancialReportsPage /></AdminMenuRoute>} />
          <Route path="users" element={<AdminMenuRoute permission="users"><UserManagementPage /></AdminMenuRoute>} />
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
          <Route path="admin-exp" element={<ReceptionistAdministrativeExpense />} />
          <Route path="settings" element={<ReceptionistSetting />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App;