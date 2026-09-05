import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosApi from "@/api/axiosAPI";
import { Button } from "@/component/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Label } from "@/component/ui/label";
import dayjs from "dayjs";

const IncomeTax = ({ periodStartDate, periodEndDate, startDate, endDate }) => {
    const rangeStart = periodStartDate ?? startDate;
    const rangeEnd = periodEndDate ?? endDate;

    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isCheckingExisting, setIsCheckingExisting] = useState(false);

    // store input as strings for better UX; convert to numbers at submit
    const [incomeTaxPayload, setIncomeTaxPayload] = useState({
        financialDate: rangeEnd,
        withholdingAmount: "",
        balanceBFDate: rangeStart,
        balanceBFAmount: "",
        investmentIncome: "",
        businessIncome: "",
    });

    // perf: cache + abort
    const cacheRef = useRef(new Map()); // key: financialDate -> { exists, data }
    const abortRef = useRef(null);

    // Sync dates when parent date range changes
    useEffect(() => {
        setIncomeTaxPayload((prev) => ({
            ...prev,
            financialDate: rangeEnd,
            balanceBFDate: rangeStart,
        }));
    }, [rangeEnd, rangeStart]);

    const isValidMoneyInput = useCallback((value) => {
        // allow empty, integers, decimals up to 2 dp
        if (value === "") return true;
        return /^(0|[1-9]\d*)(\.\d{0,2})?$/.test(value);
    }, []);

    const handleChange = useCallback(
        (e) => {
            const { name, value } = e.target;

            // numeric validation for money fields
            const moneyFields = [
                "withholdingAmount",
                "balanceBFAmount",
                "investmentIncome",
                "businessIncome",
            ];
            if (moneyFields.includes(name) && !isValidMoneyInput(value)) return;

            setIncomeTaxPayload((prev) => ({
                ...prev,
                [name]: value,
            }));
        },
        [isValidMoneyInput]
    );

    const canSubmit = useMemo(() => {
        if (!rangeStart || !rangeEnd) return false;
        if (isLocked) return false;

        // require all 4 amounts (same fields you show as required in UI)
        const required = [
            incomeTaxPayload.withholdingAmount,
            incomeTaxPayload.balanceBFAmount,
            incomeTaxPayload.investmentIncome,
            incomeTaxPayload.businessIncome,
        ];

        return required.every((v) => String(v ?? "").trim() !== "");
    }, [
        rangeStart,
        rangeEnd,
        isLocked,
        incomeTaxPayload.withholdingAmount,
        incomeTaxPayload.balanceBFAmount,
        incomeTaxPayload.investmentIncome,
        incomeTaxPayload.businessIncome,
    ]);

    const clear = useCallback(() => {
        if (isLocked) return;
        setIncomeTaxPayload({
            financialDate: rangeEnd,
            withholdingAmount: "",
            balanceBFDate: rangeStart,
            balanceBFAmount: "",
            investmentIncome: "",
            businessIncome: "",
        });
    }, [isLocked, rangeEnd, rangeStart]);

    // GET existing record by financialDate; lock if found
    const fetchExisting = useCallback(async () => {
        if (!rangeEnd) {
            setIsLocked(false);
            return;
        }

        // cache hit
        if (cacheRef.current.has(rangeEnd)) {
            const cached = cacheRef.current.get(rangeEnd);
            if (cached?.exists) {
                const data = cached.data;
                setIsLocked(true);
                setIncomeTaxPayload((prev) => ({
                    ...prev,
                    financialDate: rangeEnd,
                    balanceBFDate: data?.balanceBFDate ?? rangeStart,
                    withholdingAmount: data?.withholdingAmount?.toString?.() ?? "",
                    balanceBFAmount: data?.balanceBFAmount?.toString?.() ?? "",
                    investmentIncome: data?.investmentIncome?.toString?.() ?? "",
                    businessIncome: data?.businessIncome?.toString?.() ?? "",
                }));
            } else {
                setIsLocked(false);
            }
            return;
        }

        // cancel previous
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setIsCheckingExisting(true);

            const res = await axiosApi.get("/admin/incomeTax", {
                params: { financialDate: rangeEnd },
                signal: controller.signal,
            });

            const data = res.data;
            const exists =
                data &&
                typeof data === "object" &&
                Object.keys(data).length > 0 &&
                data.financialDate;

            cacheRef.current.set(rangeEnd, { exists, data });

            if (exists) {
                setIsLocked(true);
                setIncomeTaxPayload((prev) => ({
                    ...prev,
                    financialDate: rangeEnd,
                    balanceBFDate: data?.balanceBFDate ?? rangeStart,
                    withholdingAmount: data?.withholdingAmount?.toString?.() ?? "",
                    balanceBFAmount: data?.balanceBFAmount?.toString?.() ?? "",
                    investmentIncome: data?.investmentIncome?.toString?.() ?? "",
                    businessIncome: data?.businessIncome?.toString?.() ?? "",
                }));
            } else {
                setIsLocked(false);
                // keep user draft; do not wipe automatically
            }
        } catch (error) {
            if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;

            console.error(error);
            setIsLocked(false);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to check existing Income Tax data"
            );
        } finally {
            if (abortRef.current === controller) setIsCheckingExisting(false);
        }
    }, [rangeEnd, rangeStart]);

    useEffect(() => {
        fetchExisting();
    }, [fetchExisting]);

    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    const submitData = useCallback(async () => {
        try {
            if (!rangeStart || !rangeEnd) {
                toast.error("Please select Start Date and End Date before saving.");
                return;
            }
            if (isLocked) {
                toast.info("Income Tax data already exists for this period.");
                return;
            }
            if (!canSubmit) {
                toast.error("Please fill all required fields.");
                return;
            }

            setIsSaving(true);

            const payloadToSend = {
                financialDate: rangeEnd,
                balanceBFDate: rangeStart,
                withholdingAmount: Number(incomeTaxPayload.withholdingAmount),
                balanceBFAmount: Number(incomeTaxPayload.balanceBFAmount),
                investmentIncome: Number(incomeTaxPayload.investmentIncome),
                businessIncome: Number(incomeTaxPayload.businessIncome),
            };

            const res = await axiosApi.post("/admin/incomeTax", payloadToSend);

            toast.success(res?.data || "Successfully saved the data");

            // invalidate cache for this date then refetch => will lock UI
            cacheRef.current.delete(rangeEnd);
            await fetchExisting();
        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save Income Tax data"
            );
        } finally {
            setIsSaving(false);
        }
    }, [
        rangeStart,
        rangeEnd,
        isLocked,
        canSubmit,
        incomeTaxPayload.withholdingAmount,
        incomeTaxPayload.balanceBFAmount,
        incomeTaxPayload.investmentIncome,
        incomeTaxPayload.businessIncome,
        fetchExisting,
    ]);

    const bfYearLabel = useMemo(() => {
        if (!rangeStart) return "";
        return `${dayjs(rangeStart).subtract(1, "year").format("YYYY")}/${dayjs(rangeStart).format("YYYY")}`;
    }, [rangeStart]);

    return (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-gray-900">
                    Notes to the financial statement - Income Tax
                </h3>
                <p className="text-xs text-gray-500">
                    Enter the values and save them for the selected period.
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
                        Checking existing income tax data...
                    </div>
                )}

                {isLocked && (
                    <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                        Income Tax data already exists for this period. Editing and saving are disabled.
                    </div>
                )}
            </div>

            <div className="mt-4 space-y-4">
                <div>
                    <Label htmlFor="withholdingAmount">
                        Exempt Amounts, Final Withholding Payments & Other Sources
                        <span className="text-red-500">*</span>
                    </Label>
                    <input
                        id="withholdingAmount"
                        type="text"
                        inputMode="decimal"
                        name="withholdingAmount"
                        value={incomeTaxPayload.withholdingAmount}
                        onChange={handleChange}
                        disabled={isSaving || isLocked || isCheckingExisting}
                        placeholder="0.00"
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                </div>

                <div>
                    <Label htmlFor="balanceBFAmount">
                        Brought Forward from {bfYearLabel}
                        <span className="text-red-500">*</span>
                    </Label>
                    <input
                        id="balanceBFAmount"
                        type="text"
                        inputMode="decimal"
                        name="balanceBFAmount"
                        value={incomeTaxPayload.balanceBFAmount}
                        onChange={handleChange}
                        disabled={isSaving || isLocked || isCheckingExisting}
                        placeholder="0.00"
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                </div>

                <div>
                    <Label htmlFor="investmentIncome">
                        Deducted against Investment Income
                        <span className="text-red-500">*</span>
                    </Label>
                    <input
                        id="investmentIncome"
                        type="text"
                        inputMode="decimal"
                        name="investmentIncome"
                        value={incomeTaxPayload.investmentIncome}
                        onChange={handleChange}
                        disabled={isSaving || isLocked || isCheckingExisting}
                        placeholder="0.00"
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                </div>

                <div>
                    <Label htmlFor="businessIncome">
                        Deducted against Business Income
                        <span className="text-red-500">*</span>
                    </Label>
                    <input
                        id="businessIncome"
                        type="text"
                        inputMode="decimal"
                        name="businessIncome"
                        value={incomeTaxPayload.businessIncome}
                        onChange={handleChange}
                        disabled={isSaving || isLocked || isCheckingExisting}
                        placeholder="0.00"
                        className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                </div>

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        onClick={clear}
                        className="w-full sm:w-auto bg-white text-black border border-black"
                        disabled={isSaving || isLocked || isCheckingExisting}
                    >
                        Clear
                    </Button>

                    <Button
                        type="button"
                        onClick={submitData}
                        className="w-full sm:w-auto"
                        disabled={isSaving || isLocked || isCheckingExisting || !canSubmit}
                    >
                        {isSaving ? "Saving..." : "Save Data"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default IncomeTax;