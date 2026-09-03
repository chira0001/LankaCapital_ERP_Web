import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosApi from "../../api/axiosAPI.js";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";

const ASSETS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const FinancialStatementNotes = ({
    periodStartDate,
    periodEndDate,
    startDate,
    endDate,
}) => {
    const rangeStart = periodStartDate ?? startDate;
    const rangeEnd = periodEndDate ?? endDate;

    // assets list
    const [existingAssets, setExistingAssets] = useState([]);
    const [isAssetsLoading, setIsAssetsLoading] = useState(false);

    // per-asset inputs (controlled)
    // { [assetId]: { openingBalance: "", depreciationBalance: "" } }
    const [notesByAsset, setNotesByAsset] = useState({});

    const [isSaving, setIsSaving] = useState(false);

    // in-memory cache + request cancel
    const assetsCacheRef = useRef({ timestamp: 0, data: null });
    const abortRef = useRef(null);

    // Balance-at date: (endDate - 1 year + 1 day)
    // Backend expects LocalDate => send "YYYY-MM-DD"
    const balanceAtISO = useMemo(() => {
        if (!rangeEnd) return "";
        return dayjs(rangeEnd).subtract(1, "year").add(1, "day").format("YYYY-MM-DD");
    }, [rangeEnd]);

    const openingDateLabel = useMemo(() => {
        if (!rangeEnd) return "—";
        return dayjs(rangeEnd).subtract(1, "year").add(1, "day").format("DD MMM YYYY");
    }, [rangeEnd]);

    const fetchAssets = useCallback(async ({ force = false } = {}) => {
        // Serve from cache if valid
        if (!force && assetsCacheRef.current.data) {
            const isValid = Date.now() - assetsCacheRef.current.timestamp < ASSETS_CACHE_TTL;
            if (isValid) {
                setExistingAssets(
                    Array.isArray(assetsCacheRef.current.data) ? assetsCacheRef.current.data : []
                );
                return;
            }
        }

        // cancel previous request
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setIsAssetsLoading(true);

            const res = await axiosApi.get("/admin/assets", { signal: controller.signal });
            const data = Array.isArray(res.data) ? res.data : [];

            setExistingAssets(data);

            assetsCacheRef.current = {
                timestamp: Date.now(),
                data,
            };
        } catch (error) {
            if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;

            console.log(error);
            toast.error(
                error?.response?.data?.message || error?.message || "Failed to load assets"
            );
            setExistingAssets([]);
        } finally {
            if (abortRef.current === controller) setIsAssetsLoading(false);
        }
    }, []);

    // Fetch assets on mount and when period changes (keeps your original intent)
    useEffect(() => {
        fetchAssets();
    }, [fetchAssets, rangeStart, rangeEnd]);

    // cleanup
    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    const handleInputChange = useCallback((e, assetId) => {
        const { name, value } = e.target;

        setNotesByAsset((prev) => ({
            ...prev,
            [assetId]: {
                ...(prev[assetId] || { openingBalance: "", depreciationBalance: "" }),
                [name]: value,
            },
        }));
    }, []);

    const clearInfo = useCallback(() => {
        setNotesByAsset({});
    }, []);

    const hasAnyInput = useMemo(() => {
        return Object.values(notesByAsset).some(
            (v) =>
                String(v?.openingBalance ?? "").trim() !== "" ||
                String(v?.depreciationBalance ?? "").trim() !== ""
        );
    }, [notesByAsset]);

    const saveInfo = useCallback(async () => {
        try {
            if (!rangeEnd) {
                toast.error("Please select an End Date before saving.");
                return;
            }

            if (!hasAnyInput) {
                toast.error("Please enter at least one value before saving.");
                return;
            }

            // ✅ Build List<FinancialNoteDataDto> as backend expects
            const dtoList = Object.entries(notesByAsset)
                .map(([assetId, values]) => {
                    const openingBalanceRaw = String(values?.openingBalance ?? "").trim();
                    const depreciationRaw = String(values?.depreciationBalance ?? "").trim();

                    // skip assets with no values
                    if (!openingBalanceRaw && !depreciationRaw) return null;

                    return {
                        financialDate: rangeEnd,         // LocalDate (ISO)
                        balanceAtDate: balanceAtISO,     // LocalDate (ISO)
                        openingBalance: openingBalanceRaw === "" ? 0 : Number(openingBalanceRaw),
                        depreciationBalance: depreciationRaw === "" ? 0 : Number(depreciationRaw),
                        assetId: Number(assetId),
                    };
                })
                .filter(Boolean);

            if (dtoList.length === 0) {
                toast.error("Please enter at least one value before saving.");
                return;
            }

            setIsSaving(true);
            console.log("dtoList : ", dtoList)
            // ✅ Correct endpoint + correct payload type
            await axiosApi.post("/admin/financialNotes", dtoList);

            toast.success("Data saved successfully");

            // clear inputs after save (improves UX; does not change backend behavior)
            clearInfo();
        } catch (error) {
            console.log(error);
            toast.error(
                error?.response?.data?.message || error?.message || "Failed to save data"
            );
        } finally {
            setIsSaving(false);
        }
    }, [rangeEnd, balanceAtISO, hasAnyInput, notesByAsset, clearInfo]);

    const TableSkeleton = () => (
        <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="h-10 w-full rounded bg-gray-50 border border-gray-100 animate-pulse"
                />
            ))}
        </div>
    );

    return (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-gray-900">
                    Notes to the Financial Statement (P10)
                </h3>
                <p className="text-xs text-gray-500">
                    Enter opening balances for each asset and save for the selected period.
                </p>

                {rangeStart && rangeEnd && (
                    <p className="mt-1 text-[11px] text-gray-500">
                        Period:{" "}
                        <span className="font-semibold text-gray-800">
                            {rangeStart} → {rangeEnd}
                        </span>
                    </p>
                )}
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-[980px] w-full border-collapse text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                            <th className="border border-gray-200 px-4 py-3 text-left">Asset Name</th>
                            <th className="border border-gray-200 px-4 py-3 text-left">Purchased Date</th>
                            <th className="border border-gray-200 px-4 py-3 text-left">Value</th>
                            <th className="border border-gray-200 px-4 py-3 text-left">
                                {`Balance at ${openingDateLabel}`}
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-left">
                                {`Accumulated Depreciation Balance at ${openingDateLabel}`}
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {isAssetsLoading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                Loading assets...
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Please wait while we fetch the latest data.
                                            </p>
                                        </div>
                                    </div>
                                    <TableSkeleton />
                                </td>
                            </tr>
                        ) : existingAssets.length > 0 ? (
                            existingAssets.map((asset) => {
                                const purchased =
                                    asset?.purchasedDate || asset?.purchasedMonth || asset?.purchasedMonthDate;

                                const openingBalance = notesByAsset?.[asset.id]?.openingBalance ?? "";
                                const depreciationBalance =
                                    notesByAsset?.[asset.id]?.depreciationBalance ?? "";

                                return (
                                    <tr key={asset.id} className="border-t hover:bg-gray-50">
                                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                                            {asset.assetName ?? "—"}
                                        </td>

                                        <td className="border border-gray-200 px-4 py-3 text-gray-700 whitespace-nowrap">
                                            {purchased ? dayjs(purchased).format("DD MMM YYYY") : "—"}
                                        </td>

                                        <td className="border border-gray-200 px-4 py-3 text-gray-700 whitespace-nowrap">
                                            {asset.amount ?? "—"}
                                        </td>

                                        <td className="border border-gray-200 px-4 py-3">
                                            <input
                                                type="text"
                                                name="openingBalance"
                                                value={openingBalance}
                                                onChange={(e) => handleInputChange(e, asset.id)}
                                                placeholder="0.00"
                                                disabled={isSaving}
                                                className="w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                                            />
                                        </td>

                                        <td className="border border-gray-200 px-4 py-3">
                                            <input
                                                type="text"
                                                name="depreciationBalance"
                                                value={depreciationBalance}
                                                onChange={(e) => handleInputChange(e, asset.id)}
                                                placeholder="0.00"
                                                disabled={isSaving}
                                                className="w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No assets found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={clearInfo}
                    disabled={isSaving}
                    className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                    Clear
                </button>

                <button
                    type="button"
                    onClick={saveInfo}
                    disabled={isSaving || !hasAnyInput}
                    className="w-full sm:w-auto rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
};

export default FinancialStatementNotes;