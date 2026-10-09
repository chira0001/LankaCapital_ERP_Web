import React, { useCallback, useEffect, useMemo, useState } from "react";
import axiosApi from "@/api/axiosAPI";
import { Button } from "@/component/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const EquityChanges = ({
    periodStartDate,
    periodEndDate,
    startDate,
    endDate,
}) => {
    const rangeStart = periodStartDate ?? startDate;
    const rangeEnd = periodEndDate ?? endDate;

    const [isSavingEC, setIsSavingEC] = useState(false);
    const [existingEquityChange, setExistingEquityChange] = useState([]);

    const [equityChangeArray, setEquityChangeArray] = useState([]);
    const ROWS = useMemo(() => {
        const balanceLabel = rangeEnd
            ? `Balance as at ${dayjs(rangeEnd).subtract(1, "year").add(1, "day").format("DD MMM YYYY")}`
            : "Balance as at —";

        return [
            {
                key: "BALANCE_AS_AT",
                label: balanceLabel,
                requireStated: true,
                requireRetained: true,
            },
            {
                key: "SHARES_ISSUED",
                label: "Shares Issued",
                requireStated: false,
                requireRetained: true,
            },
            {
                key: "PROFIT_OR_LOSS",
                label: "Profit or Loss for the Period",
                requireStated: true,
                requireRetained: false,
            },
        ];
    }, [rangeEnd]);

    const [equityInputs, setEquityInputs] = useState(() =>
        ROWS.reduce((acc, r) => {
            acc[r.key] = { statedCapitalAmount: "", retainedEarningAmount: "" };
            return acc;
        }, {})
    );

    useEffect(() => {
        setEquityInputs(
            ROWS.reduce((acc, r) => {
                acc[r.key] = { statedCapitalAmount: "", retainedEarningAmount: "" };
                return acc;
            }, {})
        );
        setEquityChangeArray([]);
    }, [ROWS, rangeStart, rangeEnd]);

    const canWorkWithRange = useMemo(
        () => Boolean(rangeStart && rangeEnd),
        [rangeStart, rangeEnd]
    );

    const fetchExistingEquityChange = useCallback(async (sDate, eDate) => {
        try {
            const res = await axiosApi.get("/admin/equityChange", {
                params: { startDate: sDate, endDate: eDate },
            });
            setExistingEquityChange(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            toast.error("Failed to fetch Equity Change data.");
            console.log(err);
            setExistingEquityChange([]);
        }
    }, []);

    useEffect(() => {
        if (!rangeStart || !rangeEnd) {
            setExistingEquityChange([]);
            return;
        }
        fetchExistingEquityChange(rangeStart, rangeEnd);
    }, [rangeStart, rangeEnd, fetchExistingEquityChange]);

    const handleInputChange = useCallback((rowKey, field, value) => {
        setEquityInputs((prev) => ({
            ...prev,
            [rowKey]: {
                ...prev[rowKey],
                [field]: value,
            },
        }));
    }, []);

    const validateAndBuildRows = useCallback(() => {
        if (!rangeStart || !rangeEnd) {
            toast.error("Please select Start Date and End Date before adding data.");
            return null;
        }

        const rowsToSave = [];

        for (const r of ROWS) {
            const stated = equityInputs?.[r.key]?.statedCapitalAmount ?? "";
            const retained = equityInputs?.[r.key]?.retainedEarningAmount ?? "";

            // Validate required fields only
            if (r.requireStated && String(stated).trim() === "") {
                toast.error(`Please enter Stated Capital for "${r.label}".`);
                return null;
            }
            if (r.requireRetained && String(retained).trim() === "") {
                toast.error(`Please enter Retained Earnings for "${r.label}".`);
                return null;
            }

            // If neither field is required AND both are empty, we can skip (not the case here, but safe)
            const hasAnyValue =
                String(stated).trim() !== "" || String(retained).trim() !== "";

            if (!hasAnyValue) continue;

            rowsToSave.push({
                dataName: r.label,
                statedCapitalAmount: r.requireStated ? stated : "", // disabled -> empty
                retainedEarningAmount: r.requireRetained ? retained : "", // disabled -> empty
                financialDate: rangeEnd,
            });
        }

        if (rowsToSave.length === 0) {
            toast.error("Please enter at least one value before adding.");
            return null;
        }

        return rowsToSave;
    }, [ROWS, equityInputs, rangeStart, rangeEnd]);

    const handleAddECData = useCallback(() => {
        const rowsToSave = validateAndBuildRows();
        if (!rowsToSave) return;

        // Keep deterministic: "Add Data" prepares the draft list
        setEquityChangeArray(rowsToSave);
        toast.success("Draft equity change data prepared. Click Save Data to submit.");
    }, [validateAndBuildRows]);

    const clearDraftAndInputs = useCallback(() => {
        setEquityInputs(
            ROWS.reduce((acc, r) => {
                acc[r.key] = { statedCapitalAmount: "", retainedEarningAmount: "" };
                return acc;
            }, {})
        );
        setEquityChangeArray([]);
    }, [ROWS]);

    const handleSaveEquityChangeData = useCallback(async () => {
        try {
            if (!canWorkWithRange) {
                toast.error("Please select Start Date and End Date before saving.");
                return;
            }

            if (equityChangeArray.length === 0) {
                toast.error("Please click Add Data before saving.");
                return;
            }

            setIsSavingEC(true);
            console.log("equityChangeArray : ", equityChangeArray)
            await axiosApi.post("/admin/equityChange", equityChangeArray);

            clearDraftAndInputs();

            await fetchExistingEquityChange(rangeStart, rangeEnd);

            toast.success("Equity change data successfully saved");
        } catch (e) {
            toast.error("Failed to save Equity Change data.");
            console.log(e);
        } finally {
            setIsSavingEC(false);
        }
    }, [
        canWorkWithRange,
        clearDraftAndInputs,
        equityChangeArray,
        fetchExistingEquityChange,
        rangeStart,
        rangeEnd,
    ]);

    return (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-gray-900">
                    Equity Changes Data
                </h3>
                <p className="text-xs text-gray-500">
                    Enter values in the table, then click Add Data and Save Data.
                </p>
            </div>

            {!canWorkWithRange && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    Select <span className="font-semibold">Start Date</span> and{" "}
                    <span className="font-semibold">End Date</span> to add and save equity
                    changes.
                </div>
            )}

            {/* Input table */}
            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-[720px] w-full border-collapse text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                            <th className="border border-gray-200 px-4 py-3 text-left">
                                Item
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-left">
                                Stated Capital
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-left">
                                Retained Earnings
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {ROWS.map((r) => {
                            const statedDisabled = !r.requireStated;
                            const retainedDisabled = !r.requireRetained;

                            return (
                                <tr key={r.key} className="hover:bg-gray-50">
                                    <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-900">
                                        {r.label}
                                    </td>

                                    <td className="border border-gray-200 px-4 py-3">
                                        <input
                                            type="text"
                                            value={equityInputs?.[r.key]?.statedCapitalAmount ?? ""}
                                            disabled={statedDisabled || isSavingEC}
                                            onChange={(e) =>
                                                handleInputChange(r.key, "statedCapitalAmount", e.target.value)
                                            }
                                            placeholder={statedDisabled ? "Not required" : "0.00"}
                                            className={`w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 ${statedDisabled ? "text-gray-400 bg-gray-50" : "text-gray-900"
                                                }`}
                                        />
                                    </td>

                                    <td className="border border-gray-200 px-4 py-3">
                                        <input
                                            type="text"
                                            value={equityInputs?.[r.key]?.retainedEarningAmount ?? ""}
                                            disabled={retainedDisabled || isSavingEC}
                                            onChange={(e) =>
                                                handleInputChange(r.key, "retainedEarningAmount", e.target.value)
                                            }
                                            placeholder={retainedDisabled ? "Not required" : "0.00"}
                                            className={`w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 ${retainedDisabled ? "text-gray-400 bg-gray-50" : "text-gray-900"
                                                }`}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                    onClick={handleAddECData}
                    className="w-full sm:w-auto bg-white text-black border border-black"
                    disabled={isSavingEC || !canWorkWithRange}
                >
                    {isSavingEC ? "Processing..." : "Add Data"}
                </Button>

                <Button
                    onClick={handleSaveEquityChangeData}
                    className="w-full sm:w-auto"
                    disabled={isSavingEC || !canWorkWithRange}
                >
                    {isSavingEC ? "Saving..." : "Save Data"}
                </Button>
            </div>

            {/* Draft preview */}
            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Draft entries</p>
                    <p className="text-xs text-gray-500">{equityChangeArray.length} rows</p>
                </div>

                {equityChangeArray.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-[720px] w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border-b px-3 py-2 text-left font-semibold text-gray-800">
                                        Item
                                    </th>
                                    <th className="border-b px-3 py-2 text-left font-semibold text-gray-800">
                                        Stated Capital
                                    </th>
                                    <th className="border-b px-3 py-2 text-left font-semibold text-gray-800">
                                        Retained Earnings
                                    </th>
                                    <th className="border-b px-3 py-2 text-left font-semibold text-gray-800">
                                        Financial Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {equityChangeArray.map((row, idx) => (
                                    <tr key={idx} className="border-t hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium text-gray-900">
                                            {row.dataName}
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">
                                            {row.statedCapitalAmount || "-"}
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">
                                            {row.retainedEarningAmount || "-"}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">
                                            {row.financialDate || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-sm text-gray-600">
                        No draft rows prepared yet. Fill the table and click{" "}
                        <span className="font-semibold">Add Data</span>.
                    </div>
                )}
            </div>

            {/* Existing saved entries */}
            <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Saved entries</p>
                    <p className="text-xs text-gray-500">
                        {existingEquityChange.length} rows
                    </p>
                </div>

                {existingEquityChange.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-[720px] w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border-b px-3 py-2 text-left font-semibold text-gray-800">
                                        Item
                                    </th>
                                    <th className="border-b px-3 py-2 text-left font-semibold text-gray-800">
                                        Stated Capital
                                    </th>
                                    <th className="border-b px-3 py-2 text-left font-semibold text-gray-800">
                                        Retained Earnings
                                    </th>
                                    <th className="border-b px-3 py-2 text-left font-semibold text-gray-800">
                                        Financial Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {existingEquityChange.map((row, idx) => (
                                    <tr key={idx} className="border-t hover:bg-gray-50">
                                        <td className="px-3 py-2 font-medium text-gray-900">
                                            {row.dataName ?? "-"}
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">
                                            {row.statedCapitalAmount ?? "-"}
                                        </td>
                                        <td className="px-3 py-2 text-gray-700">
                                            {row.retainedEarningAmount ?? "-"}
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">
                                            {row.financialDate ?? "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-sm text-gray-600">
                        No saved equity change data for the selected period.
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquityChanges;