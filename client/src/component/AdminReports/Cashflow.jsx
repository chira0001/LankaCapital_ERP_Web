import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Label } from "@/component/ui/label";
import axiosApi from "@/api/axiosAPI";

const Cashflow = ({ periodStartDate, periodEndDate, startDate, endDate }) => {
    const rangeStart = periodStartDate ?? startDate;
    const rangeEnd = periodEndDate ?? endDate;

    const [cashFlow, setCashFlow] = useState({
        financialDate: rangeEnd,
        incomeTaxPaidAmount: "",
        cashInHandAmount: "",
        openingCashBalance: "",
    });

    const [isSaving, setIsSaving] = useState(false);

    const [isCheckingExisting, setIsCheckingExisting] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const abortRef = useRef(null);

    useEffect(() => {
        setCashFlow((prev) => {
            if (prev.financialDate === rangeEnd) return prev;
            return { ...prev, financialDate: rangeEnd };
        });
    }, [rangeEnd]);

    const clearCashFlowInputs = useCallback(() => {
        setCashFlow({
            financialDate: rangeEnd,
            incomeTaxPaidAmount: "",
            cashInHandAmount: "",
            openingCashBalance: "",
        });
    }, [rangeEnd]);

    const handleCFChange = useCallback((e) => {
        const { name, value } = e.target;
        setCashFlow((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const fetchExistingCashFlow = useCallback(async () => {
        if (!rangeStart || !rangeEnd) {
            setIsLocked(false);
            return;
        }

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setIsCheckingExisting(true);

            const res = await axiosApi.get("/admin/cashFlow", {
                params: { startDate: rangeStart, endDate: rangeEnd },
                signal: controller.signal,
            });

            const payload = res.data;

            const hasExisting =
                (Array.isArray(payload) && payload.length > 0) ||
                (!!payload && typeof payload === "object" && Object.keys(payload).length > 0);

            if (hasExisting) {
                const existing = Array.isArray(payload) ? payload[0] : payload;

                setIsLocked(true);

                setCashFlow((prev) => ({
                    ...prev,
                    financialDate: existing.financialDate ?? rangeEnd,
                    incomeTaxPaidAmount: existing.incomeTaxPaidAmount ?? "",
                    cashInHandAmount: existing.cashInHandAmount ?? "",
                    openingCashBalance: existing.openingCashBalance ?? "",
                }));
            } else {
                setIsLocked(false);

                setCashFlow((prev) => ({
                    ...prev,
                    financialDate: rangeEnd,
                    incomeTaxPaidAmount: "",
                    cashInHandAmount: "",
                    openingCashBalance: "",
                }));
            }
        } catch (error) {
            if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;

            console.log(error);
            setIsLocked(false);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch existing Cash Flow data"
            );
        } finally {
            if (abortRef.current === controller) setIsCheckingExisting(false);
        }
    }, [rangeStart, rangeEnd]);

    useEffect(() => {
        fetchExistingCashFlow();
    }, [fetchExistingCashFlow]);

    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    const canSubmit = useMemo(() => {
        if (isLocked) return false;

        return (
            Boolean(rangeEnd) &&
            String(cashFlow.incomeTaxPaidAmount).trim() !== "" &&
            String(cashFlow.openingCashBalance).trim() !== "" &&
            String(cashFlow.cashInHandAmount).trim() !== ""
        );
    }, [
        isLocked,
        rangeEnd,
        cashFlow.incomeTaxPaidAmount,
        cashFlow.openingCashBalance,
        cashFlow.cashInHandAmount,
    ]);

    const submitCashFlow = useCallback(async () => {
        try {
            if (!rangeEnd) {
                toast.error("Please select End Date before saving Cash Flow data.");
                return;
            }

            if (isLocked) {
                toast.info("Cash Flow data already exists for this period.");
                return;
            }

            if (!canSubmit) {
                toast.error("Please fill all required fields.");
                return;
            }

            setIsSaving(true);

            await axiosApi.post("/admin/cashFlow", cashFlow);

            toast.success("Cash Flow data successfully saved");

            await fetchExistingCashFlow();
        } catch (error) {
            console.log(error);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save Cash Flow data"
            );
        } finally {
            setIsSaving(false);
        }
    }, [rangeEnd, isLocked, canSubmit, cashFlow, fetchExistingCashFlow]);

    return (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-gray-900">Cash Flow Data</h3>
                <p className="text-xs text-gray-500">
                    Enter values and save them for the selected period.
                </p>

                {rangeStart && rangeEnd && (
                    <p className="mt-1 text-[11px] text-gray-500">
                        Period:{" "}
                        <span className="font-semibold text-gray-800">
                            {rangeStart} → {rangeEnd}
                        </span>
                    </p>
                )}

                {isCheckingExisting && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <div className="h-4 w-4 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
                        Checking existing Cash Flow data...
                    </div>
                )}

                {isLocked && (
                    <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                        Cash Flow data already exists for this period. Editing and saving are disabled.
                    </div>
                )}

                {!rangeEnd && (
                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Select an End Date to save Cash Flow data.
                    </div>
                )}
            </div>

            <div className="mt-4 grid gap-4">
                <div>
                    <Label htmlFor="incomeTaxPaidAmount">
                        Income Tax Paid Amount<span className="text-red-500">*</span>
                    </Label>
                    <input
                        id="incomeTaxPaidAmount"
                        type="text"
                        inputMode="decimal"
                        name="incomeTaxPaidAmount"
                        value={cashFlow.incomeTaxPaidAmount}
                        onChange={handleCFChange}
                        placeholder="0.00"
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                        disabled={isSaving || isLocked || isCheckingExisting}
                    />
                </div>

                <div>
                    <Label htmlFor="openingCashBalance">
                        Cash & Cash Equivalents at the Beginning of the Period
                        <span className="text-red-500">*</span>
                    </Label>
                    <input
                        id="openingCashBalance"
                        type="text"
                        inputMode="decimal"
                        name="openingCashBalance"
                        value={cashFlow.openingCashBalance}
                        onChange={handleCFChange}
                        placeholder="0.00"
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                        disabled={isSaving || isLocked || isCheckingExisting}
                    />
                </div>

                <div>
                    <Label htmlFor="cashInHandAmount">
                        Cash in Hand<span className="text-red-500">*</span>
                    </Label>
                    <input
                        id="cashInHandAmount"
                        type="text"
                        inputMode="decimal"
                        name="cashInHandAmount"
                        value={cashFlow.cashInHandAmount}
                        onChange={handleCFChange}
                        placeholder="0.00"
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                        disabled={isSaving || isLocked || isCheckingExisting}
                    />
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={clearCashFlowInputs}
                        disabled={isSaving || isLocked || isCheckingExisting}
                        className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Clear
                    </button>

                    <button
                        type="button"
                        onClick={submitCashFlow}
                        disabled={isSaving || isLocked || isCheckingExisting || !canSubmit}
                        className="w-full sm:w-auto rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cashflow;