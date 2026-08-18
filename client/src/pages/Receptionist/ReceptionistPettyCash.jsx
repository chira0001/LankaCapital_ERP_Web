import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAPI from '../../api/axiosAPI'

const ReceptionistPettyCash = () => {

    const [pettyCashDetails, setPettyCashDetails] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    // const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [pettyCashCategories, setPettyCashCategories] = useState([]);

    // ✅ Edit States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPettyCashId, setSelectedPettyCashId] = useState(null);
    const [pettyCashUpdatePayload, setPettyCashUpdatePayload] = useState({
        narration: "",
        amount: "",
        category: ""
    });

    const [pettyCashForm, setPettyCashForm] = useState({
        narration: "",
        amount: "",
        category: ""
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

    // ================= FETCH =================

    const fetchPettyCashTypes = async () => {
        try {
            const response = await axiosAPI.get("/recep/pettyCashCategories");
            setPettyCashCategories(response.data);
        } catch {
            toast.error('Failed to fetch petty cash categories');
        }
    }

    const fetchPettyCashDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axiosAPI.get("/recep/pettyCash");
            setPettyCashDetails(response.data);
        } catch {
            toast.error('Failed to fetch petty cash details');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchPettyCashDetails();
        fetchPettyCashTypes();
    }, [])

    // ================= ADD =================

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
        setPettyCashForm({ narration: "", amount: "", category: "" });
    };

    const handleSubmit = async () => {
        if (!pettyCashForm.amount || parseFloat(pettyCashForm.amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (!pettyCashForm.narration.trim()) {
            toast.error("Please provide a narration");
            return;
        }
        if (!pettyCashForm.category) {
            toast.error("Please provide a category");
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosAPI.post("/recep/pettyCash", pettyCashForm);
            toast.success("Petty cash expense submitted successfully");
            handleReset();
            fetchPettyCashDetails();
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to submit petty cash expense");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ================= EDIT =================

    const handleRowClick = (item) => {
        setSelectedPettyCashId(item.id);
        setPettyCashUpdatePayload({
            narration: item.narration,
            amount: item.amount,
            category: item.pettyCashCategory?.id || ""
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!pettyCashUpdatePayload.amount || parseFloat(pettyCashUpdatePayload.amount) <= 0) {
            toast.error("Enter valid amount");
            return;
        }

        setIsUpdating(true);
        try {
            await axiosAPI.put(
                `/recep/pettyCash/${selectedPettyCashId}`,
                pettyCashUpdatePayload
            );
            toast.success("Updated successfully");
            setIsEditOpen(false);
            fetchPettyCashDetails();
        } catch (e) {
            toast.error(e.response?.data?.message || "Update failed");
        } finally {
            setIsUpdating(false);
        }
    };

    // ================= FILTER =================

    const filteredPettyCash = pettyCashDetails.filter(detail => {
        const d = new Date(detail.dateTime);
        return d.getMonth() === selectedMonth;
        //  &&
        //     d.getFullYear() === selectedYear;
    });

    const monthlyTotal = filteredPettyCash.reduce((sum, d) =>
        sum + parseFloat(d.amount), 0
    );

    const monthlyStats = {
        approved: filteredPettyCash.filter(d => d.request === 'APPROVED').length,
        pending: filteredPettyCash.filter(d => d.request === 'PENDING').length,
        rejected: filteredPettyCash.filter(d => d.request === 'REJECTED').length,
    };

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
    <div className="min-h-full p-6 bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* ================= HEADER ================= */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
                Petty Cash Management
            </h1>
            <p className="text-gray-500 mt-1">
                Submit and track your petty cash expenses
            </p>
        </div>

        {/* ================= ADD FORM ================= */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Add New Expense
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
                <input
                    type="text"
                    name="amount"
                    value={pettyCashForm.amount}
                    onChange={handleInputChange}
                    placeholder="Amount (Rs.)"
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                    type="text"
                    name="narration"
                    value={pettyCashForm.narration}
                    onChange={handleInputChange}
                    placeholder="Narration"
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <select
                    name="category"
                    value={pettyCashForm.category}
                    onChange={handleInputChange}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">Select category</option>
                    {pettyCashCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-3 mt-5">
                <button
                    onClick={handleReset}
                    className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
                >
                    Reset
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
                >
                    {isSubmitting ? "Submitting..." : "Submit Expense"}
                </button>
            </div>
        </div>

        {/* ================= FILTER ================= */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
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

            {/* <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border rounded-lg px-4 py-2 bg-white shadow-sm"
            >
                {[2024, 2025, 2026, 2027].map(year => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </select> */}
        </div>

        {/* ================= STATISTICS ================= */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow border">
                <p className="text-gray-500 text-sm">Total Expense</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                    Rs. {monthlyTotal.toFixed(2)}
                </p>
            </div>

            <div className="bg-green-50 p-6 rounded-2xl shadow border border-green-100">
                <p className="text-green-600 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-700 mt-2">
                    {monthlyStats.approved}
                </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-2xl shadow border border-yellow-100">
                <p className="text-yellow-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-700 mt-2">
                    {monthlyStats.pending}
                </p>
            </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-100 text-gray-600 text-sm">
                    <tr>
                        <th className="px-6 py-3 text-left">Amount</th>
                        <th className="px-6 py-3 text-left">Narration</th>
                        <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPettyCash.length === 0 && (
                        <tr>
                            <td colSpan="3" className="text-center py-10 text-gray-400">
                                No expenses found for selected month.
                            </td>
                        </tr>
                    )}

                    {filteredPettyCash.map(item => (
                        <tr
                            key={item.id}
                            onClick={() => handleRowClick(item)}
                            className="hover:bg-blue-50 cursor-pointer transition"
                        >
                            <td className="px-6 py-4 font-medium text-gray-800">
                                Rs. {parseFloat(item.amount).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                {item.narration}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.request)}`}>
                                    {item.request}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* ================= EDIT MODAL ================= */}
        {isEditOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">
                        Edit Petty Cash
                    </h2>

                    <div className="space-y-3">
                        <input
                            type="number"
                            value={pettyCashUpdatePayload.amount}
                            onChange={(e) =>
                                setPettyCashUpdatePayload(prev => ({
                                    ...prev,
                                    amount: e.target.value
                                }))
                            }
                            className="border rounded-lg w-full px-3 py-2"
                            placeholder="Amount"
                        />

                        <textarea
                            value={pettyCashUpdatePayload.narration}
                            onChange={(e) =>
                                setPettyCashUpdatePayload(prev => ({
                                    ...prev,
                                    narration: e.target.value
                                }))
                            }
                            className="border rounded-lg w-full px-3 py-2"
                            placeholder="Narration"
                        />

                        <select
                            value={pettyCashUpdatePayload.category}
                            onChange={(e) =>
                                setPettyCashUpdatePayload(prev => ({
                                    ...prev,
                                    category: e.target.value
                                }))
                            }
                            className="border rounded-lg w-full px-3 py-2"
                        >
                            <option value="">Select category</option>
                            {pettyCashCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setIsEditOpen(false)}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                        >
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
)
}

export default ReceptionistPettyCash