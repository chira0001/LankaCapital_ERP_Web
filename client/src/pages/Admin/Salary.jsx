import React, { useState } from 'react'
import { ToastContainer } from 'react-toastify'

const Salary = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const months = [
        { value: 0, label: 'January', short: 'Jan' },
        { value: 1, label: 'February', short: 'Feb' },
        { value: 2, label: 'March', short: 'Mar' },
        { value: 3, label: 'April', short: 'Apr' },
        { value: 4, label: 'May', short: 'May' },
        { value: 5, label: 'June', short: 'Jun' },
        { value: 6, label: 'July', short: 'Jul' },
        { value: 7, label: 'August', short: 'Aug' },
        { value: 8, label: 'September', short: 'Sep' },
        { value: 9, label: 'October', short: 'Oct' },
        { value: 10, label: 'November', short: 'Nov' },
        { value: 11, label: 'December', short: 'Dec' }
    ];

    return (
        <div className="min-h-screen w-full p-3">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 sm:text-xs">
                        Salary overview
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                        Employee Salary
                    </h1>
                    <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                        Review employee salary payment records.
                    </p>
                </div>
            </div>
            <div>
                <div>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="border rounded-lg px-4 py-2 bg-white shadow-sm"
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>

                </div>
            </div>
        </div>
    )
}

export default Salary