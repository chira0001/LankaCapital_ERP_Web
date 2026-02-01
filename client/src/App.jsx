import React from 'react'
import AdminNavbar from './component/Navbar/AdminNavbar'
import CommonNavbar from './component/Navbar/CommonNavbar'
import ReceptionistNavbar from './component/Navbar/ReceptionistNavbar'

const App = () => {
  return (
    <div className=''>
      <AdminNavbar />
      <CommonNavbar />
      <ReceptionistNavbar />
    </div>
  )
}

export default App