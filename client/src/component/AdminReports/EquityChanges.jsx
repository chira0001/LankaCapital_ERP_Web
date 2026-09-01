import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/component/ui/button";
import { Label } from "@/component/ui/label";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EquityChanges = ({ periodStartDate, periodEndDate }) => {
    const [startDate, setStartDate] = useState(periodStartDate);
    const [endDate, setEndDate] = useState(periodEndDate);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingTB, setIsSavingTB] = useState(false);
    const [existingTrialBalance, setExistingTrialBalance] = useState([]);
    const [isEditTrialBalanceData, setIsEditTrialBalanceData] = useState(false);


    const [trialBalanceArray, setTrialBalanceArray] = useState([]);
    const [TrialBalanceArrayData, setTrialBalanceArrayData] = useState({
        accountName: "",
        transactionType: "",
        accountType: "",
        amount: "",
        financialDate: endDate, // kept in sync with endDate input
    });

    const handleSaveTBData = useCallback(async () => {
        try {
            setIsSavingTB(true);

            const res = await axiosApi.post("/admin/trialBalance", trialBalanceArray);
            setExistingTrialBalance(Array.isArray(res.data) ? res.data : []);
            toast.success("Trial balance data successfully added");
        } catch (e) {
            toast.error("Failed to save Trial Balance data.");
            console.log(e);
        } finally {
            setIsSavingTB(false);
        }
    }, [trialBalanceArray]);

    const handleTBChange = useCallback((e) => {
        const { name, value } = e.target;
        setTrialBalanceArrayData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const resetTBForm = useCallback(() => {
        setTrialBalanceArrayData({
            accountName: "",
            transactionType: "",
            accountType: "",
            amount: "",
            financialDate: endDate,
        });
    }, [endDate]);

    const handleAddTBRow = useCallback(() => {
        // REQUIRE start/end dates before adding
        if (!startDate || !endDate) {
            toast.error(
                "Please select Start Date and End Date before adding Trial Balance data."
            );
            return;
        }

        const row = {
            accountName: TrialBalanceArrayData.accountName?.trim(),
            transactionType: TrialBalanceArrayData.transactionType,
            accountType: TrialBalanceArrayData.accountType,
            amount: TrialBalanceArrayData.amount,
            financialDate: endDate, // must be endDate for each row
        };

        if (
            !row.accountName ||
            !row.transactionType ||
            !row.accountType ||
            row.amount === ""
        ) {
            toast.error("Please fill all Trial Balance fields.");
            return;
        }

        setTrialBalanceArray((prev) => [...prev, row]);
        resetTBForm();
    }, [TrialBalanceArrayData, startDate, endDate, resetTBForm]);



    return (
        <div className="mt-3 border p-4 rounded-lg">
            <ToastContainer position="top-right" autoClose={3000} />
            <h3>Equity Changes Data</h3>

            <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                    <Label htmlFor="tb_accountName">
                        Account Name<span className="text-red-500">*</span>
                    </Label>
                    <input
                        id="tb_accountName"
                        type="text"
                        name="accountName"
                        value={TrialBalanceArrayData.accountName}
                        onChange={handleTBChange}
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none ring-0 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                </div>

                <div>
                    <Label htmlFor="tb_transactionType">
                        Transaction Type<span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="tb_transactionType"
                        name="transactionType"
                        value={TrialBalanceArrayData.transactionType}
                        onChange={handleTBChange}
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none ring-0 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <option value="">Select type</option>
                        <option value="DR">Debit</option>
                        <option value="CR">Credit</option>
                    </select>
                </div>

                <div>
                    <Label htmlFor="tb_accountType">
                        Account Type<span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="tb_accountType"
                        name="accountType"
                        value={TrialBalanceArrayData.accountType}
                        onChange={handleTBChange}
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none ring-0 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <option value="">Select account type</option>
                        <option value="ASSET">Asset</option>
                        <option value="LIABILITY">Liability</option>
                        <option value="EQUITY">Equity</option>
                        <option value="EXPENSE">Expense</option>
                        <option value="INCOME">Income</option>
                    </select>
                </div>

                <div>
                    <Label htmlFor="tb_amount">
                        Amount<span className="text-red-500">*</span>
                    </Label>
                    <input
                        id="tb_amount"
                        type="text"
                        name="amount"
                        value={TrialBalanceArrayData.amount}
                        onChange={handleTBChange}
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none ring-0 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-3">
                <Button
                    onClick={handleAddTBRow}
                    className="w-full sm:w-auto bg-white text-black border border-black"
                    disabled={isSavingTB}
                >
                    {isSavingTB ? "Data Adding..." : "Add Data"}
                </Button>

                <Button
                    onClick={handleSaveTBData}
                    className="w-full sm:w-auto"
                    disabled={isSavingTB}
                >
                    {isSavingTB ? "Data Saving..." : "Save Data"}
                </Button>
            </div>

            <div className="mt-3">
                {trialBalanceArray.length > 0 && (
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border px-2 py-1 text-left">Account Name</th>
                                <th className="border px-2 py-1 text-left">
                                    Transaction Type
                                </th>
                                <th className="border px-2 py-1 text-left">Account Type</th>
                                <th className="border px-2 py-1 text-left">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trialBalanceArray.map((row, key) => (
                                <tr
                                    key={key}
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleEditTBRow(key)}
                                >
                                    <td className="border px-2 py-1">{row.accountName}</td>
                                    <td className="border px-2 py-1">{row.transactionType}</td>
                                    <td className="border px-2 py-1">{row.accountType}</td>
                                    <td className="border px-2 py-1">{row.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {existingTrialBalance.length > 0 && (
                <div className="mt-3">
                    Existing trial balance inputs
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border px-2 py-1 text-left">Account Name</th>
                                <th className="border px-2 py-1 text-left">
                                    Transaction Type
                                </th>
                                <th className="border px-2 py-1 text-left">Account Type</th>
                                <th className="border px-2 py-1 text-left">
                                    Financial Period
                                </th>
                                <th className="border px-2 py-1 text-left">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {existingTrialBalance.map((row, key) => (
                                <tr key={key} className="cursor-pointer hover:bg-gray-50">
                                    <td className="border px-2 py-1">{row.accountName}</td>
                                    <td className="border px-2 py-1">
                                        {row.transactionType}
                                    </td>
                                    <td className="border px-2 py-1">{row.accountType}</td>
                                    <td className="border px-2 py-1">{row.financialDate}</td>
                                    <td className="border px-2 py-1">{row.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isEditTrialBalanceData && (
                <div className="mt-3 border p-4 rounded-lg">
                    <h3>Edit Trial Balance Data</h3>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                            <Label htmlFor="tb_edit_accountName">
                                Account Name<span className="text-red-500">*</span>
                            </Label>
                            <input
                                id="tb_edit_accountName"
                                type="text"
                                name="accountName"
                                value={TrialBalanceArrayData.accountName}
                                onChange={handleTBChange}
                                className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none ring-0 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>

                        <div>
                            <Label htmlFor="tb_edit_transactionType">
                                Transaction Type<span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="tb_edit_transactionType"
                                name="transactionType"
                                value={TrialBalanceArrayData.transactionType}
                                onChange={handleTBChange}
                                className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none ring-0 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="">Select type</option>
                                <option value="DR">Debit</option>
                                <option value="CR">Credit</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="tb_edit_accountType">
                                Account Type<span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="tb_edit_accountType"
                                name="accountType"
                                value={TrialBalanceArrayData.accountType}
                                onChange={handleTBChange}
                                className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none ring-0 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="">Select account type</option>
                                <option value="ASSET">Asset</option>
                                <option value="LIABILITY">Liability</option>
                                <option value="EQUITY">Equity</option>
                                <option value="EXPENSE">Expense</option>
                                <option value="INCOME">Income</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="tb_edit_amount">
                                Amount<span className="text-red-500">*</span>
                            </Label>
                            <input
                                id="tb_edit_amount"
                                type="text"
                                name="amount"
                                value={TrialBalanceArrayData.amount}
                                onChange={handleTBChange}
                                className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none ring-0 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditTrialBalanceData(false);
                                setTbEditIndex(null);
                                resetTBForm();
                            }}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteTBRow}
                            className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700"
                            disabled={isSavingTB}
                        >
                            {isSavingTB ? "Removing..." : "Remove Data"}
                        </Button>
                        <Button
                            onClick={handleUpdateTBRow}
                            className="w-full sm:w-auto"
                            disabled={isSavingTB}
                        >
                            {isSavingTB ? "Updating..." : "Update Data"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EquityChanges