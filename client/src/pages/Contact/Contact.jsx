import React, { useState } from 'react'
import ContactInfo from '../../component/ContactInfo/ContactInfo'
import CommonNavbar from '../../component/Navbar/CommonNavbar'
import Footer from '../../component/Footer/Footer'

const Contact = () => {

    const [firstName, setFirstName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [businessEmail, setBusinessEmail] = useState("");
    const [businessPhone, setBusinessPhone] = useState("");
    const [message, setMessage] = useState("");

    const [inputs, setInputs] = useState({
        fname: false,
        bname: false,
        bemail: false,
        bphone: false,
        msg: false
    });

    const sendMessage = (e) => {
        e.preventDefault();
        const errors = {
            fname: !firstName || firstName.trim() === "",
            bname: !businessName || businessName.trim() === "",
            bemail: !businessEmail || businessEmail.trim() === "",
            bphone: !businessPhone || businessPhone.trim() === "",
            msg: !message || message.trim() === ""
        };
        setInputs(errors);
    }

    return (
        <>
            <CommonNavbar />
            <div className='text-black bg-white flex flex-col items-center px-4 md:px-24 gap-8 pt-30 pb-15'>
                <h1 className='font-bold'>Contact Us</h1>
                <p className='md:pb-4 text-center font-light'>We’re here to help with all your lending needs and we’ll respond as quickly as possible to provide reliable and friendly assistance.
                    Contact us for inquiries about loans, applications, or account support.
                </p>
                <div className='w-full flex gap-4 flex-col md:flex-row justify-evenly'>
                    <form action="">
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col md:flex-row gap-4 md:items-center'>
                                <div className='flex flex-col gap-2'>
                                    <label htmlFor="">Name :</label>
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            name="fname"
                                            placeholder={inputs.fname ? "Please enter name" : "Your name"}
                                            className={`border rounded-lg px-3 py-1.5 pr-10 w-full
                                                ${inputs.fname ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                                            value={firstName}
                                            onChange={(e) => {
                                                setFirstName(e.target.value);
                                                setInputs((p) => ({
                                                    ...p,
                                                    fname: e.target.value.trim() === ""
                                                }));
                                            }}
                                        />

                                        {inputs.fname && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width={18}
                                                    height={18}
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M11 7h2v6h-2zm0 8h2v2h-2z"></path>
                                                    <path d="M12 22c5.51 0 10-4.49 10-10S17.51 2 12 2 2 6.49 2 12s4.49 10 10 10m0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8"></path>
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <label htmlFor="">Business Name :</label>
                                    <div className='relative w-full'>
                                        <input type="text"
                                            name='bname'
                                            placeholder={inputs.bname ? "Business name required" : "Business name"}
                                            className={`border rounded-lg px-3 py-1.5 pr-10 w-full
                                                ${inputs.bname ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                                            value={businessName}
                                            onChange={(e) => {
                                                setBusinessName(e.target.value);
                                                setInputs((p) => ({
                                                    ...p,
                                                    bname: e.target.value.trim() === ""
                                                }))
                                            }}
                                        />
                                        {inputs.bname && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width={18}
                                                    height={18}
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M11 7h2v6h-2zm0 8h2v2h-2z"></path>
                                                    <path d="M12 22c5.51 0 10-4.49 10-10S17.51 2 12 2 2 6.49 2 12s4.49 10 10 10m0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8"></path>
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor="">Business Email : </label>
                                <div className='relative w-full'>
                                    <input type="email"
                                        name='bemail'
                                        placeholder={inputs.bemail ? "Please enter email" : "Business email"}
                                        className={`border rounded-lg px-3 py-1.5 w-full pr-10
                                            ${inputs.bemail ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                                        value={businessEmail}
                                        onChange={(e) => {
                                            setBusinessEmail(e.target.value);
                                            setInputs((p) => ({
                                                ...p,
                                                bemail: e.target.value.trim() === ""
                                            }))
                                        }}
                                    />
                                    {inputs.bemail && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={18}
                                                height={18}
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M11 7h2v6h-2zm0 8h2v2h-2z"></path>
                                                <path d="M12 22c5.51 0 10-4.49 10-10S17.51 2 12 2 2 6.49 2 12s4.49 10 10 10m0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8"></path>
                                            </svg>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor="">Business Phone : </label>
                                <div className='relative w-full'>
                                    <input type="tel"
                                        placeholder={inputs.bphone ? "Please enter phone" : "Phone number"}
                                        className={`border rounded-lg px-3 py-1.5 w-full pr-10
                                            ${inputs.bphone ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                                        name='bphone'
                                        value={businessPhone}
                                        onChange={(e) => {
                                            setBusinessPhone(e.target.value);
                                            setInputs((p) => ({
                                                ...p,
                                                bphone: e.target.value.trim() === ""
                                            }))
                                        }}
                                    />
                                    {inputs.bphone && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={18}
                                                height={18}
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M11 7h2v6h-2zm0 8h2v2h-2z"></path>
                                                <path d="M12 22c5.51 0 10-4.49 10-10S17.51 2 12 2 2 6.49 2 12s4.49 10 10 10m0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8"></path>
                                            </svg>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <label htmlFor="">Message : </label>
                                <div className='relative w-full'>
                                    <textarea
                                        name="msg"
                                        id=""
                                        placeholder={inputs.msg  ? "Enter a message" : "Message"}
                                        className={`border rounded-lg px-3 py-1.5 w-full pr-10
                                            ${inputs.msg ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                                        rows="6"
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value);
                                            setInputs((p) => ({
                                                ...p,
                                                msg: e.target.value.trim() === ""
                                            }))
                                        }}
                                    ></textarea>
                                    {inputs.msg && (
                                        <span className="absolute right-3 top-6 text-red-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width={18}
                                                height={18}
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M11 7h2v6h-2zm0 8h2v2h-2z"></path>
                                                <path d="M12 22c5.51 0 10-4.49 10-10S17.51 2 12 2 2 6.49 2 12s4.49 10 10 10m0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8"></path>
                                            </svg>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className='border md:w-1/2 md:self-end px-4 py-1.5 bg-black text-white rounded' onClick={sendMessage}>SUBMIT</button>
                        </div>
                    </form>
                    <hr className='md:hidden my-4 w-3/4 border-gray-200 self-center' />
                    <ContactInfo />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Contact