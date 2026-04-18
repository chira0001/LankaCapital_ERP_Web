import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import CommonNavbar from './component/Navbar/CommonNavbar'
import Footer from './component/Footer/Footer'
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;