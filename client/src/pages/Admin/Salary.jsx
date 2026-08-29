import React from 'react'
import { ToastContainer } from 'react-toastify'

const Salary = () => {
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
        </div>
    )
}

export default Salary