import React from "react";
//import { DateCalendar } from '@mui/material';

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

const ReceptionistHome = () => {
    /* ================= SAMPLE DATA ================= */

    const stats = [
        {
            title: "Total Customers",
            value: "1,240",
            growth: "+8 this week",
            bg: "bg-blue-50",
        },
        {
            title: "Active Loans",
            value: "860",
            growth: "+12 this month",
            bg: "bg-green-50",
        },
        {
            title: "Pending Requests",
            value: "12",
            growth: "4 need review",
            bg: "bg-yellow-50",
        },
        {
            title: "Completed Today",
            value: "24",
            growth: "+3 vs yesterday",
            bg: "bg-purple-50",
        },
    ];

    const loanApplications = [
        {
            id: "LA-0091",
            name: "Ravi Kumar",
            type: "Personal Loan",
            time: "9:14 AM",
            amount: "Rs. 2,50,000",
            status: "Pending Review",
        },
        {
            id: "LA-0092",
            name: "Priya Sharma",
            type: "Business Loan",
            time: "10:02 AM",
            amount: "Rs. 75,000",
            status: "Documents Due",
        },
        {
            id: "LA-0093",
            name: "Mohammed Ali",
            type: "Gold Loan",
            time: "10:45 AM",
            amount: "Rs. 1,00,000",
            status: "Approved",
        },
        {
            id: "LA-0094",
            name: "Sunita Devi",
            type: "Personal Loan",
            time: "11:30 AM",
            amount: "Rs. 40,000",
            status: "Pending Review",
        },
        {
            id: "LA-0095",
            name: "Arun Nair",
            type: "Business Loan",
            time: "12:10 PM",
            amount: "Rs. 3,00,000",
            status: "Under Verification",
        },
        {
            id: "LA-0096",
            name: "Arun Nair",
            type: "Business Loan",
            time: "12:10 PM",
            amount: "Rs. 3,00,000",
            status: "Under Verification",
        },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-700";
            case "Pending Review":
                return "bg-yellow-100 text-yellow-700";
            case "Documents Due":
                return "bg-red-100 text-red-600";
            case "Under Verification":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    /* ================= UI ================= */

    return (
        <div className="flex flex-col gap-6 p-6">
            <h1 className='text-2xl md:text-4xl font-bold text-center md:text-left'>Home</h1>

            {/* ================= STATS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item, index) => (
                    <div
                        key={index}
                        className={`${item.bg} rounded-xl p-6 shadow-sm`}
                    >
                        <p className="text-gray-600 text-sm">{item.title}</p>
                        <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
                        <p className="text-sm text-gray-500 mt-2">{item.growth}</p>
                    </div>
                ))}
            </div>

            {/* ================= MAIN GRID ================= */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* ================= LOAN APPLICATIONS ================= */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-semibold md:text-lg">
                            Today's Loan Applications
                        </h2>
                        <button className="text-sm text-blue-600">View all</button>
                    </div>

                    <div className="flex flex-col gap-5">
                        {loanApplications.map((loan, index) => (
                            <div
                                key={index}
                                className="md:flex justify-between items-center border-b pb-4 last:border-0"
                            >
                                <div>
                                    <p className="font-medium">
                                        {loan.name}{" "}
                                        <span className="text-gray-400 text-sm">
                                            {loan.id}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {loan.type} • {loan.time}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <p className="font-medium">{loan.amount}</p>
                                    <span
                                        className={`text-xs px-3 py-1 rounded-full ${getStatusStyle(
                                            loan.status
                                        )}`}
                                    >
                                        {loan.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= SCHEDULE ================= */}
                <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
                    <h2 className="font-semibold text-lg mb-4">Schedule</h2>

                    {/* <DateCalendar />*/ } 
                 {/*change this to mui date picker*/}


                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar />
                    </LocalizationProvider>
                    
                </div>
            </div>


        </div>
    );
};

export default ReceptionistHome;