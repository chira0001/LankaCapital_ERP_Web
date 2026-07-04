import axiosAPI from '../../api/axiosAPI'
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReceptionistSetting = () => {

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
            const response = await axiosAPI.get("/recep/employees/profile");
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
            const response = await axiosAPI.put("/recep/employees/profile/password", passwordForm);
            if (response.status === 200) {
                toast.success("Password changed successfully");
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

            const response = await axiosAPI.put("/recep/employees/profile", payload)
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
        <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col gap-8">
            <ToastContainer position="top-right" autoClose={3000} />

            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Settings
                </h1>
                <p className="text-gray-600">
                    Manage your personal information and security preferences
                </p>
            </div>

            {/* PERSONAL INFORMATION */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Personal Information
                    </h2>
                    <button
                        onClick={updateProfileInfo}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 
                               text-white rounded-lg text-sm font-medium
                               hover:from-blue-700 hover:to-blue-800
                               transition-all shadow-md hover:shadow-lg"
                    >
                        Save Changes
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { label: "First Name", name: "firstName" },
                        { label: "Last Name", name: "lastName" },
                        { label: "NIC", name: "nic", disabled: true },
                        { label: "Email Address", name: "email", type: "email" },
                        { label: "Phone Number", name: "phoneNumber" }
                    ].map((field) => (
                        <div key={field.name} className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700 mb-2">
                                {field.label}
                            </span>
                            <input
                                type={field.type || "text"}
                                name={field.name}
                                value={profileForm[field.name]}
                                onChange={(e) =>
                                    setProfileForm({
                                        ...profileForm,
                                        [e.target.name]: e.target.value
                                    })
                                }
                                disabled={field.disabled}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                focus:border-transparent transition-all
                                ${field.disabled
                                        ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                                        : "bg-white"
                                    }`}
                            />
                        </div>
                    ))}

                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 mb-2">
                            User Role
                        </span>
                        <p className="px-4 py-3 font-medium text-gray-800 bg-gray-50 rounded-lg border border-gray-200">
                            {profileForm.role?.roleName === "fo"
                                ? "Field Officer"
                                : toSentenceCase(profileForm.role?.roleName)}
                        </p>
                    </div>
                </div>
            </div>

            {/* ADDRESS */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    Address
                </h2>

                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 mb-2">
                        Full Address
                    </span>
                    <textarea
                        name="address"
                        value={profileForm.address}
                        onChange={(e) =>
                            setProfileForm({
                                ...profileForm,
                                [e.target.name]: e.target.value
                            })
                        }
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               focus:border-transparent resize-none transition-all"
                    />
                </div>
            </div>

            {/* SECURITY */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    Security
                </h2>

                {viewPasswordForm && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { label: "Old Password", name: "oldPassword" },
                            { label: "New Password", name: "newPassword" },
                            { label: "Confirm Password", name: "confirmPassword" }
                        ].map((field) => (
                            <div key={field.name} className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700 mb-2">
                                    {field.label}
                                </span>
                                <input
                                    type="password"
                                    name={field.name}
                                    value={passwordForm[field.name]}
                                    onChange={(e) =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            [field.name]: e.target.value
                                        })
                                    }
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg
                                           focus:outline-none focus:ring-2 focus:ring-blue-500
                                           focus:border-transparent transition-all"
                                />
                            </div>
                        ))}
                    </div>
                )}

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
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg
                                   text-sm font-medium hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        onClick={handlePasswordButtonClick}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700
                               text-white rounded-lg text-sm font-medium
                               hover:from-blue-700 hover:to-blue-800
                               transition-all shadow-md hover:shadow-lg"
                    >
                        {viewPasswordForm ? "Update Password" : "Change Password"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReceptionistSetting