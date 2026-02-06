import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import CommonNavbar from './component/Navbar/CommonNavbar'
import Footer from './component/Footer/Footer'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import Contact from "./pages/Contact/Contact";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/contact" element={<Contact />}></Route>
      </Routes>
    </BrowserRouter>

    // <div className='relative'>
    //   {/* <AdminNavbar /> */}
    //   {/* <ReceptionistNavbar /> */}
    //   <CommonNavbar />

    //   <Home />
    //   <About />
    //   <Footer />
    // </div>
    //
  )
}

export default App