import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import CommonNavbar from './component/Navbar/CommonNavbar'
import Footer from './component/Footer/Footer'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Login/Login";
// import LoanApplication from "./pages/LoanApplication/LoanApplication";
//import LoanApplication from "./pages/LoanApplication/LoanApplication";
import AdminLayout from "./component/AdminLayout";
import LoanApplications from "./pages/LoanApplication/LoanApplication";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/contact" element={<Contact />}></Route>
        <Route path="/login" element={<Login />}></Route>
        {/* <Route path="/loan-application" element={<LoanApplication />}></Route> */}
        <Route path="/" element={<AdminLayout />}>
        
        {/* default page (instead of dashboard) */}
        <Route index element={<LoanApplications />} />

        {/* other routes */}
        <Route path="loan-applications" element={<LoanApplications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;