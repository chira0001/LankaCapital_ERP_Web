import React from 'react'
import about1 from '../../assets/about1.png'
import about2 from '../../assets/about2.png'
import about3 from '../../assets/about3.png'
import CommonNavbar from '../../component/Navbar/CommonNavbar'
import Footer from '../../component/Footer/Footer'

const About = () => {

    const aboutDet = [
        {
            Image: about1,
            Title: "Trusted Financial Partner",
            Description: "We are a reliable money lending company committed to providing fast, secure, and flexible loan solutions to individuals and small businesses."
        },
        {
            Image: about2,
            Title: "Empowering Your Financial Future",
            Description: "We offer affordable and responsible lending services designed to meet diverse financial needs. With a focus on integrity and efficiency, we help customers achieve their goals with confidence."
        },
        {
            Image: about3,
            Title: "Simple, Smart, and Secure Lending",
            Description: "Our company delivers easy access loan services with fair interest rates and quick approvals. We prioritize customer satisfaction, data security, and long‑term financial stability."
        },
    ]

    return (
        <>
            <CommonNavbar />
            <div className='bg-white text-black flex flex-col gap-10 py-24 relative px-4 sm:px-6 md:px-12 lg:px-24'>
                <div className='flex flex-col items-center gap-4 font-extralight'>
                    <span className='text-2xl'>ABOUT</span>
                    <div className='flex flex-col items-center gap-4 text-3xl md:text-6xl lg:text-8xl'>
                        <div>N K R S</div>
                        <div className='tracking-[0.35rem] text-center font-medium sm:tracking-[0.75rem] md:tracking-[1.5rem]'>LANKA CAPITAL</div>
                        <div className='text-2xl md:text-5xl'>PVT. LTD.</div>
                    </div>
                    <span className='max-w-3xl text-center'>We support your business journey with trusted financing. Together, we build stronger businesses.</span>
                </div>

                <div className='grid grid-cols-1 gap-8 self-center sm:grid-cols-2 xl:grid-cols-3 xl:gap-12'>
                    {aboutDet.map((detail, index) => {
                        return (
                            <div
                                key={index}
                                className={`flex w-full max-w-[20rem] flex-col rounded-xl overflow-hidden ${index % 3 === 1 ? "md:mt-8 xl:mt-14 xl:scale-[1.05]" : ""}`}
                            >
                                <img src={detail.Image} alt="" className='w-full max-w-[20rem] self-center object-contain' />
                                <span className='bg-gray-400 px-6 py-3 font-bold text-4xl'>
                                    {index < 9 ? `0${index + 1}` : index + 1}
                                </span>
                                <div className='bg-gray-100 py-4 rounded-b-2xl'>
                                    <h2 className='px-6 font-bold text-2xl'>{detail.Title}</h2>
                                    <p className='px-6 pt-3 font-light'>{detail.Description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default About