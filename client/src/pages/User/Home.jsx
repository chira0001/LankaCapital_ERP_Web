import React from 'react'

import HomeImg from '../../assets/Home.jpg'
import CommonNavbar from '../../component/Navbar/CommonNavbar'
import Footer from '../../component/Footer/Footer'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();

  const navigateContact = () => {
    navigate('/contact');
  }

  return (
    <>
      <CommonNavbar />
      <div className="relative w-full min-h-screen overflow-hidden">
        <img
          src={HomeImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-20 text-center md:items-start md:px-10 md:py-24 lg:px-24">
          <span className="max-w-xl text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl lg:text-9xl md:text-left">
            Lanka <br /> Capital <br className='md:hidden' /> Pvt.Ltd
          </span>
          <span className='max-w-xl text-sm text-white/90 sm:text-base md:max-w-[50%] md:text-left'>
            We provide fast, secure, and transparent financial solutions tailored to your needs. Your financial growth is our priority.
          </span>

          <button className='w-fit rounded border border-white px-6 py-3 text-white transition hover:bg-amber-50 hover:text-black' onClick={navigateContact}>Contact Us</button>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Home