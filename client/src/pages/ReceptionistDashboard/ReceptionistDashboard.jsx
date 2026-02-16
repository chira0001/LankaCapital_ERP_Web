import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ReceptionistNavbar from '../../component/Navbar/ReceptionistNavbar'
import Footer from '../../component/Footer/Footer'
import HomeImg from '../../assets/Home.jpg'

const ReceptionistDashboard = () => {
    const [panel, setPanel] = useState('home');

    const editIcon = <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M5 21h14c1.1 0 2-.9 2-2v-7h-2v7H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2"></path><path d="M7 13v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l9-9a.996.996 0 0 0 0-1.41l-3-3a.996.996 0 0 0-1.41 0l-9.01 8.99A1 1 0 0 0 7 13m10-7.59L18.59 7 17.5 8.09 15.91 6.5zm-8 8 5.5-5.5 1.59 1.59-5.5 5.5H9z"></path></svg>;

    const panelNames = [
        {
            name: "Home",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.4 0 .77-.24.92-.62.15-.37.07-.8-.22-1.09l-8.99-9a.996.996 0 0 0-1.41 0l-9.01 9c-.29.29-.37.72-.22 1.09s.52.62.92.62Zm9-8.59 6 6V20H6v-9.59z"></path></svg>,
            css: `flex gap-3 items-center ${panel === 'home' ? "text-black" : "text-gray-400"}`,
            func: 'home'
        },
        {
            name: "Add Customer",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M22 11h-3V8h-2v3h-3v2h3v3h2v-3h3zM4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2 .82-2 2-2 2 .82 2 2M3 20h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1m4-5h2c1.65 0 3 1.35 3 3H4c0-1.65 1.35-3 3-3"></path></svg>,
            css: `flex gap-3 items-center ${panel === 'add' ? "text-black" : "text-gray-400"}`,
            func: 'add'
        },
        {
            name: "View Customer",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2 .82-2 2-2 2 .82 2 2M3 20h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1m4-5h2c1.65 0 3 1.35 3 3H4c0-1.65 1.35-3 3-3m14-3.5c0-2-1.5-3.5-3.5-3.5S14 9.5 14 11.5s1.5 3.5 3.5 3.5c.62 0 1.18-.16 1.67-.42l2.12 2.12 1.41-1.41-2.12-2.12c.26-.49.42-1.05.42-1.67M17.5 13c-.88 0-1.5-.62-1.5-1.5s.62-1.5 1.5-1.5 1.5.62 1.5 1.5-.62 1.5-1.5 1.5"></path></svg>,
            css: `flex w-full gap-3 items-center ${panel === 'view' ? "text-black" : "text-gray-400"}`,
            func: 'view'
        },
        {
            name: "Settings",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M22 12.5v-1h-1.03c-.04-.78-.18-1.54-.41-2.26l.95-.37-.36-.93-.95.37c-.38-.85-.89-1.62-1.5-2.3l.73-.73-.71-.71-.73.73c-.57-.51-1.2-.95-1.89-1.3l.42-.93-.91-.41-.42.94a8.9 8.9 0 0 0-2.69-.57V2h-1v1.03c-.78.04-1.54.18-2.26.41l-.37-.95-.93.36.37.95c-.85.38-1.62.89-2.3 1.5l-.73-.73-.71.71.73.73c-.51.57-.95 1.2-1.3 1.89l-.93-.42-.41.91.94.42a8.9 8.9 0 0 0-.57 2.69H2v1h1.03c.04.78.18 1.54.41 2.26l-.95.37.36.93.95-.37c.38.85.89 1.62 1.5 2.3l-.73.73.71.71.73-.73c.57.51 1.2.95 1.89 1.3l-.42.93.91.41.42-.94a8.9 8.9 0 0 0 2.69.57V22h1v-1.03c.78-.04 1.54-.18 2.26-.41l.37.95.93-.36-.37-.95c.85-.38 1.62-.89 2.3-1.5l.73.73.71-.71-.73-.73c.51-.57.95-1.2 1.3-1.89l.93.42.41-.91-.94-.42a8.9 8.9 0 0 0 .57-2.69zM12 5c3.1 0 5.72 2.02 6.65 4.81l-4.05.71c-.52-.91-1.48-1.53-2.6-1.53-.37 0-.72.08-1.05.2L8.31 6.05a6.9 6.9 0 0 1 3.68-1.06Zm1 7c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m-4.31 6.17a6.99 6.99 0 0 1-1.9-10.83l2.64 3.14c-.26.45-.42.96-.42 1.51 0 .93.43 1.75 1.1 2.3L8.7 18.15ZM12 19c-.49 0-.97-.05-1.43-.15l1.4-3.85H12a2.99 2.99 0 0 0 2.95-2.5l4.04-.71c0 .07.01.14.01.22 0 3.86-3.14 7-7 7Z"></path></svg>,
            css: `flex gap-3 w-full items-center ${panel === 'settings' ? "text-red-700" : "text-red-300"}`,
            func: 'settings'
        }
    ];

    return (
        <>
            <ReceptionistNavbar panelNames={panelNames} panel={panel} setPanel={setPanel} />
            <div className='bg-gray-100 w-full text-black flex gap-8 h-fit md:min-h-dvh p-8'>
                <div className='bg-white md:w-[25%] p-8 rounded-2xl shadow-xl hidden md:flex md:flex-col'>
                    {panelNames.map((value, key) => (
                        <button key={key} className={value.css} onClick={() => setPanel(value.func)}>
                            {value.icon}
                            {value.name}
                        </button>
                    ))}
                </div>
                <div className={`${panel == 'settings' ? "bg-gray-100" : "bg-white shadow-xl"} w-full p-4 md:p-8 rounded-2xl`}>
                    {panel === "add" &&
                        <div>
                            <h1 className='mb-8 text-center md:text-left'>Add New Customer</h1>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='flex flex-col'>
                                    <span>Business Name</span>
                                    <input type="text" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                                </div>
                                <div className='flex flex-col'>
                                    <span>Business Registration</span>
                                    <input type="text" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                                </div>
                                <div className='flex flex-col'>
                                    <span>Email Address</span>
                                    <input type="email" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                                </div>
                                <div className='flex flex-col'>
                                    <span>Contact Number</span>
                                    <input type="text" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                                </div>
                                <div className='flex flex-col'>
                                    <span>Loan Amount</span>
                                    <input type="number" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                                </div>
                                <div className='flex flex-col'>
                                    <span>Business Address</span>
                                    <input type="text" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                                </div>
                                <div className='flex flex-col'>
                                    <span>Interest Rate</span>
                                    <input type="number" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                                </div>
                                <div className='flex flex-col'>
                                    <span>Number of Installments</span>
                                    <input type="number" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                                </div>
                            </div>
                            <div className='w-full flex justify-end gap-4 mt-5'>
                                <button className='border px-4 py-2 rounded-lg md:w-fit'>Clear</button>
                                <button className='bg-black text-white px-4 py-2 rounded-lg w-full md:w-fit'>Add Customer</button>
                            </div>
                        </div>
                    }

                    {panel === 'view' && <div>
                        <h1 className='mb-8 text-center md:text-left'>View Customer</h1>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <span>Business Name</span>
                                <input type="text" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                            </div>
                            <div className='flex flex-col'>
                                <span>Business Registration</span>
                                <input type="text" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                            </div>
                            <div className='flex flex-col'>
                                <span>Email Address</span>
                                <input type="email" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                            </div>
                            <div className='flex flex-col'>
                                <span>Contact Number</span>
                                <input type="text" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                            </div>
                            <div className='flex flex-col'>
                                <span>Loan Amount</span>
                                <input type="number" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                            </div>
                            <div className='flex flex-col'>
                                <span>Business Address</span>
                                <input type="text" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                            </div>
                            <div className='flex flex-col'>
                                <span>Interest Rate</span>
                                <input type="number" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                            </div>
                            <div className='flex flex-col'>
                                <span>Number of Installments</span>
                                <input type="number" className='border border-gray-400 rounded-lg px-3 py-1.5 w-full pr-10' />
                            </div>
                        </div>
                        <div className='w-full flex justify-end gap-4 mt-5'>
                            <button className='bg-black text-white px-4 py-2 rounded-lg w-full md:w-fit'>Update Customer</button>
                        </div>
                    </div>
                    }

                    {panel === 'home' && <div className="relative w-full h-fit">
                        <img
                            src={HomeImg}
                            alt=""
                            className="w-auto h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="absolute inset-0 flex flex-col gap-15 md:justify-center items-center md:items-start px-4 md:px-24 py-24">
                            <span className="text-white text-6xl md:text-9xl text-center md:text-left font-bold leading-20 md:leading-none">
                                Lanka <br /> Capital <br className='md:hidden' /> Pvt.Ltd
                            </span>
                            <span className='md:w-[50%] text-center md:text-left text-white'>
                                We provide fast, secure, and transparent financial solutions tailored to your needs. Your financial growth is our priority.
                            </span>
                        </div>
                    </div>
                    }

                    {panel === 'settings' &&
                        <div className='flex flex-col gap-4 md:gap-8'>
                            <h1 className=''>Settings</h1>

                            <div className='flex flex-col gap-4 shadow-2xl p-8 rounded-2xl bg-white'>
                                <div className='flex justify-between items-center'>
                                    <label>Personal Information</label>
                                    <button className='border px-4 py-4 bg-black text-white flex gap-2'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M5 21h14c1.1 0 2-.9 2-2v-7h-2v7H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2"></path><path d="M7 13v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l9-9a.996.996 0 0 0 0-1.41l-3-3a.996.996 0 0 0-1.41 0l-9.01 8.99A1 1 0 0 0 7 13m10-7.59L18.59 7 17.5 8.09 15.91 6.5zm-8 8 5.5-5.5 1.59 1.59-5.5 5.5H9z"></path></svg>
                                        Edit
                                    </button>
                                </div>
                                <hr />
                                <div className='flex flex-col md:grid md:grid-cols-3 gap-4'>
                                    <div className='flex flex-col gap-2'>
                                        <span className='text-gray-400'>First Name</span>
                                        <p>Natashia</p>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <span className='text-gray-400'>Last Name</span>
                                        <p>Ferdman</p>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <span className='text-gray-400'>Date of Birth</span>
                                        <p>Natashia</p>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <span className='text-gray-400'>Email address</span>
                                        <p>jhondoe@gmail.com</p>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <span className='text-gray-400'>Phone Number</span>
                                        <p>+94 12 123 4565</p>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <span className='text-gray-400'>User Role</span>
                                        <p>Receptionist</p>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col gap-4 shadow-2xl p-8 rounded-2xl bg-white'>
                                <div className='flex justify-between items-center'>
                                    <label>Address</label>
                                    <button className='flex border'>
                                        {editIcon}
                                        Edit
                                    </button>
                                </div>
                                <hr />
                                <div className='flex flex-col md:grid md:grid-cols-3 gap-4'>
                                    <div className='flex flex-col gap-2'>
                                        <span className='text-gray-400'>Street</span>
                                        <p>14/P, John St</p>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <span className='text-gray-400'>Town</span>
                                        <p>Kalutara</p>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <span className='text-gray-400'>Date of Birth</span>
                                        <p>15/05/2022</p>
                                    </div>                                    
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ReceptionistDashboard
