import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAPI from '../../api/axiosAPI'

const ReceptionistAdministrativeExpense = () => {

    const [administrativeExpenseDetails, setAdministrativeExpenseDetails] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    // const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [administrativeExpenseCategories, setAdministrativeExpenseCategories] = useState([]);

    // ✅ Edit States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedAdministrativeExpenseId, setSelectedAdministrativeExpenseId] = useState(null);
    const [administrativeExpenseUpdatePayload, setAdministrativeExpenseUpdatePayload] = useState({
        narration: "",
        amount: "",
        category: ""
    });

    const [administrativeExpenseForm, setAdministrativeExpenseForm] = useState({
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

    const fetchAdministrativeExpenseTypes = async () => {
        try {
            const response = await axiosAPI.get("/recep/administrative-expense-categories");
            setAdministrativeExpenseCategories(response.data);
        } catch {
            toast.error('Failed to fetch administrative expense categories');
        }
    }

    const fetchAdministrativeExpenseDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axiosAPI.get("/recep/administrative-expenses");
            setAdministrativeExpenseDetails(response.data);
        } catch {
            toast.error('Failed to fetch administrative expense details');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchAdministrativeExpenseDetails();
        fetchAdministrativeExpenseTypes();
    }, [])

    // ================= ADD =================

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                setAdministrativeExpenseForm({ ...administrativeExpenseForm, [name]: value });
            }
        } else {
            setAdministrativeExpenseForm({ ...administrativeExpenseForm, [name]: value });
        }
    };

    const handleReset = () => {
        setAdministrativeExpenseForm({ narration: "", amount: "", category: "" });
    };

    const handleSubmit = async () => {
        if (!administrativeExpenseForm.amount || parseFloat(administrativeExpenseForm.amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (!administrativeExpenseForm.narration.trim()) {
            toast.error("Please provide a narration");
            return;
        }
        if (!administrativeExpenseForm.category) {
            toast.error("Please provide a category");
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosAPI.post("/recep/administrative-expenses", administrativeExpenseForm);
            toast.success("Administrative expense submitted successfully");
            handleReset();
            fetchAdministrativeExpenseDetails();
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to submit administrative expense");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ================= EDIT =================

    const handleRowClick = (item) => {
        setSelectedAdministrativeExpenseId(item.id);
        setAdministrativeExpenseUpdatePayload({
            narration: item.narration,
            amount: item.amount,
            category: item.administrativeExpenseCategory?.id || ""
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!administrativeExpenseUpdatePayload.amount || parseFloat(administrativeExpenseUpdatePayload.amount) <= 0) {
            toast.error("Enter valid amount");
            return;
        }

        setIsUpdating(true);
        try {
            await axiosAPI.put(
                `/recep/administrative-expenses/${selectedAdministrativeExpenseId}`,
                administrativeExpenseUpdatePayload
            );
            toast.success("Updated successfully");
            setIsEditOpen(false);
            fetchAdministrativeExpenseDetails();
        } catch (e) {
            toast.error(e.response?.data?.message || "Update failed");
        } finally {
            setIsUpdating(false);
        }
    };

    // ================= FILTER =================

    const filteredAdministrativeExpense = administrativeExpenseDetails.filter(detail => {
        const d = new Date(detail.dateTime);
        return d.getMonth() === selectedMonth;
        //  &&
        //     d.getFullYear() === selectedYear;
    });

    const monthlyTotal = filteredAdministrativeExpense.reduce((sum, d) =>
        sum + parseFloat(d.amount), 0
    );

    const monthlyStats = {
        approved: filteredAdministrativeExpense.filter(d => d.request === 'APPROVED').length,
        pending: filteredAdministrativeExpense.filter(d => d.request === 'PENDING').length,
        rejected: filteredAdministrativeExpense.filter(d => d.request === 'REJECTED').length,
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
    <div className="min-h-full">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
                {/* Administrative Expense Management */}
                Administrative Expense Management
            </h1>
            <p className="text-gray-500 mt-1">
                Submit and track your administrative expenses
            </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Add New Expense
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
                <input
                    type="text"
                    name="amount"
                    value={administrativeExpenseForm.amount}
                    onChange={handleInputChange}
                    placeholder="Amount (Rs.)"
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                    type="text"
                    name="narration"
                    value={administrativeExpenseForm.narration}
                    onChange={handleInputChange}
                    placeholder="Narration"
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <select
                    name="category"
                    value={administrativeExpenseForm.category}
                    onChange={handleInputChange}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">Select category</option>
                    {administrativeExpenseCategories.map(cat => (
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
                    {filteredAdministrativeExpense.length === 0 && (
                        <tr>
                            <td colSpan="3" className="text-center py-10 text-gray-400">
                                No expenses found for selected month.
                            </td>
                        </tr>
                    )}

                    {filteredAdministrativeExpense.map(item => (
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
                        {/* Edit Administrative Expense */}
                        Edit Administrative Expense
                    </h2>

                    <div className="space-y-3">
                        <input
                            type="number"
                            value={administrativeExpenseUpdatePayload.amount}
                            onChange={(e) =>
                                setAdministrativeExpenseUpdatePayload(prev => ({
                                    ...prev,
                                    amount: e.target.value
                                }))
                            }
                            className="border rounded-lg w-full px-3 py-2"
                            placeholder="Amount"
                        />

                        <textarea
                            value={administrativeExpenseUpdatePayload.narration}
                            onChange={(e) =>
                                setAdministrativeExpenseUpdatePayload(prev => ({
                                    ...prev,
                                    narration: e.target.value
                                }))
                            }
                            className="border rounded-lg w-full px-3 py-2"
                            placeholder="Narration"
                        />

                        <select
                            value={administrativeExpenseUpdatePayload.category}
                            onChange={(e) =>
                                setAdministrativeExpenseUpdatePayload(prev => ({
                                    ...prev,
                                    category: e.target.value
                                }))
                            }
                            className="border rounded-lg w-full px-3 py-2"
                        >
                            <option value="">Select category</option>
                            {administrativeExpenseCategories.map(cat => (
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

export default ReceptionistAdministrativeExpense