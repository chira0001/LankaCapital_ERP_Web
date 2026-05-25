import React from "react";

const AdminProfile = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-6xl font-bold text-black">
          Admin Profile
        </h1>

        <p className="text-gray-500 mt-2 text-lg">
          Manage your personal information and security
        </p>
      </div>


      {/* Personal Information */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-4 md:p-8">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#071428]">
            Personal Information
          </h2>

          <button className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl">
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div>
            <p className="text-gray-400 text-sm mb-2">First Name</p>
            <h3 className="text-xl font-semibold">Piumika</h3>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">Last Name</p>
            <h3 className="text-xl font-semibold">Fernando</h3>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">Date of Birth</p>
            <h3 className="text-xl font-semibold">15 May 2000</h3>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">Email Address</p>
            <h3 className="text-xl font-semibold">
              directer@email.com
            </h3>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">Phone Number</p>
            <h3 className="text-xl font-semibold">
              +94 12 123 4565
            </h3>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">Role</p>
            <h3 className="text-xl font-semibold text-yellow-600">
              Director
            </h3>
          </div>

        </div>
      </div>


      {/* Address */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-8">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#071428]">
            Address
          </h2>

          <button className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100">
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <div>
            <p className="text-gray-400 text-sm mb-2">Street</p>
            <h3 className="text-xl font-semibold">
              14/P, Galle Road
            </h3>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">Town</p>
            <h3 className="text-xl font-semibold">Kalutara</h3>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">Postal Code</p>
            <h3 className="text-xl font-semibold">12000</h3>
          </div>

        </div>
      </div>


      {/* Security */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#071428]">
            Security
          </h2>

          <button className="bg-[#071428] hover:bg-[#0f1d35] text-white px-6 py-3 rounded-xl">
            Change Password
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          <div>
            <p className="text-gray-400 text-sm mb-2">Password</p>
            <h3 className="text-xl font-semibold">
              ••••••••••
            </h3>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">
              Last Updated
            </p>

            <h3 className="text-xl font-semibold">
              2 months ago
            </h3>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminProfile;