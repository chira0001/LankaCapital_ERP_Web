import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAPI from '../../api/axiosAPI'

const ReceptionistMonthlyExpense = () => {

    const [expenseForm, setExpenseForm] = useState({
        vehicleAllowanceAndTravel: "",
        fuelAllowance: "",
        buildingRent: "",
        telephoneBill: "",
        electricityBill: "",
        routerBill: "",
        otherExpenses: "",
        note: ""
    });

    const [totalExpenses, setTotalExpenses] = useState(0);

    useEffect(() => {
        const total = [
            expenseForm.vehicleAllowanceAndTravel,
            expenseForm.fuelAllowance,
            expenseForm.buildingRent,
            expenseForm.telephoneBill,
            expenseForm.electricityBill,
            expenseForm.routerBill,
            expenseForm.otherExpenses
        ].reduce((sum, value) => {
            const numValue = parseFloat(value) || 0;
            return sum + numValue;
        }, 0);

        setTotalExpenses(total);
    }, [expenseForm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name !== 'note') {
            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                setExpenseForm({ ...expenseForm, [name]: value });
            }
        } else {
            setExpenseForm({ ...expenseForm, [name]: value });
        }
    };

    const handleSubmit = async () => {
        try {
            const hasExpense = [
                expenseForm.vehicleAllowanceAndTravel,
                expenseForm.fuelAllowance,
                expenseForm.buildingRent,
                expenseForm.telephoneBill,
                expenseForm.electricityBill,
                expenseForm.routerBill,
                expenseForm.otherExpenses
            ].some(value => parseFloat(value) > 0);

            if (!hasExpense) {
                toast.error("Please enter at least one expense amount");
                return;
            }

            const payload = {
                vehicleAllowanceAndTravel: parseFloat(expenseForm.vehicleAllowanceAndTravel) || 0,
                fuelAllowance: parseFloat(expenseForm.fuelAllowance) || 0,
                buildingRent: parseFloat(expenseForm.buildingRent) || 0,
                telephoneBill: parseFloat(expenseForm.telephoneBill) || 0,
                electricityBill: parseFloat(expenseForm.electricityBill) || 0,
                routerBill: parseFloat(expenseForm.routerBill) || 0,
                otherExpenses: parseFloat(expenseForm.otherExpenses) || 0,
                note: expenseForm.note || ""
            };
            const response = await axiosAPI.post("/recep/monthlyExpenses", payload);

            if (response.status === 200 || response.status === 201) {
                toast.success("Monthly expenses submitted successfully");
                setExpenseForm({
                    vehicleAllowanceAndTravel: "",
                    fuelAllowance: "",
                    buildingRent: "",
                    telephoneBill: "",
                    electricityBill: "",
                    routerBill: "",
                    otherExpenses: "",
                    note: ""
                });
            } else {
                toast.error("Failed to submit expenses");
            }
        } catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message || "Failed to submit expenses");
        }
    };

    const handleReset = () => {
        setExpenseForm({
            vehicleAllowanceAndTravel: "",
            fuelAllowance: "",
            buildingRent: "",
            telephoneBill: "",
            electricityBill: "",
            routerBill: "",
            otherExpenses: "",
            note: ""
        });
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col gap-8">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* EXPENSE FORM */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6">

                <h1 className="text-3xl font-bold text-gray-800">
                    Monthly Expense Report
                </h1>

                <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">
                        Total Expenses
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                        Rs. {totalExpenses.toFixed(2)}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    {/* Vehicle Allowance and Travel */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Vehicle Allowance & Travel
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="vehicleAllowanceAndTravel"
                                value={expenseForm.vehicleAllowanceAndTravel}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Fuel Allowance */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Fuel Allowance
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="fuelAllowance"
                                value={expenseForm.fuelAllowance}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Building Rent */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Building Rent
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="buildingRent"
                                value={expenseForm.buildingRent}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Telephone Bill */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Telephone Bill
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="telephoneBill"
                                value={expenseForm.telephoneBill}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Electricity Bill */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Electricity Bill
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="electricityBill"
                                value={expenseForm.electricityBill}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Router Bill */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Router/Internet Bill
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="routerBill"
                                value={expenseForm.routerBill}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Other Expenses */}
                    <div className="flex flex-col md:col-span-2">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Other Expenses
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="otherExpenses"
                                value={expenseForm.otherExpenses}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div className="flex flex-col md:col-span-2">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            name="note"
                            value={expenseForm.note}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Add any additional information about your expenses..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                                   focus:border-transparent resize-none transition-all"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg 
                               text-sm font-medium hover:bg-gray-200 transition-all"
                    >
                        Reset
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 
                               text-white rounded-lg text-sm font-medium
                               hover:from-blue-700 hover:to-blue-800 
                               transition-all shadow-md hover:shadow-lg"
                    >
                        Submit Expenses
                    </button>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
                <div className="flex items-start gap-3">
                    <svg
                        className="w-5 h-5 text-blue-600 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                            Important Information
                        </h3>
                        <p className="text-sm text-gray-600">
                            Please ensure all amounts are accurate. You can only submit monthly expenses once per month.
                            All fields support up to 2 decimal places.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReceptionistMonthlyExpense