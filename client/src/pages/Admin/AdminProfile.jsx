import React, { useEffect, useState } from "react";
import axiosAPI from "../../api/axiosAPI";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminProfile = () => {
  const [isPasswordEdit, setIsPasswordEdit] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const toSentenceCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const fetchProfileInfo = async () => {
    try {
      const response = await axiosAPI.get("/admin/employees/profile");
      if (response.status === 200) {
        setProfileForm(response.data);
      } else {
        toast.error("Failed to load profile information");
      }
    } catch {
      toast.error("Failed to load profile information");
    }
  };

  const updateProfileInfo = async () => {
    try {
      setIsUpdating(true);
      const response = await axiosAPI.put(
        "/admin/employees/profile",
        profileForm
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully");
        setIsEdit(false);
        fetchProfileInfo();
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePassword = async () => {
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsPasswordUpdating(true);

      const response = await axiosAPI.put(
        "/admin/employees/profile/password",
        passwordForm
      );

      if (response.status === 200) {
        toast.success("Password changed successfully");
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setIsPasswordEdit(false);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update password"
      );
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  return (
    <div className="min-h-full bg-slate-100 p-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
          Admin Profile
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Manage your personal information and security settings
        </p>
      </div>

      <div className="flex flex-col gap-10">

        {/* PERSONAL INFO */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Personal Information
            </h2>

            {isEdit ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEdit(false)}
                  disabled={isUpdating}
                  className="px-5 py-2.5 text-sm font-medium border border-slate-300 
                  text-slate-700 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={updateProfileInfo}
                  disabled={isUpdating}
                  className="px-6 py-2.5 text-sm font-medium bg-indigo-600 
                  hover:bg-indigo-700 text-white rounded-lg shadow-sm 
                  transition disabled:opacity-70"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="px-6 py-2.5 text-sm font-medium bg-indigo-600 
                hover:bg-indigo-700 text-white rounded-lg shadow-sm transition"
              >
                Edit
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "First Name", name: "firstName" },
              { label: "Last Name", name: "lastName" },
              { label: "NIC", name: "nic", disabled: true },
              { label: "Email Address", name: "email", type: "email" },
              { label: "Phone Number", name: "phoneNumber" }
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600">
                  {field.label}
                </label>

                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={profileForm[field.name] || ""}
                  disabled={!isEdit || field.disabled}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      [field.name]: e.target.value
                    })
                  }
                  className="px-4 py-2.5 text-sm border border-slate-300 rounded-lg
                  bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500
                  focus:border-indigo-500 transition disabled:bg-slate-100
                  disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600">
                User Role
              </label>
              <div className="px-4 py-2.5 text-sm font-medium 
              bg-slate-100 border border-slate-200 rounded-lg text-slate-800">
                {profileForm.role === "fo"
                  ? "Field Officer"
                  : toSentenceCase(profileForm.role)}
              </div>
            </div>
          </div>
        </div>

        {/* ADDRESS */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            Address
          </h2>

          <textarea
            name="address"
            rows="3"
            value={profileForm.address || ""}
            onChange={(e) =>
              setProfileForm({
                ...profileForm,
                address: e.target.value
              })
            }
            disabled={!isEdit}
            className="w-full px-4 py-3 text-sm border border-slate-300 
            rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:border-indigo-500 transition resize-none
            disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        {/* SECURITY */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col gap-8">
          <h2 className="text-lg font-semibold text-slate-800">
            Security
          </h2>

          {isPasswordEdit && (
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { label: "Old Password", name: "oldPassword" },
                { label: "New Password", name: "newPassword" },
                { label: "Confirm Password", name: "confirmPassword" }
              ].map((field) => (
                <div key={field.name} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">
                    {field.label}
                  </label>
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
                    disabled={isPasswordUpdating}
                    className="px-4 py-2.5 text-sm border border-slate-300 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                    focus:border-indigo-500 transition disabled:bg-slate-100"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3">
            {isPasswordEdit ? (
              <>
                <button
                  onClick={() => {
                    setIsPasswordEdit(false);
                    setPasswordForm({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                  }}
                  disabled={isPasswordUpdating}
                  className="px-5 py-2.5 text-sm font-medium border border-slate-300 
                  text-slate-700 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={updatePassword}
                  disabled={isPasswordUpdating}
                  className="px-6 py-2.5 text-sm font-medium bg-indigo-600 
                  hover:bg-indigo-700 text-white rounded-lg shadow-sm 
                  transition disabled:opacity-70"
                >
                  {isPasswordUpdating ? "Updating..." : "Update Password"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsPasswordEdit(true)}
                className="px-6 py-2.5 text-sm font-medium bg-indigo-600 
                hover:bg-indigo-700 text-white rounded-lg shadow-sm transition"
              >
                Change Password
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminProfile;