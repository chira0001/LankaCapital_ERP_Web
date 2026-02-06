import React from 'react'
import ContactInfo from '../../component/ContactInfo/ContactInfo'
import CommonNavbar from '../../component/Navbar/CommonNavbar'

const Contact = () => {

    const contactInfos = [
        {
            h2: "Chat with Us",
            span: "Speak to our friendly team",
            svg: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M12 8c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3m0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1M5 8c1.65 0 3-1.35 3-3S6.65 2 5 2 2 3.35 2 5s1.35 3 3 3m0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m14 4c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3m0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m-7 11c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3m0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m-7 4c1.65 0 3-1.35 3-3S6.65 9 5 9s-3 1.35-3 3 1.35 3 3 3m0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m14 4c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3m0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m-7 11c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3m0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1"></path></svg>,
            a: "",
            a_value: "Chat via WhatsApp"
        },
        {
            h2: "Call Us",
            span: "Call our Team",
            svg: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M18.07 22h.35c.47-.02.9-.26 1.17-.64l2.14-3.09c.23-.33.32-.74.24-1.14s-.31-.74-.64-.97l-4.64-3.09a1.47 1.47 0 0 0-.83-.25c-.41 0-.81.16-1.1.48l-1.47 1.59c-.69-.43-1.61-1.07-2.36-1.82s-1.39-1.68-1.82-2.36l1.59-1.47c.54-.5.64-1.32.23-1.93L7.84 2.67c-.22-.33-.57-.57-.97-.64a1.46 1.46 0 0 0-1.13.24L2.65 4.41c-.39.27-.62.7-.64 1.17-.03.69-.16 6.9 4.68 11.74 4.35 4.35 9.81 4.69 11.38 4.69ZM6.88 10.05c-.16.15-.21.39-.11.59.05.09 1.15 2.24 2.74 3.84 1.6 1.6 3.75 2.7 3.84 2.75.2.1.44.06.59-.11l1.99-2.15 3.86 2.57-1.7 2.46c-1.16 0-6.13-.24-9.99-4.1S4 7.06 4 5.91l2.46-1.7 2.57 3.86-2.15 1.99Z"></path><path d="m14.71 10.71 4-4L21 9V3h-6l2.29 2.29-4 4z"></path></svg>,
            a: "",
            a_value: "+94 77 123 4567"
        },
        {
            h2: "Visit Us",
            span: "Chat to us in person at our Outlet",
            svg: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M12 2c-4.41 0-8 3.59-8 8-.03 6.45 7.12 11.6 7.42 11.82.17.12.38.19.58.19s.41-.06.58-.19c.3-.22 7.45-5.37 7.42-11.82 0-4.41-3.59-8-8-8m6 8c.02 4.44-4.39 8.42-6 9.73-1.61-1.31-6.02-5.29-6-9.74 0-3.31 2.69-6 6-6s6 2.69 6 6Z"></path><path d="m11 11.59-2.29-2.3-1.42 1.42 3.71 3.7 5.71-5.7-1.42-1.42z"></path></svg>,
            a: "",
            a_value: "Kamburupitiya, Matara"
        }
    ]

    return (
        <>
            <CommonNavbar />
            <div className='text-black bg-white flex flex-col items-center px-4 md:px-24 gap-4 py-30'>
                <h1>Contact Us</h1>
                <p className='md:pb-4'>Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Neque dolorum tenetur recusandae magnam, incidunt corporis quidem sunt a perspiciatis vero optio
                </p>
                <div className='w-full flex gap-4 flex-col md:flex-row justify-evenly'>
                    <form action="">
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col md:flex-row gap-4 md:items-center'>
                                <label htmlFor="">Name :</label>
                                <input type="text" placeholder='First Name' className='border rounded-lg px-3 py-1.5' />
                                <label htmlFor="">Business Name :</label>
                                <input type="text" placeholder='Business Name' className='border rounded-lg px-3 py-1.5' />
                            </div>
                            <div className='flex flex-col gap-4'>
                                <label htmlFor="">Business Email: </label>
                                <input type="email" placeholder='Business Email' className='border rounded-lg px-3 py-1.5 w-full' />
                            </div>
                            <div className='flex flex-col gap-4'>
                                <label htmlFor="">Business Phone: </label>
                                <input type="email" placeholder='Business Email' className='border rounded-lg px-3 py-1.5 w-full' />
                            </div>
                        </div>
                    </form>
                    <hr className='md:hidden my-4 w-[75%] border-gray-200 self-center' />
                    <ContactInfo />
                </div>
            </div>
        </>
    )
}

export default Contact