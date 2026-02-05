import React from 'react'

import HomeImg from '../../assets/Home.jpg'
import CommonNavbar from '../../component/Navbar/CommonNavbar'
import Footer from '../../component/Footer/Footer'

const Home = () => {
  return (
    <>
      <CommonNavbar />
      <div className="relative w-full h-screen">
        <img
          src={HomeImg}
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="absolute inset-0 flex flex-col gap-15 justify-center items-center md:items-start px-4 md:px-24">
          <span className="text-white text-6xl md:text-9xl text-center md:text-left font-bold leading-20 md:leading-none">
            Lanka <br /> Capital <br className='md:hidden' /> Pvt.Ltd
          </span>
          <span className='w-[50%] text-center md:text-left'>
            We provide fast, secure, and transparent financial solutions tailored to your needs. Your financial growth is our priority.
          </span>

          <button className='w-fit border hover:bg-amber-50 hover:text-black'>Contact Us</button>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Home