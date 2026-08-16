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
    const [nicNo, setNICNo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({
        fname: false,
        lname: false,
        email: false,
        phoneNumber: false,
        nicNo: false,
        password: false,
        confirmPassword: false
    });

    const navigateHome = () => {
        navigate('/');
    }

    const validateNIC = (nic) => {
        if (!nic || nic.trim() === "") return false;

        nic = nic.trim();

        const oldNICPattern = /^[0-9]{9}[vVxX]$/;
        const newNICPattern = /^[0-9]{12}$/;

        if (oldNICPattern.test(nic)) {
            const day = parseInt(nic.substring(2, 5));

            return (day >= 1 && day <= 366) || (day >= 501 && day <= 866);
        }

        if (newNICPattern.test(nic)) {
            const year = parseInt(nic.substring(0, 4));
            const day = parseInt(nic.substring(4, 7));

            if (year < 1900 || year > new Date().getFullYear()) {
                return false;
            }

            return (day >= 1 && day <= 366) || (day >= 501 && day <= 866);
        }

        return false;
    };

    const signup = async (e) => {
        e.preventDefault();
        const newErrors = {
            fname: !fname || fname.trim() === "",
            lname: !lname || lname.trim() === "",
            email: !email || email.trim() === "",
            phoneNumber: !phoneNumber || phoneNumber.trim() === "",
            nicNo: !validateNIC(nicNo),
            password: !password || password.trim() === "" || password != confirmPassword,
            confirmPassword: !confirmPassword || confirmPassword.trim() === "" || confirmPassword != password
        };
        setErrors(newErrors);
        // if (!newErrors.email && !newErrors.password) {
        const hasErrors = Object.values(newErrors).some(error => error);

        if (!hasErrors) {
            const payload = {
                nic: nicNo,
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
        }
    }

    return (
        <>
            <CommonNavbar />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
                <div className="flex justify-center px-4 py-16">
                    <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-3">

                        {/* LEFT SIDE - Branding */}
                        <div className="hidden md:flex flex-col justify-center items-center bg-gray-100 text-white p-12">
                            <CompanyLogo className='max-w-[250px] max-h-[250px]'/>
                            <h2 className="text-black text-4xl font-bold">Create Account</h2>
                            <p className="text-black text-center mt-4">
                                Join with us and manage your employee account easily and securely.
                            </p>
                        </div>

                        {/* RIGHT SIDE - FORM */}
                        <div className="p-6 sm:p-8 md:p-12 md:col-span-2">

                            <div className="flex flex-col items-center mb-8">
                                {/* <CompanyLogo /> */}
                                <h3 className="font-bold text-3xl mt-4">Sign Up</h3>
                                <p className="text-gray-500 text-sm mt-2">
                                    Please fill in the details below
                                </p>
                            </div>

                            <form onSubmit={signup} className="space-y-6">

                                {/* GRID FIELDS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* NIC */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">
                                            Employee NIC Number
                                        </label>
                                        <input
                                            type="text"
                                            value={nicNo}
                                            onChange={(e) => setNICNo(e.target.value)}
                                            placeholder="199110400275 or 911042754V"
                                            className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black transition
                                            ${errors.nicNo ? "border-red-600 ring-red-200" : "border-gray-300"}`}
                                        />
                                        {errors.nicNo && (
                                            <p className="text-red-600 text-xs">
                                                Enter a valid NIC number
                                            </p>
                                        )}
                                    </div>

                                    {/* First Name */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">First Name</label>
                                        <input
                                            type="text"
                                            value={fname}
                                            onChange={(e) => setFname(e.target.value)}
                                            placeholder="John"
                                            className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black transition
                                            ${errors.fname ? "border-red-600 ring-red-200" : "border-gray-300"}`}
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Last Name</label>
                                        <input
                                            type="text"
                                            value={lname}
                                            onChange={(e) => setLname(e.target.value)}
                                            placeholder="Doe"
                                            className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black transition
                                            ${errors.lname ? "border-red-600 ring-red-200" : "border-gray-300"}`}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="example@email.com"
                                            className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black transition
                                            ${errors.email ? "border-red-600 ring-red-200" : "border-gray-300"}`}
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-sm font-medium">Phone Number</label>
                                        <input
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="07XXXXXXXX"
                                            className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black transition
                                            ${errors.phoneNumber ? "border-red-600 ring-red-200" : "border-gray-300"}`}
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Password</label>
                                        <div className="relative">
                                            <input
                                                type={isPasswordClicked ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition
                                                ${errors.password ? "border-red-600 ring-red-200" : "border-gray-300"}`}
                                            />
                                            <span
                                                className="absolute right-3 top-2 cursor-pointer text-gray-600"
                                                onClick={() => setIsPasswordClicked(prev => !prev)}
                                            >
                                                {isPasswordClicked ? eyeClose : eyeOpen}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={isPasswordConfirmClicked ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black transition
                                                ${errors.confirmPassword ? "border-red-600 ring-red-200" : "border-gray-300"}`}
                                            />
                                            <span
                                                className="absolute right-3 top-2 cursor-pointer text-gray-600"
                                                onClick={() => setIsPasswordConfirmClicked(prev => !prev)}
                                            >
                                                {isPasswordConfirmClicked ? eyeClose : eyeOpen}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <button
                                    type="submit"
                                    className="w-full bg-black text-white py-3 rounded-lg font-semibold tracking-wide hover:bg-gray-800 transition duration-300"
                                >
                                    Create Account
                                </button>
                            </form>

                            <p className="text-center text-sm text-gray-500 mt-6">
                                Already have an account?{" "}
                                <Link to="/login" className="text-black font-semibold underline">
                                    Login
                                </Link>
                            </p>

                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    )
}

export default Signup