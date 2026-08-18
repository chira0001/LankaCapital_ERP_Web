import React, { useState } from 'react'
import CommonNavbar from '../../component/Navbar/CommonNavbar'
import CompanyLogo from '../../component/ComapnyLogo/CompanyLogo'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../../component/Footer/Footer'
import axiosAPI from '../../api/axiosAPI'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginFunc } from "../../api/authService";

const Login = () => {
    const navigate = useNavigate();

    const eyeOpen = <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6"></path><path d="M12 19c7.63 0 9.93-6.62 9.95-6.68.07-.21.07-.43 0-.63-.02-.07-2.32-6.68-9.95-6.68s-9.93 6.61-9.95 6.67c-.07.21-.07.43 0 .63.02.07 2.32 6.68 9.95 6.68Zm0-12c5.35 0 7.42 3.85 7.93 5-.5 1.16-2.58 5-7.93 5s-7.42-3.84-7.93-5c.5-1.16 2.58-5 7.93-5"></path></svg>;
    const eyeClose = <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M12 17c-5.35 0-7.42-3.84-7.93-5 .2-.46.65-1.34 1.45-2.23l-1.4-1.4c-1.49 1.65-2.06 3.28-2.08 3.31-.07.21-.07.43 0 .63.02.07 2.32 6.68 9.95 6.68.91 0 1.73-.1 2.49-.26l-1.77-1.77c-.24.02-.47.03-.72.03Zm9.95-4.68c.07-.21.07-.43 0-.63-.02-.07-2.32-6.68-9.95-6.68-1.84 0-3.36.39-4.61.97L2.71 1.29 1.3 2.7l4.32 4.32 1.42 1.42 2.27 2.27 3.98 3.98 1.8 1.8 1.53 1.53 4.68 4.68 1.41-1.41-4.32-4.32c2.61-1.95 3.55-4.61 3.56-4.65m-7.25.97c.19-.39.3-.83.3-1.29 0-1.64-1.36-3-3-3-.46 0-.89.11-1.29.3l-1.8-1.8c.88-.31 1.9-.5 3.08-.5 5.35 0 7.42 3.85 7.93 5-.3.69-1.18 2.33-2.96 3.55z"></path></svg>;

    const [isClicked, setIsClicked] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({
        email: false,
        password: false
    });

    const navigateHome = () => {
        navigate('/');
    }

    const login = async (/*e*/) => {
        ////////////////////////
        // console.log("LOGIN BUTTON CLICKED");
        //  e.preventDefault();
        const newErrors = {
            email: !email || email.trim() === "",
            password: !password || password.trim() === ""
        };
        setErrors(newErrors);
        if (!newErrors.email && !newErrors.password) {
            try {
                const response = await loginFunc({
                    email,
                    password
                });

                //  console.log("LOGIN RESPONSE =", response.data);
                // if (response.status == 200) {
                //     toast.success("Loggin Successfull. Redirecting...")
                //     localStorage.setItem("token", response.data.token);
                //     const role = response.data.role.slice(0, 2).toLowerCase()
                //     navigate(`/${role}`)
                // } 

                if (response.status == 200) {

                    toast.success("Loggin Successfull. Redirecting...");

                    localStorage.setItem("token", response.data.token);

                    const payload = JSON.parse(atob(response.data.token.split('.')[1]));
                    localStorage.setItem("username", payload.sub);
                    localStorage.setItem("role", payload.role.slice(0, 5).toLowerCase());
                    const role = response.data.role.slice(0, 2).toLowerCase();

                    navigate(`/${role}`);
                }

                else {
                    console.log(response);
                }
            } catch (e) {
                console.log(e);
                toast.error(e.response?.data?.message || "Failed to Login");
            }
        }
    }


    return (
        <>
            <CommonNavbar />
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="mt-15 min-h-screen bg-gray-50 flex flex-col justify-between">

                {/* CENTER AREA */}
                <div className="flex flex-1 items-center justify-center px-4 py-16">

                    <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

                        {/* LEFT SIDE - Branding */}
                        <div className="hidden md:flex flex-col justify-center items-center bg-gray-100 text-white p-12 gap-5">
                            <CompanyLogo className="max-w-[250px] max-h-[250px]" />
                            <h2 className="text-black text-4xl font-bold">Welcome Back</h2>
                            <p className="text-black text-center mt-4">
                                Login to access your employee dashboard and manage your account securely.
                            </p>
                        </div>

                        {/* RIGHT SIDE - LOGIN FORM */}
                        <div className="p-8 md:p-12 relative">

                            {/* Back Button */}
                            <button
                                onClick={navigateHome}
                                className="absolute top-6 left-6 text-gray-400 hover:text-black transition"
                            >
                                ←
                            </button>

                            <div className="flex flex-col items-center mb-10">
                                <h3 className="font-bold text-3xl mt-6">Login</h3>
                                <p className="text-gray-500 text-sm mt-2">
                                    Please enter your credentials
                                </p>
                            </div>

                            <div className="space-y-6">

                                {/* Email */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="example@email.com"
                                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black transition
                                            ${errors.email ? "border-red-600 ring-red-200" : "border-gray-300"}`}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={isClicked ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className={`w-full border rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-black transition
                                            ${errors.password ? "border-red-600 ring-red-200" : "border-gray-300"}`}
                                        />
                                        <span
                                            className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-black transition"
                                            onClick={() => setIsClicked(prev => !prev)}
                                        >
                                            {isClicked ? eyeOpen : eyeClose}
                                        </span>
                                    </div>
                                </div>

                                {/* Login Button */}
                                <button
                                    onClick={login}
                                    onKeyDown={(e) => e.key === 'Enter' && login()}
                                    className="w-full bg-black text-white py-3 rounded-lg font-semibold tracking-wide hover:bg-gray-800 transition duration-300"
                                >
                                    Login
                                </button>

                                {/* Signup Link */}
                                <p className="text-center text-sm text-gray-500 pt-4">
                                    Don’t have an account?{" "}
                                    <Link
                                        to="/signup"
                                        className="text-black font-semibold underline hover:text-gray-700"
                                    >
                                        Sign up
                                    </Link>
                                </p>

                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    )
}

export default Login