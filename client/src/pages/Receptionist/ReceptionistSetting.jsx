import React from 'react'

const ReceptionistSetting = () => {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-2xl font-semibold">Settings</h1>

            {/* PERSONAL INFORMATION */}
            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Personal Information</h2>
                    <button className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
                        Edit
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <span className="text-gray-400 text-sm">First Name</span>
                        <p className="font-medium">Natashia</p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">Last Name</span>
                        <p className="font-medium">Ferdman</p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">Date of Birth</span>
                        <p className="font-medium">15 May 1998</p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">Email Address</span>
                        <p className="font-medium">jhondoe@gmail.com</p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">Phone Number</span>
                        <p className="font-medium">+94 12 123 4565</p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">User Role</span>
                        <p className="font-medium">Receptionist</p>
                    </div>
                </div>
            </div>

            {/* ADDRESS */}
            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Address</h2>
                    <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 transition-colors">
                        Edit
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <span className="text-gray-400 text-sm">Street</span>
                        <p className="font-medium">14/P, John St</p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">Town</span>
                        <p className="font-medium">Kalutara</p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">Postal Code</span>
                        <p className="font-medium">12000</p>
                    </div>
                </div>
            </div>

            {/* SECURITY */}
            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Security</h2>
                    <button className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
                        Change Password
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <span className="text-gray-400 text-sm">Password</span>
                        <p className="font-medium">••••••••••</p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">Last Updated</span>
                        <p className="font-medium">2 months ago</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReceptionistSetting