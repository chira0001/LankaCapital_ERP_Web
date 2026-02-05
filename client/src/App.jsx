import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import CommonNavbar from './component/Navbar/CommonNavbar'
import Footer from './component/Footer/Footer'
import Home from './pages/Home/Home'
import About from './pages/About/About'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/about" element={<About />}></Route>
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