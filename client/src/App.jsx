import React from 'react'
import AdminNavbar from './component/Navbar/AdminNavbar'
import CommonNavbar from './component/Navbar/CommonNavbar'
import ReceptionistNavbar from './component/Navbar/ReceptionistNavbar'
import Footer from './component/Footer/Footer'

const App = () => {
  return (
    <div className=''>
      {/* <AdminNavbar /> */}
      <CommonNavbar />
      {/* <ReceptionistNavbar /> */}

      <Footer />
    </div>
  )
}

export default App