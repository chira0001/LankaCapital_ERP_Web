import axiosAPI from '../../api/axiosAPI'
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReceptionistSetting = () => {

    const empId = localStorage.getItem("empId") || 3;

    const [viewPasswordForm, setViewPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [profileForm, setProfileForm] = useState({
        address: "",
        basicSalary: "",
        email: "",
        firstName: "",
        id: "",
        lastName: "",
        nic: "",
        phoneNumber: "",
        role: null
    });

    const toSentenceCase = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const fetchProfileInfo = async () => {
        try {
            const response = await axiosAPI.get(`/employees/${empId}`);
            if (response.status === 200) {
                setProfileForm(response.data);
            }
            else {
                toast.error("Failed to load Profile Information")
            }

        } catch (e) {
            console.log(e);
            toast.error("Failed to load Profile Information")
        }
    }

    const updatePassword = async () => {
        // Add validation
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error("All password fields are required");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const response = await axiosAPI.put(`/employees/password/${empId}`, passwordForm);
            if (response.status === 200) {
                toast.success("Password changed successfully");
                // Clear form and hide it
                setPasswordForm({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setViewPasswordForm(false);
            } else {
                toast.error("Something went wrong");
            }
        } catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message || "Failed to update password");
        }
    }

    const updateProfileInfo = async () => {
        try {
            const payload = {
                address: profileForm.address,
                basicSalary: profileForm.basicSalary,
                email: profileForm.email,
                firstName: profileForm.firstName,
                id: profileForm.id,
                lastName: profileForm.lastName,
                nic: profileForm.nic,
                phoneNumber: profileForm.phoneNumber,
                role: profileForm.role
            };

            const response = await axiosAPI.put(`/employees/${empId}`, payload)
            if (response.status === 200) {
                toast.success("Profile updated successfully");
                fetchProfileInfo(); // Refresh the data
            } else {
                toast.error("Something went wrong");
            }
        } catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message || "Failed to update profile");
        }
    }

    const handlePasswordButtonClick = () => {
        if (viewPasswordForm) {
            // If form is visible, submit the password change
            updatePassword();
        } else {
            // If form is hidden, show it
            setViewPasswordForm(true);
        }
    }

    useEffect(() => {
        fetchProfileInfo();
    }, [])

    return (
        <div className="flex flex-col gap-8">
            <ToastContainer position="top-right" autoClose={3000} />

            <h1 className="text-2xl font-semibold">Settings</h1>

            {/* PERSONAL INFORMATION */}
            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Personal Information</h2>
                    <button
                        onClick={updateProfileInfo}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm mb-1">First Name</span>
                        <input
                            type="text"
                            name="firstName"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value })}
                            className="font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm mb-1">Last Name</span>
                        <input
                            type="text"
                            name="lastName"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value })}
                            className="font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm mb-1">NIC</span>
                        <input
                            type="text"
                            name="nic"
                            value={profileForm.nic}
                            onChange={(e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value })}
                            className="font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            disabled
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm mb-1">Email Address</span>
                        <input
                            type="email"
                            name="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value })}
                            className="font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm mb-1">Phone Number</span>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={profileForm.phoneNumber}
                            onChange={(e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value })}
                            className="font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm mb-1">User Role</span>
                        <p className="font-medium px-3 py-2">{profileForm.role?.roleName === "fo" ? "Field Officer" : toSentenceCase(profileForm.role?.roleName)}</p>
                    </div>
                </div>
            </div>

            {/* ADDRESS */}
            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Address</h2>
                </div>

                <div className="grid md:grid-cols-1 gap-6">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm mb-1">Full Address</span>
                        <textarea
                            name="address"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value })}
                            rows="3"
                            className="font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* SECURITY */}
            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Security</h2>
                </div>

                {viewPasswordForm &&
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm mb-1">Old Password</span>
                            <input
                                type="password"
                                name="oldPassword"
                                value={passwordForm.oldPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                placeholder="Enter old password"
                                className="font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm mb-1">New Password</span>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Enter new password"
                                className="font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm mb-1">Confirm Password</span>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                                className="font-medium px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>
                }

                <div className="flex justify-end gap-3">
                    {viewPasswordForm && (
                        <button
                            onClick={() => {
                                setViewPasswordForm(false);
                                setPasswordForm({
                                    oldPassword: "",
                                    newPassword: "",
                                    confirmPassword: ""
                                });
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handlePasswordButtonClick}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                    >
                        {viewPasswordForm ? "Update Password" : "Change Password"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReceptionistSetting