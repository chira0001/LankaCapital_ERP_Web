import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axiosAPI from "@/api/axiosAPI";

const Salary = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
    const [salaryList, setSalaryList] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    const cacheRef = useRef(new Map()); // "YYYY-MM" -> list
    const abortRef = useRef(null);

    const months = useMemo(
        () => [
            { value: 0, label: "January" },
            { value: 1, label: "February" },
            { value: 2, label: "March" },
            { value: 3, label: "April" },
            { value: 4, label: "May" },
            { value: 5, label: "June" },
            { value: 6, label: "July" },
            { value: 7, label: "August" },
            { value: 8, label: "September" },
            { value: 9, label: "October" },
            { value: 10, label: "November" },
            { value: 11, label: "December" },
        ],
        []
    );

    const formatMoney = useCallback((value) => {
        const n = Number(value);
        if (Number.isNaN(n)) return "—";
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 2,
        }).format(n);
    }, []);

    const buildYearMonth = useCallback((yearStr, monthIndex) => {
        const year = String(yearStr ?? "").trim();
        if (!/^\d{4}$/.test(year)) return null;
        const month = String((Number(monthIndex) || 0) + 1).padStart(2, "0");
        return `${year}-${month}`;
    }, []);

    const fetchSalaries = useCallback(
        async ({ year = selectedYear, month = selectedMonth, force = false } = {}) => {
            const yearMonth = buildYearMonth(year, month);
            if (!yearMonth) return;

            // Cache hit -> return immediately unless forced refresh
            if (!force && cacheRef.current.has(yearMonth)) {
                setSalaryList(cacheRef.current.get(yearMonth) || []);
                return;
            }

            // Cancel previous request
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            try {
                setIsFetching(true);

                const res = await axiosAPI.get("/admin/salary", {
                    params: { yearMonth },
                    signal: controller.signal,
                });

                const data = Array.isArray(res.data) ? res.data : [];
                cacheRef.current.set(yearMonth, data);
                setSalaryList(data);
            } catch (error) {
                if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;

                toast.error(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to fetch salary details"
                );
                setSalaryList([]);
            } finally {
                if (abortRef.current === controller) setIsFetching(false);
            }
        },
        [buildYearMonth, selectedMonth, selectedYear]
    );

    const approveSalaries = useCallback(async () => {
        const yearMonth = buildYearMonth(selectedYear, selectedMonth);
        if (!yearMonth) {
            toast.error("Invalid year/month");
            return;
        }
        if (isApproving) return;
        if (!salaryList?.length) {
            toast.error("No salary records to approve");
            return;
        }
        if (salaryList[0]?.status !== "PENDING") {
            toast.info("Salary is not in PENDING state");
            return;
        }

        try {
            setIsApproving(true);

            const res = await axiosAPI.put(
                "/admin/salary",
                {},
                {
                    params: {
                        yearMonth: yearMonth,
                    },
                }
            );

            toast.success(res?.data || "Salary Approved Successfully");

            // invalidate cache and refetch
            cacheRef.current.delete(yearMonth);
            await fetchSalaries({ force: true });
        } catch (error) {
            toast.error(
                error?.response?.data?.message || error?.message || "Failed to approve salary"
            );
        } finally {
            setIsApproving(false);
        }
    }, [buildYearMonth, fetchSalaries, isApproving, salaryList, selectedMonth, selectedYear]);

    // fetch on month/year changes (debounced)
    useEffect(() => {
        const t = setTimeout(() => fetchSalaries(), 300);
        return () => clearTimeout(t);
    }, [fetchSalaries, selectedMonth, selectedYear]);

    // cleanup in-flight request on unmount
    useEffect(() => {
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    const headerRow = salaryList?.[0] || null;
    const status = headerRow?.status;
    const enteredByName = headerRow?.enteredEmployeeName;
    const enteredByNic = headerRow?.enteredEmployeeNIC;
    const approvedByName = headerRow?.approvedEmployeeName;
    const approvedByNic = headerRow?.approvedEmployeeNIC;

    const yearMonthLabel = useMemo(() => {
        const ym = buildYearMonth(selectedYear, selectedMonth);
        if (!ym) return "—";
        const m = months.find((x) => x.value === selectedMonth)?.label || "—";
        return `${m} ${selectedYear}`;
    }, [buildYearMonth, months, selectedMonth, selectedYear]);

    const statusBadge = useMemo(() => {
        const s = (status || "").toUpperCase();
        if (s === "PENDING") return "bg-amber-50 text-amber-800 border-amber-200";
        if (s === "APPROVED") return "bg-emerald-50 text-emerald-800 border-emerald-200";
        return "bg-slate-50 text-slate-700 border-slate-200";
    }, [status]);

    return (
        <div className="min-h-screen w-full bg-gray-50 p-3 sm:p-4">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="mx-auto max-w-[1600px]">
                {/* Header */}
                <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 sm:text-xs">
                            Salary overview
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                            Employee Salary
                        </h1>
                        <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                            Review employee salary payment records.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                            Selected period
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900 sm:text-base">
                            {yearMonthLabel}
                        </p>
                    </div>
                </div>

                {/* Controls + Meta */}
                <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Inputs */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-end lg:gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-600">Year</label>
                                <input
                                    type="text"
                                    name="year"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                    placeholder="YYYY"
                                    inputMode="numeric"
                                />
                                <p className="text-[11px] text-gray-400">Enter 4-digit year</p>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-600">Month</label>
                                <select
                                    name="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                >
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-gray-400">Auto refresh on change</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={() => fetchSalaries({ force: true })}
                                disabled={isFetching}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                {isFetching ? "Fetching..." : "Refresh"}
                            </button>

                            {status === "PENDING" && (
                                <button
                                    type="button"
                                    onClick={approveSalaries}
                                    disabled={isApproving || !salaryList.length}
                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50"
                                >
                                    {isApproving ? "Approving..." : "Approve"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Meta chips */}
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        {status && (
                            <span
                                className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold ${statusBadge}`}
                            >
                                Status: {status}
                            </span>
                        )}

                        {enteredByName && (
                            <span className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                                Entered by: {enteredByName}
                                {enteredByNic ? ` (${enteredByNic})` : ""}
                            </span>
                        )}

                        {approvedByName && (
                            <span className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                                Approved by: {approvedByName}
                                {approvedByNic ? ` (${approvedByNic})` : ""}
                            </span>
                        )}

                        {!salaryList.length && !isFetching && (
                            <span className="text-xs text-gray-500">
                                No records available for this period.
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {/* Desktop / Tablet Table */}
                    <div className="hidden md:block">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1200px] w-full border-collapse">
                                <thead className="sticky top-0 z-10 bg-slate-50 border-b text-[11px] uppercase text-slate-500">
                                    <tr>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            Name & NIC
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            Basic Salary
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            Working Days
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" colSpan={3}>
                                            Allowance
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" colSpan={2}>
                                            Over Time
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            Travel & Fuel
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            Gross Salary
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            Unpaid Leave
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            Salary Advance
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" colSpan={2}>
                                            EPF
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            ETF 3%
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            Total Salary
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            Total Deduction
                                        </th>
                                        <th className="border border-slate-200 px-4 py-3 text-center" rowSpan={2}>
                                            Net Salary
                                        </th>
                                    </tr>

                                    <tr className="border-t border-slate-200">
                                        <th className="border border-slate-200 px-4 py-3 text-center">Incentives</th>
                                        <th className="border border-slate-200 px-4 py-3 text-center">Sales</th>
                                        <th className="border border-slate-200 px-4 py-3 text-center">Attendance</th>
                                        <th className="border border-slate-200 px-4 py-3 text-center">Hours</th>
                                        <th className="border border-slate-200 px-4 py-3 text-center">Pay</th>
                                        <th className="border border-slate-200 px-4 py-3 text-center">8%</th>
                                        <th className="border border-slate-200 px-4 py-3 text-center">12%</th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm">
                                    {salaryList.length > 0 ? (
                                        salaryList.map((row, key) => (
                                            <tr key={key} className="hover:bg-gray-50">
                                                <td className="border border-slate-200 px-4 py-3">
                                                    <div className="text-xs font-semibold text-gray-900">{row.name}</div>
                                                    <div className="text-xs text-gray-500">{row.nic}</div>
                                                </td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.basicSalary)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{row.workingDays ?? "—"}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.incentives)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.sales)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.attendance)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{row.hours ?? "—"}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.pay)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.travelFuel ?? 0)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.grossSalary)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.unpaidLeaves)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.salaryAdvance)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.employeeEPF)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.companyEPF)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.companyETF)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.totalSalary)}</td>
                                                <td className="border border-slate-200 px-4 py-3">{formatMoney(row.totalDeduction)}</td>
                                                <td className="border border-slate-200 px-4 py-3 font-bold text-gray-900">
                                                    {formatMoney(row.netSalary)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="border border-slate-200 px-6 py-10 text-center text-gray-500" colSpan={18}>
                                                {isFetching ? "Fetching records..." : "No records found"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden">
                        <div className="p-4 border-b bg-gray-50">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Salary records
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-900">
                                {salaryList.length} {salaryList.length === 1 ? "employee" : "employees"}
                            </p>
                        </div>

                        {salaryList.length > 0 ? (
                            <div className="divide-y">
                                {salaryList.map((row, idx) => (
                                    <div key={idx} className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {row.name || "—"}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500 break-all">
                                                    {row.nic || "—"}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-[11px] text-gray-500">Net Salary</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {formatMoney(row.netSalary)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                                <p className="text-gray-500">Gross</p>
                                                <p className="mt-1 font-semibold text-gray-900">
                                                    {formatMoney(row.grossSalary)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                                <p className="text-gray-500">Total Deduction</p>
                                                <p className="mt-1 font-semibold text-gray-900">
                                                    {formatMoney(row.totalDeduction)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                                <p className="text-gray-500">Working Days</p>
                                                <p className="mt-1 font-semibold text-gray-900">
                                                    {row.workingDays ?? "—"}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                                                <p className="text-gray-500">OT (Hours / Pay)</p>
                                                <p className="mt-1 font-semibold text-gray-900">
                                                    {row.hours ?? "—"} / {formatMoney(row.pay)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Details without changing functionality */}
                                        <details className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                            <summary className="cursor-pointer text-xs font-semibold text-gray-700">
                                                View breakdown
                                            </summary>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-700">
                                                <div>Basic: <span className="font-semibold">{formatMoney(row.basicSalary)}</span></div>
                                                <div>Total Salary: <span className="font-semibold">{formatMoney(row.totalSalary)}</span></div>
                                                <div>Incentives: <span className="font-semibold">{formatMoney(row.incentives)}</span></div>
                                                <div>Sales: <span className="font-semibold">{formatMoney(row.sales)}</span></div>
                                                <div>Attendance: <span className="font-semibold">{formatMoney(row.attendance)}</span></div>
                                                <div>Travel & Fuel: <span className="font-semibold">{formatMoney(row.travelFuel ?? 0)}</span></div>
                                                <div>Unpaid Leaves: <span className="font-semibold">{formatMoney(row.unpaidLeaves)}</span></div>
                                                <div>Salary Advance: <span className="font-semibold">{formatMoney(row.salaryAdvance)}</span></div>
                                                <div>EPF (Emp): <span className="font-semibold">{formatMoney(row.employeeEPF)}</span></div>
                                                <div>EPF (Comp): <span className="font-semibold">{formatMoney(row.companyEPF)}</span></div>
                                                <div>ETF (Comp): <span className="font-semibold">{formatMoney(row.companyETF)}</span></div>
                                            </div>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-sm text-gray-500">
                                {isFetching ? "Fetching records..." : "No records found"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Small mobile-friendly bottom spacing */}
                <div className="h-6" />
            </div>
        </div>
    );
};

export default Salary;