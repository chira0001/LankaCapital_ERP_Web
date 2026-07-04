import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAPI from '../../api/axiosAPI'

const ReceptionistPettyCash = () => {

    const [pettyCashDetails, setPettyCashDetails] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pettyCashForm, setPettyCashForm] = useState({
        narration: "",
        amount: ""
    });

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

    const fetchPettyCashDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axiosAPI.get("/recep/pettyCash");
            setPettyCashDetails(response.data);
        } catch (e) {
            console.log(e);
            toast.error('Failed to fetch petty cash details');
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'amount') {
            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                setPettyCashForm({ ...pettyCashForm, [name]: value });
            }
        } else {
            setPettyCashForm({ ...pettyCashForm, [name]: value });
        }
    };

    const handleReset = () => {
        setPettyCashForm({
            narration: "",
            amount: ""
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!pettyCashForm.amount || parseFloat(pettyCashForm.amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (!pettyCashForm.narration.trim()) {
            toast.error("Please provide a narration");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axiosAPI.post("/recep/pettyCash", pettyCashForm);

            if (response.status === 200 || response.status === 201) {
                toast.success("Petty cash expense submitted successfully");
                handleReset();
                fetchPettyCashDetails();
            } else {
                toast.error("Failed to submit petty cash expense");
            }
        } catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message || "Failed to submit petty cash expense");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter records by selected month and year
    const filteredPettyCash = pettyCashDetails.filter(detail => {
        const detailDate = new Date(detail.dateTime);
        return detailDate.getMonth() === selectedMonth &&
            detailDate.getFullYear() === selectedYear;
    });

    // Calculate monthly statistics
    const monthlyTotal = filteredPettyCash.reduce((sum, detail) =>
        sum + parseFloat(detail.amount), 0
    );

    const monthlyStats = {
        total: monthlyTotal,
        approved: filteredPettyCash.filter(d => d.request === 'APPROVED').length,
        pending: filteredPettyCash.filter(d => d.request === 'PENDING').length,
        rejected: filteredPettyCash.filter(d => d.request === 'REJECTED').length,
    };

    useEffect(() => {
        fetchPettyCashDetails();
    }, [])

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "REJECTED":
                return "text-red-600 bg-red-50 border-red-200";
            case "APPROVED":
                return "text-green-600 bg-green-50 border-green-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    return (
        <div className="min-h-full p-3">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Petty Cash Management
                </h1>
                <p className="text-gray-600">
                    Submit and track your petty cash expenses
                </p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Expense Submission Form - Left Side */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                            Add New Expense
                        </h2>

                        <div className="space-y-5">
                            {/* Amount Input */}
                            <div className="flex flex-col">
                                <label className="text-gray-700 text-sm font-medium mb-2">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                                        Rs.
                                    </span>
                                    <input
                                        type="text"
                                        name="amount"
                                        value={pettyCashForm.amount}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Narration Input */}
                            <div className="flex flex-col">
                                <label className="text-gray-700 text-sm font-medium mb-2">
                                    Narration <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="narration"
                                    value={pettyCashForm.narration}
                                    onChange={handleInputChange}
                                    placeholder="Enter description of the expense..."
                                    rows={4}
                                    maxLength={500}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {pettyCashForm.narration.length}/500 characters
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={handleReset}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Expense'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expense History - Right Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Month Selector */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Select Period
                            </h3>

                            {/* Year Selector */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedYear(selectedYear - 1)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    title="Previous Year"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span className="text-lg font-bold text-gray-800 min-w-[80px] text-center">
                                    {selectedYear}
                                </span>
                                <button
                                    onClick={() => setSelectedYear(selectedYear + 1)}
                                    disabled={selectedYear >= new Date().getFullYear()}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Next Year"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Month Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {months.map((month) => {
                                const isCurrentMonth = month.value === new Date().getMonth() &&
                                    selectedYear === new Date().getFullYear();
                                const isSelected = month.value === selectedMonth;
                                const isFutureMonth = selectedYear === new Date().getFullYear() &&
                                    month.value > new Date().getMonth();

                                return (
                                    <button
                                        key={month.value}
                                        onClick={() => setSelectedMonth(month.value)}
                                        disabled={isFutureMonth}
                                        className={`
                                            relative px-4 py-3 rounded-lg text-sm font-medium transition-all
                                            ${isSelected
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }
                                            ${isFutureMonth ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}
                                            ${isCurrentMonth && !isSelected ? 'ring-2 ring-blue-300' : ''}
                                        `}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="hidden sm:inline">{month.label}</span>
                                            <span className="sm:hidden">{month.short}</span>
                                            {isCurrentMonth && (
                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Monthly Statistics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                                    <p className="text-xl font-bold text-gray-800 mt-1">
                                        Rs. {monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Approved</p>
                                    <p className="text-xl font-bold text-green-600 mt-1">{monthlyStats.approved}</p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Pending</p>
                                    <p className="text-xl font-bold text-yellow-600 mt-1">{monthlyStats.pending}</p>
                                </div>
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Rejected</p>
                                    <p className="text-xl font-bold text-red-600 mt-1">{monthlyStats.rejected}</p>
                                </div>
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expense Table */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Table Header */}
                        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {months[selectedMonth].label} {selectedYear} Expenses
                            </h2>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="text-gray-600">Loading expenses...</p>
                                    </div>
                                </div>
                            ) : filteredPettyCash.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-gray-500 text-lg font-medium">No expenses found</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        No expenses recorded for {months[selectedMonth].label} {selectedYear}
                                    </p>
                                </div>
                            ) : (
                                <table className='w-full'>
                                    <thead>
                                        <tr className='bg-gradient-to-r from-gray-700 to-gray-800 text-white'>
                                            <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider'>
                                                Amount
                                            </th>
                                            <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider'>
                                                Date & Time
                                            </th>
                                            <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider'>
                                                Narration
                                            </th>
                                            <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider'>
                                                Status
                                            </th>
                                            <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider'>
                                                Approved By
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {filteredPettyCash.map((pettyCashDetail, key) => (
                                            <tr
                                                key={pettyCashDetail.id}
                                                className="hover:bg-blue-50 transition-colors"
                                            >
                                                <td className='px-6 py-4 text-sm font-semibold text-gray-800'>
                                                    Rs. {parseFloat(pettyCashDetail.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>

                                                <td className='px-6 py-4 text-sm text-gray-600'>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {new Date(pettyCashDetail.dateTime).toLocaleDateString('en-GB', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(pettyCashDetail.dateTime).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className='px-6 py-4 text-sm text-gray-600 max-w-xs'>
                                                    <div className="line-clamp-2" title={pettyCashDetail.narration}>
                                                        {pettyCashDetail.narration}
                                                    </div>
                                                </td>

                                                <td className='px-6 py-4'>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(pettyCashDetail.request)}`}>
                                                        {pettyCashDetail.request === "PENDING" && (
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {pettyCashDetail.request === "APPROVED" && (
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {pettyCashDetail.request === "REJECTED" && (
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {pettyCashDetail.request}
                                                    </span>
                                                </td>

                                                <td className='px-6 py-4 text-sm text-gray-600'>
                                                    {pettyCashDetail.approvedEmployee?.id ? (
                                                        <span className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                            </svg>
                                                            ID: {pettyCashDetail.approvedEmployee.id}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Pending approval</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Table Footer */}
                        {filteredPettyCash.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50 border-t">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">
                                        Showing <span className="font-semibold">{filteredPettyCash.length}</span> expense(s) for {months[selectedMonth].label} {selectedYear}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Monthly Total: Rs. {monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReceptionistPettyCash