import React from 'react'
import { Link } from 'react-router-dom'
import ReceptionistNavbar from '../../component/Navbar/ReceptionistNavbar'

const ReceptionistDashboard = () => {
    return (
        <>
            {/* <ReceptionistNavbar /> */}
            <div className='bg-gray-400 text-black flex gap-8 h-fit'>
                <div className='bg-white flex flex-col w-1/6 '>
                    <span className='flex gap-3 items-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.4 0 .77-.24.92-.62.15-.37.07-.8-.22-1.09l-8.99-9a.996.996 0 0 0-1.41 0l-9.01 9c-.29.29-.37.72-.22 1.09s.52.62.92.62Zm9-8.59 6 6V20H6v-9.59z"></path></svg>
                        <Link>Home</Link>
                    </span>

                    <span className='flex gap-3 items-center'>
                        <svg  xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M22 11h-3V8h-2v3h-3v2h3v3h2v-3h3zM4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2 .82-2 2-2 2 .82 2 2M3 20h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1m4-5h2c1.65 0 3 1.35 3 3H4c0-1.65 1.35-3 3-3"></path></svg>
                        <Link>Add Customer</Link>
                    </span>

                    <span className='flex gap-3 items-center'>
                        <svg  xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2 .82-2 2-2 2 .82 2 2M3 20h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1m4-5h2c1.65 0 3 1.35 3 3H4c0-1.65 1.35-3 3-3m14-3.5c0-2-1.5-3.5-3.5-3.5S14 9.5 14 11.5s1.5 3.5 3.5 3.5c.62 0 1.18-.16 1.67-.42l2.12 2.12 1.41-1.41-2.12-2.12c.26-.49.42-1.05.42-1.67M17.5 13c-.88 0-1.5-.62-1.5-1.5s.62-1.5 1.5-1.5 1.5.62 1.5 1.5-.62 1.5-1.5 1.5"></path></svg>
                        <Link>View Customer</Link>
                    </span>

                    <span className='flex gap-3 items-center'>
                        <svg  xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>{/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}<path d="M22 12.5v-1h-1.03c-.04-.78-.18-1.54-.41-2.26l.95-.37-.36-.93-.95.37c-.38-.85-.89-1.62-1.5-2.3l.73-.73-.71-.71-.73.73c-.57-.51-1.2-.95-1.89-1.3l.42-.93-.91-.41-.42.94a8.9 8.9 0 0 0-2.69-.57V2h-1v1.03c-.78.04-1.54.18-2.26.41l-.37-.95-.93.36.37.95c-.85.38-1.62.89-2.3 1.5l-.73-.73-.71.71.73.73c-.51.57-.95 1.2-1.3 1.89l-.93-.42-.41.91.94.42a8.9 8.9 0 0 0-.57 2.69H2v1h1.03c.04.78.18 1.54.41 2.26l-.95.37.36.93.95-.37c.38.85.89 1.62 1.5 2.3l-.73.73.71.71.73-.73c.57.51 1.2.95 1.89 1.3l-.42.93.91.41.42-.94a8.9 8.9 0 0 0 2.69.57V22h1v-1.03c.78-.04 1.54-.18 2.26-.41l.37.95.93-.36-.37-.95c.85-.38 1.62-.89 2.3-1.5l.73.73.71-.71-.73-.73c.51-.57.95-1.2 1.3-1.89l.93.42.41-.91-.94-.42a8.9 8.9 0 0 0 .57-2.69zM12 5c3.1 0 5.72 2.02 6.65 4.81l-4.05.71c-.52-.91-1.48-1.53-2.6-1.53-.37 0-.72.08-1.05.2L8.31 6.05a6.9 6.9 0 0 1 3.68-1.06Zm1 7c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m-4.31 6.17a6.99 6.99 0 0 1-1.9-10.83l2.64 3.14c-.26.45-.42.96-.42 1.51 0 .93.43 1.75 1.1 2.3L8.7 18.15ZM12 19c-.49 0-.97-.05-1.43-.15l1.4-3.85H12a2.99 2.99 0 0 0 2.95-2.5l4.04-.71c0 .07.01.14.01.22 0 3.86-3.14 7-7 7Z"></path></svg>
                        <Link>Settings</Link>
                    </span>
                </div>
                <div className='bg-white w-5/6'>
                    <h1>Add New Customer</h1>
                    <div className='grid grid-cols-2 gap-4'>
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
                    <div className='w-full flex gap-4 mt-5'>
                        <button className='bg-black text-white w-1/2'>Add Customer</button>
                        <button className='border w-1/2'>Clear</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ReceptionistDashboard