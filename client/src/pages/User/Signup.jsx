import React, { useState } from 'react'
import CommonNavbar from '../../component/Navbar/CommonNavbar'
import CompanyLogo from '../../component/ComapnyLogo/CompanyLogo'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../../component/Footer/Footer'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'

const Signup = () => {
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const navigate = useNavigate();

    const eyeOpen = <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6"></path><path d="M12 19c7.63 0 9.93-6.62 9.95-6.68.07-.21.07-.43 0-.63-.02-.07-2.32-6.68-9.95-6.68s-9.93 6.61-9.95 6.67c-.07.21-.07.43 0 .63.02.07 2.32 6.68 9.95 6.68Zm0-12c5.35 0 7.42 3.85 7.93 5-.5 1.16-2.58 5-7.93 5s-7.42-3.84-7.93-5c.5-1.16 2.58-5 7.93-5"></path></svg>;
    const eyeClose = <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M12 17c-5.35 0-7.42-3.84-7.93-5 .2-.46.65-1.34 1.45-2.23l-1.4-1.4c-1.49 1.65-2.06 3.28-2.08 3.31-.07.21-.07.43 0 .63.02.07 2.32 6.68 9.95 6.68.91 0 1.73-.1 2.49-.26l-1.77-1.77c-.24.02-.47.03-.72.03Zm9.95-4.68c.07-.21.07-.43 0-.63-.02-.07-2.32-6.68-9.95-6.68-1.84 0-3.36.39-4.61.97L2.71 1.29 1.3 2.7l4.32 4.32 1.42 1.42 2.27 2.27 3.98 3.98 1.8 1.8 1.53 1.53 4.68 4.68 1.41-1.41-4.32-4.32c2.61-1.95 3.55-4.61 3.56-4.65m-7.25.97c.19-.39.3-.83.3-1.29 0-1.64-1.36-3-3-3-.46 0-.89.11-1.29.3l-1.8-1.8c.88-.31 1.9-.5 3.08-.5 5.35 0 7.42 3.85 7.93 5-.3.69-1.18 2.33-2.96 3.55z"></path></svg>;

    const [isPasswordClicked, setIsPasswordClicked] = useState(false);
    const [isPasswordConfirmClicked, setIsPasswordConfirmClicked] = useState(false);
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [empNo, setEmpNo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({
        fname: false,
        lname: false,
        email: false,
        phoneNumber: false,
        empNo: false,
        password: false,
        confirmPassword: false
    });

    const navigateHome = () => {
        navigate('/');
    }

    const signup = async (e) => {
        e.preventDefault();
        const newErrors = {
            fname: !fname || fname.trim() === "",
            lname: !lname || lname.trim() === "",
            email: !email || email.trim() === "",
            phoneNumber: !phoneNumber || phoneNumber.trim() === "",
            empNo: !empNo || empNo.trim() === "",
            password: !password || password.trim() === "" || password != confirmPassword,
            confirmPassword: !confirmPassword || confirmPassword.trim() === "" || confirmPassword != password
        };
        setErrors(newErrors);
        if (!newErrors.email && !newErrors.password) {
            const payload = {
                id: empNo,
                firstName: fname,
                lastName: lname,
                email: email,
                phoneNumber: phoneNumber,
                password: password
            };
            try {
                const response = await axios.post(`${BASE_URL}/auth/register`, payload);
                if (response.status == 201) {
                    toast.success("Registered successfully. Please Login");
                    navigate('/login')
                } else {
                    toast.error("Something went wrong, Try again");
                }
            } catch (e) {
                console.log(e);
                toast.error(e.response?.data?.message || "Failed to register");
            }
            // console.log('Signing with:', payload);
        }
    }

    return (
        <>
            <CommonNavbar />
            <ToastContainer position="top-right" autoClose={3000} />
            <div className='bg-gray-50 text-black flex flex-col items-center justify-center h-fit gap-8 pt-20 px-3 py-8'>
                <div className='bg-white flex flex-col items-center md:w-1/3 shadow-xl px-10 py-10 rounded-2xl gap-6 relative mt-10'>
                    <svg className='absolute left-8 cursor-pointer' onClick={navigateHome} xmlns="http://www.w3.org/2000/svg" width="30" height="30"
                        fill="grey" viewBox="0 0 24 24" >
                        <path d="M4 4h2v16H4zm10 3-6 5 6 5v-4h7v-2h-7z"></path>
                    </svg>

                    <div className='flex flex-col items-center mb-4'>
                        <CompanyLogo />
                        <h3 className='font-bold text-3xl md:text-5xl'>Sign Up</h3>
                    </div>

                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor="email">Employee Number :</label>
                        <div className='relative w-full'>
                            <input
                                type="text"
                                name="empNo"
                                id="empNo"
                                value={empNo}
                                onChange={(e) => setEmpNo(e.target.value)}
                                placeholder={errors.empNo ? "Please enter employee number" : "Your employee number"}
                                className={`border rounded-lg px-3 py-1.5 pr-10 w-full
                                    ${errors.empNo ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                            />
                            {errors.empNo && (
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

                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor="email">First Name :</label>
                        <div className='relative w-full'>
                            <input
                                type="text"
                                name="fname"
                                id="fname"
                                value={fname}
                                onChange={(e) => setFname(e.target.value)}
                                placeholder={errors.fname ? "Please enter First name" : "Your first name"}
                                className={`border rounded-lg px-3 py-1.5 pr-10 w-full
                                    ${errors.fname ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                            />
                            {errors.fname && (
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

                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor="email">Last name :</label>
                        <div className='relative w-full'>
                            <input
                                type="text"
                                name="lname"
                                id="lname"
                                value={lname}
                                onChange={(e) => setLname(e.target.value)}
                                placeholder={errors.lname ? "Please enter last name" : "Your last name"}
                                className={`border rounded-lg px-3 py-1.5 pr-10 w-full
                                    ${errors.lname ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                            />
                            {errors.lname && (
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

                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor="email">Email address :</label>
                        <div className='relative w-full'>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={errors.email ? "Please enter email" : "Your email"}
                                className={`border rounded-lg px-3 py-1.5 pr-10 w-full
                                    ${errors.email ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                            />
                            {errors.email && (
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

                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor="email">Phone Number :</label>
                        <div className='relative w-full'>
                            <input
                                type="text"
                                name="phoneNumber"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder={errors.phoneNumber ? "Please phone number" : "Your phone number"}
                                className={`border rounded-lg px-3 py-1.5 pr-10 w-full
                                    ${errors.phoneNumber ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                            />
                            {errors.phoneNumber && (
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

                    <div className="w-full flex flex-col gap-2">
                        <div className="flex justify-between">
                            <label htmlFor="password">Password :</label>
                            <span
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => setIsPasswordClicked(prev => !prev)}
                            >
                                {isPasswordClicked ? (<>Hide {eyeClose}</>) : (<>Show {eyeOpen}</>)}
                            </span>
                        </div>
                        <div className='relative w-full'>
                            <input
                                name='password'
                                id="password"
                                type={isPasswordClicked ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`border rounded-lg px-3 py-1.5 pr-10 w-full
                                    ${errors.password ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                                placeholder={errors.password ? "Please enter password" : "xxxxx"}
                            />
                            {errors.password && (
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

                    <div className="w-full flex flex-col gap-2">
                        <div className="flex justify-between">
                            <label htmlFor="password">Confirm Password :</label>
                            <span
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => setIsPasswordConfirmClicked(prev => !prev)}
                            >
                                {isPasswordConfirmClicked ? (<>Hide {eyeClose}</>) : (<>Show {eyeOpen}</>)}
                            </span>
                        </div>
                        <div className='relative w-full'>
                            <input
                                name='confirmPassword'
                                id="confirmPassword"
                                type={isPasswordConfirmClicked ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`border rounded-lg px-3 py-1.5 pr-10 w-full
                                    ${errors.confirmPassword ? "border-red-600 border-2 placeholder-red-600" : ""}`}
                                placeholder={errors.confirmPassword ? "Please enter password" : "xxxxx"}
                            />
                            {errors.confirmPassword && (
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
                    <button className='border w-full px-4 py-4 bg-black text-white' onClick={signup}>Sign Up</button>
                </div>

                <div className='flex bg-white flex-col items-center justify-center md:w-1/3 shadow-2xl p-10 rounded-2xl gap-6 mb-10'>
                    <span>Have an account? <Link to="/login" className='underline cursor-pointer'>Login</Link></span>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Signup