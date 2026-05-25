import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import CommonNavbar from './component/Navbar/CommonNavbar'
import Footer from './component/Footer/Footer'
import { Toaster } from "@/components/ui/sonner";//add sonner toaster for notifications
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Login/Login";

import AdminLayout from "./component/AdminLayout";
import LoanApplications from "./pages/LoanApplication/LoanApplication";
import Dashboard from "./pages/AdminDashBoard/Dashboard";
import PortfolioOverview from "./pages/AdminPortfolioOverview/PortfolioOverviewPage";
import LoanPerformance from "./pages/AdminLoanPerfomance/LoanPerformancePage";
import RevenueTracking from "./pages/AdminRevenueTracking/RevenueTrackingPage";
import CustomerManagementPage from "./pages/AdminCustomerManagement/CustomerManagementPage";
import FieldOfficerPerformancePage from "./pages/AdminFieldOfficerPerformance/FeildOfficerPerformance";
import PettyCashPage from "./pages/AdminPettyCash/PettyCashPage";
import FinancialReportsPage from "./pages/AdminFinancialReport/FinancialReportsPage";
import PerformanceTargetsPages from "./pages/AdminPerformanceNTarget/PerformanceTargetsPages";
import LoanCategoryConfigPage from "./pages/AdminLoanCategogy/LoanCategoryConfigPage";
import UserManagementPage from "./pages/AdminUserManagement/UserManagementPage";
import AuditLogsPage from "./pages/AdminAuditLogs/AuditLogsPage";
import SystemConfigurationPage from "./pages/AdminSystemConfiguration/SystemConfigurationPage";
import AdminProfile from "./pages/AdminProfile/AdminProfile";

import Signup from "./pages/Signup/Signup";
import ReceptionistDashboard from "./pages/Receptionist/ReceptionistDashboard";
import ReceptionistHome from "./pages/Receptionist/ReceptionistHome";
import ReceptionistLoan from "./pages/Receptionist/ReceptionistLoan";
import ReceptionistSalary from "./pages/Receptionist/ReceptionistSalary";
import ReceptionistView from "./pages/Receptionist/ReceptionistView";
import ReceptionistSetting from "./pages/Receptionist/ReceptionistSetting";
import ReceptionistMonthlyExpense from "./pages/Receptionist/ReceptionistMonthlyExpense";
import ReceptionistPettyCash from "./pages/Receptionist/ReceptionistPettyCash";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/contact" element={<Contact />}></Route>
        <Route path="/login" element={<Login />}></Route>

        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="loan-applications" element={<LoanApplications />} />
          <Route path="portfolio" element={<PortfolioOverview />} />
          <Route path="performance" element={<LoanPerformance />} />
          <Route path="revenue" element={<RevenueTracking />} />
          <Route path="customers" element={<CustomerManagementPage />} />
          <Route path="officers" element={<FieldOfficerPerformancePage />} />
          <Route path="petty-cash" element={<PettyCashPage />} />
          <Route path="reports" element={<FinancialReportsPage />} />
          <Route path="targets" element={<PerformanceTargetsPages />} />
          <Route path="categories" element={<LoanCategoryConfigPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="settings" element={<SystemConfigurationPage />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/reception" element={<ReceptionistDashboard />}>
          <Route index element={<ReceptionistHome />} />
          <Route path="home" element={<ReceptionistHome />} />
          <Route path="loan" element={<ReceptionistLoan />} />
          <Route path="salary" element={<ReceptionistSalary />} />
          <Route path="view" element={<ReceptionistView />} />
          <Route path="monthlyExp" element={<ReceptionistMonthlyExpense />} />
          <Route path="monthlyPetty" element={<ReceptionistPettyCash />} />
          <Route path="settings" element={<ReceptionistSetting />} />
        </Route>

      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App;