import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import CommonNavbar from './component/Navbar/CommonNavbar'
import Footer from './component/Footer/Footer'
import { Toaster } from "@/components/ui/sonner";//add sonner toaster for notifications

import Home from './pages/User/Home'
import About from './pages/User/About'
import Contact from "./pages/User/Contact";
import Login from "./pages/User/Login";
import Signup from "./pages/User/Signup";

import AdminLayout from "./component/AdminLayout";
import LoanApplications from "./pages/Admin/LoanApplication";
import Dashboard from "./pages/Admin/Dashboard";
import PortfolioOverview from "./pages/Admin/PortfolioOverviewPage";
import LoanPerformance from "./pages/Admin/LoanPerformancePage";
import RevenueTracking from "./pages/Admin/RevenueTrackingPage";
import CustomerManagementPage from "./pages/Admin/CustomerManagementPage";
import FieldOfficerPerformancePage from "./pages/Admin/FeildOfficerPerformance";
import PettyCashPage from "./pages/Admin/PettyCashPage";
import FinancialReportsPage from "./pages/Admin/FinancialReportsPage";
import PerformanceTargetsPages from "./pages/Admin/PerformanceTargetsPages";
import LoanCategoryConfigPage from "./pages/Admin/LoanCategoryConfigPage";
import UserManagementPage from "./pages/Admin/UserManagementPage";
import AuditLogsPage from "./pages/Admin/AuditLogsPage";
import SystemConfigurationPage from "./pages/Admin/SystemConfigurationPage";
import AdminProfile from "./pages/Admin/AdminProfile";

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
        <Route path="/signup" element={<Signup />}></Route>

        <Route path="/" element={<Navigate to="/ad/dashboard" />} />
        <Route path="/ad" element={<AdminLayout />}>
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

        <Route path="/re" element={<ReceptionistDashboard />}>
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