import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAPI from '../../api/axiosAPI'

const ReceptionistFinancials = () => {

    const [expenseForm, setExpenseForm] = useState({
        landBuilding: "",
        equipment: "",
        furniture: "",
        vehicles: "",
        accumulatedDepreciation: "",
        directorCurrentAccount: "",
        otherLiabilities: "",
        tradePayables: "",
        inventory: "",
        prepaidExpenses: "",
        bankLoan: "",
        notes: ""
    });

    const [totalExpenses, setTotalExpenses] = useState(0);

    useEffect(() => {
        const total = [
            expenseForm.landBuilding,
            expenseForm.equipment,
            expenseForm.furniture,
            expenseForm.vehicles,
            expenseForm.accumulatedDepreciation,
            expenseForm.directorCurrentAccount,
            expenseForm.otherLiabilities,
            expenseForm.tradePayables,
            expenseForm.inventory,
            expenseForm.prepaidExpenses,
            expenseForm.bankLoan
        ].reduce((sum, value) => {
            const numValue = parseFloat(value) || 0;
            return sum + numValue;
        }, 0);

        setTotalExpenses(total);
    }, [expenseForm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name !== 'notes') {
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
                expenseForm.landBuilding,
                expenseForm.equipment,
                expenseForm.furniture,
                expenseForm.vehicles,
                expenseForm.accumulatedDepreciation,
                expenseForm.directorCurrentAccount,
                expenseForm.otherLiabilities,
                expenseForm.tradePayables,
                expenseForm.inventory,
                expenseForm.prepaidExpenses,
                expenseForm.bankLoan
            ].some(value => parseFloat(value) > 0);

            if (!hasExpense) {
                toast.error("Please enter at least one expense amount");
                return;
            }

            const payload = {
                landBuilding: parseFloat(expenseForm.landBuilding) || 0,
                equipment: parseFloat(expenseForm.equipment) || 0,
                furniture: parseFloat(expenseForm.furniture) || 0,
                vehicles: parseFloat(expenseForm.vehicles) || 0,
                accumulatedDepreciation: parseFloat(expenseForm.accumulatedDepreciation) || 0,
                directorCurrentAccount: parseFloat(expenseForm.directorCurrentAccount) || 0,
                otherLiabilities: parseFloat(expenseForm.otherLiabilities) || 0,
                tradePayables: parseFloat(expenseForm.tradePayables) || 0,
                inventory: parseFloat(expenseForm.inventory) || 0,
                prepaidExpenses: parseFloat(expenseForm.prepaidExpenses) || 0,
                bankLoan: parseFloat(expenseForm.bankLoan) || 0,
                notes: expenseForm.notes || "",
            };

            // const response = "";
            const response = await axiosAPI.post("/recep/financials", payload);

            if (response.status === 200 || response.status === 201) {
                toast.success("Monthly financials submitted successfully");
                setExpenseForm({
                    landBuilding: "",
                    equipment: "",
                    furniture: "",
                    vehicles: "",
                    accumulatedDepreciation: "",
                    directorCurrentAccount: "",
                    otherLiabilities: "",
                    tradePayables: "",
                    inventory: "",
                    prepaidExpenses: "",
                    bankLoan: "",
                    notes: ""
                });
            } else {
                toast.error("Failed to submit financials");
            }
        } catch (e) {
            console.log(e);
            toast.error(e.response?.data?.message || "Failed to submit financials");
        }
    };

    const handleReset = () => {
        setExpenseForm({
            landBuilding: "",
            equipment: "",
            furniture: "",
            vehicles: "",
            accumulatedDepreciation: "",
            directorCurrentAccount: "",
            otherLiabilities: "",
            tradePayables: "",
            inventory: "",
            prepaidExpenses: "",
            bankLoan: "",
            notes: ""
        });
    };

    return (
        <div className="min-h-full ">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* EXPENSE FORM */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-3">

                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Monthly Business Financials
                    </h1>
                    <p className="text-gray-600">
                        Submit and track your monthly business financial statements
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">
                        Total Expenses
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                        Rs. {totalExpenses.toFixed(2)}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    {/* Land or Building */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Land or Building
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="landBuilding"
                                value={expenseForm.landBuilding}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Equipments */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Equipments
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="equipment"
                                value={expenseForm.equipment}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Furniture */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Furniture
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="furniture"
                                value={expenseForm.furniture}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Vehicless */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Vehicless
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="vehicles"
                                value={expenseForm.vehicles}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Accumulated Depreciations */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Accumulated Depreciations
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="accumulatedDepreciation"
                                value={expenseForm.accumulatedDepreciation}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Director Current Account */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Director Current Account
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="directorCurrentAccount"
                                value={expenseForm.directorCurrentAccount}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    {/* Other Liabilities */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Other Liabilities
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="otherLiabilities"
                                value={expenseForm.otherLiabilities}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    {/* Trade Payables */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Trade Payables
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="tradePayables"
                                value={expenseForm.tradePayables}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    {/* Inventory */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Inventory
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="inventory"
                                value={expenseForm.inventory}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    {/* Prepaid Expenses */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Prepaid Expenses
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="prepaidExpenses"
                                value={expenseForm.prepaidExpenses}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    {/* Bank Loans */}
                    <div className="flex flex-col">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Bank Loans
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                Rs.
                            </span>
                            <input
                                type="text"
                                name="bankLoan"
                                value={expenseForm.bankLoan}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col md:col-span-2">
                        <label className="text-gray-700 text-sm font-medium mb-2">
                            Additional Notess (Optional)
                        </label>
                        <textarea
                            name="notes"
                            value={expenseForm.notes}
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
                        Submit Financials
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

export default ReceptionistFinancials