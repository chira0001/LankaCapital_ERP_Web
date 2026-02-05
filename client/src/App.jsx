import CommonNavbar from './component/Navbar/CommonNavbar'
import Footer from './component/Footer/Footer'
import Home from './pages/Home/Home'
import About from './pages/About/About'

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