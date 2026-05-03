import React from 'react'

const ReceptionistHome = () => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Receptionist Dashboard</h1>
                    <p className="text-gray-500">Manage customers, loans, and salary operations</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setPanel('add')}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        + Add Customer
                    </button>
                    <button
                        onClick={() => setPanel('loan')}
                        className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Create Loan
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { title: "Total Customers", value: "1,240", color: "bg-blue-50" },
                    { title: "Active Loans", value: "860", color: "bg-green-50" },
                    { title: "Pending Requests", value: "12", color: "bg-yellow-50" },
                    { title: "Completed Today", value: "24", color: "bg-purple-50" }
                ].map((item, i) => (
                    <div key={i} className={`${item.color} shadow-md rounded-xl p-4`}>
                        <p className="text-gray-600 text-sm">{item.title}</p>
                        <h2 className="text-2xl font-bold mt-1">{item.value}</h2>
                    </div>
                ))}
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white shadow-md rounded-xl p-6">
                <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => setPanel('add')}
                        className="border rounded-lg p-4 hover:bg-gray-100 transition-colors text-sm font-medium flex flex-col items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M22 11h-3V8h-2v3h-3v2h3v3h2v-3h3z"></path><path d="M4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2 .82-2 2-2 2 .82 2 2"></path></svg>
                        Register Customer
                    </button>

                    <button
                        onClick={() => setPanel('loan')}
                        className="border rounded-lg p-4 hover:bg-gray-100 transition-colors text-sm font-medium flex flex-col items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28"></path></svg>
                        Create Loan
                    </button>

                    <button
                        onClick={() => setPanel('salary')}
                        className="border rounded-lg p-4 hover:bg-gray-100 transition-colors text-sm font-medium flex flex-col items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"></path></svg>
                        Add Salary
                    </button>

                    <button
                        onClick={() => setPanel('view')}
                        className="border rounded-lg p-4 hover:bg-gray-100 transition-colors text-sm font-medium flex flex-col items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M21 11.5c0-2-1.5-3.5-3.5-3.5S14 9.5 14 11.5s1.5 3.5 3.5 3.5"></path></svg>
                        Search Customer
                    </button>
                </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col gap-4">
                <h2 className="font-semibold text-lg">Recent Customers</h2>

                {[
                    { name: "ABC Trading Ltd", date: "Registered today", status: "Active" },
                    { name: "XYZ Enterprises", date: "Registered yesterday", status: "Pending" },
                    { name: "Global Solutions", date: "2 days ago", status: "Active" }
                ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-400">{item.date}</p>
                        </div>

                        <div className="flex gap-2 items-center">
                            <span className={`text-xs px-3 py-1 rounded-full ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {item.status}
                            </span>
                            <button
                                onClick={() => setPanel('view')}
                                className="text-sm border px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                            >
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ReceptionistHome