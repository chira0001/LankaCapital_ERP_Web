import React from 'react'
import AdminNavbar from './component/Navbar/AdminNavbar'
import CommonNavbar from './component/Navbar/CommonNavbar'
import ReceptionistNavbar from './component/Navbar/ReceptionistNavbar'
import Footer from './component/Footer/Footer'
import Home from './pages/Home/Home'
import About from './pages/About/about'

const App = () => {
  return (
    <div className='relative'>
      {/* <AdminNavbar /> */}
      {/* <ReceptionistNavbar /> */}
      <CommonNavbar />

      <Home />
      <About />

      <Footer />
    </div>
  )
}

export default App