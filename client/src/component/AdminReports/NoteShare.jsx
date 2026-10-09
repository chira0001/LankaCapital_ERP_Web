import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosApi from "@/api/axiosAPI";
import { Button } from "@/component/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Label } from "@/component/ui/label";

const NoteShare = ({ periodStartDate, periodEndDate, startDate, endDate }) => {
    const rangeStart = periodStartDate ?? startDate;
    const rangeEnd = periodEndDate ?? endDate;

    const [isSaving, setIsSaving] = useState(false);

    const [sharesPayload, setSharesPayload] = useState({
        numberOfShares: "",
        financialDate: rangeEnd,
    });

    // existing record (lock)
    const [isCheckingExisting, setIsCheckingExisting] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // perf: cache + abort
    const cacheRef = useRef(new Map()); // key: financialDate -> { exists, data }
    const abortRef = useRef(null);

    // keep financialDate synced
    useEffect(() => {
        setSharesPayload((prev) => ({ ...prev, financialDate: rangeEnd }));
    }, [rangeEnd]);

    const canSubmit = useMemo(() => {
        if (!rangeEnd) return false;
        if (isLocked) return false;
        const v = String(sharesPayload.numberOfShares ?? "").trim();
        return v !== "" && /^\d+$/.test(v);
    }, [rangeEnd, isLocked, sharesPayload.numberOfShares]);

    const fetchExisting = useCallback(async () => {
        if (!rangeEnd) {
            setIsLocked(false);
            return;
        }

        // serve from cache
        if (cacheRef.current.has(rangeEnd)) {
            const cached = cacheRef.current.get(rangeEnd);
            if (cached?.exists) {
                setIsLocked(true);
                setSharesPayload((prev) => ({
                    ...prev,
                    financialDate: rangeEnd,
                    numberOfShares: String(cached.data?.numberOfShares ?? ""),
                }));
            } else {
                setIsLocked(false);
                setSharesPayload((prev) => ({
                    ...prev,
                    financialDate: rangeEnd,
                    numberOfShares: "",
                }));
            }
            return;
        }

        // cancel previous
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setIsCheckingExisting(true);

            const res = await axiosApi.get("/admin/shares", {
                params: { financialDate: rangeEnd },
                signal: controller.signal,
            });

            // expected: either null/empty or an object { financialDate, numberOfShares }
            const data = res.data;

            const exists =
                data &&
                typeof data === "object" &&
                Object.keys(data).length > 0 &&
                data.numberOfShares !== null &&
                data.numberOfShares !== undefined;

            cacheRef.current.set(rangeEnd, { exists, data });

            if (exists) {
                setIsLocked(true);
                setSharesPayload((prev) => ({
                    ...prev,
                    financialDate: rangeEnd,
                    numberOfShares: String(data.numberOfShares ?? ""),
                }));
            } else {
                setIsLocked(false);
                setSharesPayload((prev) => ({
                    ...prev,
                    financialDate: rangeEnd,
                    numberOfShares: "",
                }));
            }
        } catch (error) {
            if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;

            console.error(error);
            // don’t lock on error; allow user to continue
            setIsLocked(false);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to check existing shares data"
            );
        } finally {
            if (abortRef.current === controller) setIsCheckingExisting(false);
        }
    }, [rangeEnd]);

    useEffect(() => {
        fetchExisting();
    }, [fetchExisting]);

    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        // numeric-only UX (no decimals, no negative)
        if (name === "numberOfShares") {
            if (value !== "" && !/^\d+$/.test(value)) return;
        }

        setSharesPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const clear = useCallback(() => {
        if (isLocked) return;
        setSharesPayload((prev) => ({
            ...prev,
            numberOfShares: "",
            financialDate: rangeEnd,
        }));
    }, [isLocked, rangeEnd]);

    const submitData = useCallback(async () => {
        try {
            if (!rangeEnd) {
                toast.error("Please select End Date before saving.");
                return;
            }
            if (isLocked) {
                toast.info("Shares data already exists for this period.");
                return;
            }
            if (!canSubmit) {
                toast.error("Please enter a valid Number of Shares.");
                return;
            }

            setIsSaving(true);

            const payloadToSend = {
                financialDate: rangeEnd,
                numberOfShares: Number(sharesPayload.numberOfShares),
            };

            const res = await axiosApi.post("/admin/shares", payloadToSend);

            toast.success(res?.data || "Successfully submitted the data");

            // Invalidate cache for this date and refetch to lock UI
            cacheRef.current.delete(rangeEnd);
            await fetchExisting();
        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message || error?.message || "Failed to save shares"
            );
        } finally {
            setIsSaving(false);
        }
    }, [canSubmit, fetchExisting, isLocked, rangeEnd, sharesPayload.numberOfShares]);

    return (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-gray-900">
                    Notes to the financial statement - Shares (P11)
                </h3>
                <p className="text-xs text-gray-500">
                    Enter the number of shares and save it for the selected period.
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
                        Checking existing shares data...
                    </div>
                )}

                {isLocked && (
                    <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                        Shares data already exists for this period. Editing and saving are disabled.
                    </div>
                )}
            </div>

            <div className="mt-4">
                <Label htmlFor="numberOfShares">Number of Shares</Label>
                <input
                    id="numberOfShares"
                    type="text"
                    inputMode="numeric"
                    name="numberOfShares"
                    value={sharesPayload.numberOfShares}
                    onChange={handleChange}
                    disabled={isSaving || isLocked || isCheckingExisting}
                    placeholder="e.g. 1000"
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
    );
};

export default NoteShare;