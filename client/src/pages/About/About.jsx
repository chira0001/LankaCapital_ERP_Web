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
        }
    ]

    return (
        <>
            <CommonNavbar />
            <div className='bg-white text-black flex flex-col gap-10 py-30 relative px-4 md:px-24'>
                <div className='flex flex-col items-center gap-4 font-extralight'>
                    <span className='text-2xl italic'>ABOUT</span>
                    <div className='flex flex-col items-center text-3xl md:text-8xl gap-4'>
                        <div>N K R S</div>
                        <div className='tracking-[0.5rem] md:tracking-[2rem] font-medium text-center'>LANKA CAPITAL</div>
                        <div className='md:text-5xl'>PVT. LTD.</div>
                    </div>
                    <span className='text-center'>We support your business journey with trusted financing. Together, we build stronger businesses.</span>
                </div>

                <div className='md:grid grid-cols-3 self-center gap-20'>
                    {aboutDet.map((detail, index) => {
                        return (
                            <div
                                key={index}
                                className={`rounded-xl w-[20rem] flex flex-col 
                                        ${index % 3 === 1 ? "md:mt-15 md:scale-[1.1]" : "md:scale-[0.9]"}
                                        `}
                            >
                                <img src={detail.Image} alt="" className='w-[12rem] self-center' />
                                <span className='bg-gray-400 px-6 py-3 font-bold text-4xl'>
                                    {index < 9 ? `0${index + 1}` : index + 1}
                                </span>
                                <div className='bg-gray-100 py-4 rounded-b-2xl'>
                                    <h2 className='px-6 font-bold text-2xl'>{detail.Title}</h2>
                                    <p className='px-6 font-light pt-3'>{detail.Description}</p>
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