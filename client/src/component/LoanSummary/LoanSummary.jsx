import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosAPI from "@/api/axiosAPI";
import { ToastContainer } from "react-toastify";

const formatLKR = (amount) =>
    new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
    }).format(Number(amount) || 0);

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
        ? "—"
        : parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
};

const LoanSummary = () => {
    const role = localStorage.getItem("role") || "";

    const mainRowsPerPage = 10;
    const paymentRowsPerPage = 10;

    const [currentPage, setCurrentPage] = useState(1);
    const [paymentPage, setPaymentPage] = useState(1);
    const [expandedPaymentKey, setExpandedPaymentKey] = useState(null);
    const [expandedLoanKey, setExpandedLoanKey] = useState(null);

    const [applicationData, setApplicationData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedApp, setSelectedApp] = useState(null); // payments (current page)
    const [selectedLoan, setSelectedLoan] = useState(null);

    // Backend pagination meta
    const [totalLoans, setTotalLoans] = useState(0);
    const [totalMainPages, setTotalMainPages] = useState(1);

    // Search (backend)
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Payments backend meta/loading
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentsTotalPages, setPaymentsTotalPages] = useState(1);
    const [paymentsTotalElements, setPaymentsTotalElements] = useState(0);

    // ✅ In-memory caching + abort controllers (like LoanApplication)
    const appsCacheRef = useRef(new Map()); // key -> { content, totalElements, totalPages }
    const appsAbortRef = useRef(null);

    const paymentsCacheRef = useRef(new Map()); // key -> { content, totalElements, totalPages }
    const paymentsAbortRef = useRef(null);

    const appsCacheKey = useMemo(() => {
        return `${role}:${currentPage}:${mainRowsPerPage}:${debouncedSearch || ""}`;
    }, [role, currentPage, mainRowsPerPage, debouncedSearch]);

    const paymentsCacheKey = useMemo(() => {
        const loanId = selectedLoan?.id ?? "";
        return `${role}:${loanId}:${paymentPage}:${paymentRowsPerPage}`;
    }, [role, selectedLoan?.id, paymentPage, paymentRowsPerPage]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
        return () => clearTimeout(t);
    }, [searchTerm]);

    useEffect(() => {
        // when search changes, go back to page 1
        setCurrentPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") closeModal();
        };

        if (selectedLoan) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "auto";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLoan]);

    const fetchApplications = useCallback(
        async ({ force = false } = {}) => {
            // ✅ cache hit
            if (!force && appsCacheRef.current.has(appsCacheKey)) {
                const cached = appsCacheRef.current.get(appsCacheKey) || {};
                setApplicationData(Array.isArray(cached.content) ? cached.content : []);
                setTotalLoans(Number(cached.totalElements) || 0);
                setTotalMainPages(Number(cached.totalPages) || 1);
                setLoading(false);
                return;
            }

            // ✅ cancel previous in-flight request
            if (appsAbortRef.current) appsAbortRef.current.abort();
            const controller = new AbortController();
            appsAbortRef.current = controller;

            setLoading(true);
            try {
                const res = await axiosAPI.get(`/${role}/loan-summary`, {
                    params: {
                        page: currentPage,
                        size: mainRowsPerPage,
                        search: debouncedSearch || "",
                    },
                    signal: controller.signal,
                });

                const data = res.data || {};
                const content = Array.isArray(data.content) ? data.content : [];

                setApplicationData(content);

                const totalElements = Number(data.totalElements) || 0;
                const totalPages = Number(data.totalPages) || 1;

                setTotalLoans(totalElements);
                setTotalMainPages(totalPages);

                appsCacheRef.current.set(appsCacheKey, {
                    content,
                    totalElements,
                    totalPages,
                });
            } catch (error) {
                if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;

                console.error("Error fetching applications:", error);
                setApplicationData([]);
                setTotalLoans(0);
                setTotalMainPages(1);
            } finally {
                if (appsAbortRef.current === controller) setLoading(false);
            }
        },
        [appsCacheKey, currentPage, debouncedSearch, mainRowsPerPage, role]
    );

    const fetchPayments = useCallback(
        async (loanId, page, { force = false } = {}) => {
            if (!loanId) return;

            const key = `${role}:${loanId}:${page}:${paymentRowsPerPage}`;

            // ✅ cache hit
            if (!force && paymentsCacheRef.current.has(key)) {
                const cached = paymentsCacheRef.current.get(key) || {};
                setSelectedApp(Array.isArray(cached.content) ? cached.content : []);
                setPaymentsTotalPages(Number(cached.totalPages) || 1);
                setPaymentsTotalElements(Number(cached.totalElements) || 0);
                setPaymentsLoading(false);
                return;
            }

            // ✅ cancel previous in-flight request
            if (paymentsAbortRef.current) paymentsAbortRef.current.abort();
            const controller = new AbortController();
            paymentsAbortRef.current = controller;

            setPaymentsLoading(true);
            try {
                const res = await axiosAPI.get(
                    `/${role}/loan-summary/${loanId}/payments`,
                    {
                        params: {
                            page,
                            size: paymentRowsPerPage,
                        },
                        signal: controller.signal,
                    }
                );

                const data = res.data || {};
                const content = Array.isArray(data.content) ? data.content : [];

                const totalElements = Number(data.totalElements) || 0;
                const totalPages = Number(data.totalPages) || 1;

                setSelectedApp(content);
                setPaymentsTotalPages(totalPages);
                setPaymentsTotalElements(totalElements);

                paymentsCacheRef.current.set(key, {
                    content,
                    totalElements,
                    totalPages,
                });
            } catch (error) {
                if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;

                console.error("Error fetching payments:", error);
                setSelectedApp([]);
                setPaymentsTotalPages(1);
                setPaymentsTotalElements(0);
            } finally {
                if (paymentsAbortRef.current === controller) setPaymentsLoading(false);
            }
        },
        [paymentRowsPerPage, role]
    );

    // load applications on page/search change
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // load payments when payment page changes (modal open)
    useEffect(() => {
        if (selectedLoan?.id) {
            fetchPayments(selectedLoan.id, paymentPage);
        }
    }, [fetchPayments, paymentPage, selectedLoan?.id]);

    // cleanup aborts on unmount
    useEffect(() => {
        return () => {
            if (appsAbortRef.current) appsAbortRef.current.abort();
            if (paymentsAbortRef.current) paymentsAbortRef.current.abort();
        };
    }, []);

    const closeModal = () => {
        setSelectedLoan(null);
        setSelectedApp(null);
        setPaymentPage(1);
        setExpandedPaymentKey(null);
        setPaymentsTotalPages(1);
        setPaymentsTotalElements(0);
        setPaymentsLoading(false);

        // optional: cancel in-flight payment request when closing
        if (paymentsAbortRef.current) paymentsAbortRef.current.abort();
    };

    const styleArrearsAmount = (amount) => {
        const numericAmount = Number(amount) || 0;

        if (numericAmount === 0) return "text-amber-600";
        if (numericAmount < 0) return "text-red-600";
        if (numericAmount > 0) return "text-emerald-600";

        return "text-gray-600";
    };

    const styleDueAmount = (amount) => {
        const numericAmount = Number(amount) || 0;

        if (numericAmount === 0) return "text-amber-600";
        if (numericAmount > 0) return "text-emerald-600";
        if (numericAmount < 0) return "text-red-600";

        return "text-gray-600";
    };

    const getStatusBadge = (status) => {
        const normalized = (status ?? "").toUpperCase();

        const styles = {
            WEEKLY: "bg-slate-100 text-slate-700 border-slate-200",
            DAILY: "bg-gray-900 text-white border-gray-900",
        };

        return styles[normalized] || styles.WEEKLY;
    };

    const openLoanDetails = (app) => {
        setSelectedLoan(app);
        setSelectedApp([]); // will be loaded from backend
        setPaymentPage(1);
        setExpandedPaymentKey(null);
        fetchPayments(app?.id, 1);
    };

    // For "Showing X-Y of Z"
    const startIndex =
        totalLoans === 0 ? 0 : (currentPage - 1) * mainRowsPerPage + 1;
    const endIndex = Math.min(currentPage * mainRowsPerPage, totalLoans);

    const paymentRecords = Array.isArray(selectedApp) ? selectedApp : [];
    const currentPayments = paymentRecords; // already backend-paged

    return (
        <div className="min-h-screen w-full p-2 sm:p-3">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="mx-auto max-w-[1600px]">
                {/* Page header */}
                <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                    <div>
                        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500 sm:text-[10px]">
                            Finance overview
                        </p>

                        <h1 className="text-[1.85rem] font-bold tracking-tight text-gray-950 sm:text-[2.2rem]">
                            Loan Summary
                        </h1>

                        <p className="mt-1 text-[11px] text-gray-500 sm:mt-2 sm:text-xs">
                            Review ongoing loans and inspect individual payment records.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white px-2.5 py-2 shadow-sm sm:px-3 sm:py-2.5">
                        <p className="text-[9px] font-medium uppercase tracking-wide text-gray-500 sm:text-[10px]">
                            Total loans
                        </p>

                        {loading ? (
                            <div className="mt-2 h-6 w-12 rounded bg-gray-100 animate-pulse" />
                        ) : (
                            <p className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
                                {totalLoans}
                            </p>
                        )}
                    </div>
                </div>

                {/* Main Table for md+ */}
                <section className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-gray-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
                                Ongoing loan records
                            </h2>
                            <p className="mt-1 text-[10px] text-gray-500 sm:text-[11px]">
                                Select a row to view its payment history.
                            </p>
                        </div>

                        {/* Search */}
                        <div className="sm:ml-auto">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by Loan ID / Applicant"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-800 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 sm:w-[230px]"
                            />
                        </div>

                        {!loading && totalLoans > 0 && (
                            <p className="text-[10px] text-gray-500 sm:text-[11px]">
                                Showing{" "}
                                <span className="font-semibold text-gray-800">
                                    {startIndex}–{endIndex}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-gray-800">
                                    {totalLoans}
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">
                                            Loading Loan Summary Details
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Please wait while we fetch the latest data...
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-10 w-full rounded bg-gray-50 border border-gray-100 animate-pulse"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <table className="w-full min-w-[760px] text-[10px] sm:text-xs">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr className="text-left text-[8px] font-bold uppercase tracking-wider text-gray-500 sm:text-[10px]">
                                        <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-3">
                                            Loan ID
                                        </th>
                                        <th className="hidden whitespace-nowrap px-2 py-2 lg:table-cell sm:px-3 sm:py-3">
                                            Loan Date
                                        </th>
                                        <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-3">
                                            Applicant
                                        </th>
                                        <th className="hidden whitespace-nowrap px-2 py-2 sm:table-cell sm:px-3 sm:py-3">
                                            Installments
                                        </th>
                                        <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-3">
                                            Amount
                                        </th>
                                        <th className="hidden whitespace-nowrap px-2 py-2 md:table-cell sm:px-3 sm:py-3">
                                            Total Paid Amount
                                        </th>
                                        <th className="hidden whitespace-nowrap px-2 py-2 lg:table-cell sm:px-3 sm:py-3">
                                            Per Installment
                                        </th>
                                        <th className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-3">
                                            Type
                                        </th>
                                        <th className="hidden whitespace-nowrap px-2 py-2 md:table-cell sm:px-3 sm:py-3">
                                            Remaining Balance
                                        </th>
                                        <th className="hidden whitespace-nowrap px-2 py-2 md:table-cell sm:px-3 sm:py-3">
                                            Arrears
                                        </th>
                                        <th className="hidden whitespace-nowrap px-2 py-2 lg:table-cell sm:px-3 sm:py-3">
                                            Approved By
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {applicationData.map((app, index) => (
                                        <tr
                                            key={app.id || app.fileNumber || index}
                                            tabIndex={0}
                                            role="button"
                                            onClick={() => openLoanDetails(app)}
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" ||
                                                    event.key === " "
                                                ) {
                                                    event.preventDefault();
                                                    openLoanDetails(app);
                                                }
                                            }}
                                            className="cursor-pointer transition-colors hover:bg-blue-50/50 focus:bg-blue-50 focus:outline-none"
                                        >
                                            <td className="px-2 py-2 sm:px-3 sm:py-3">
                                                <span className="font-bold text-gray-900">
                                                    {app.fileNumber || "—"}
                                                </span>
                                            </td>

                                            <td className="hidden whitespace-nowrap px-2 py-2 text-gray-600 lg:table-cell sm:px-3 sm:py-3">
                                                <span className="font-bold text-black">
                                                    {formatDate(app.createdAt)}
                                                </span>
                                                <br />
                                                <span>{formatDate(app.endAt)}</span>
                                            </td>

                                            <td className="px-2 py-2 sm:px-3 sm:py-3">
                                                <div className="font-semibold text-gray-800">
                                                    {app.customer?.name || "—"}
                                                </div>
                                                <div className="mt-1 text-[9px] text-gray-500 sm:text-[10px]">
                                                    {app.customer?.nic || "—"}
                                                </div>
                                            </td>

                                            <td className="hidden px-2 py-2 text-gray-700 sm:table-cell sm:px-3 sm:py-3">
                                                <span className="font-medium">
                                                    {app.installment || 0}x
                                                </span>
                                                <div className="mt-1 text-[9px] text-gray-500 sm:text-[10px]">
                                                    {app.interestRate || 0}% interest
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-2 py-2 font-semibold text-gray-900 sm:px-3 sm:py-3">
                                                {formatLKR(app.amount)}
                                            </td>

                                            <td className="hidden whitespace-nowrap px-2 py-2 text-gray-700 md:table-cell sm:px-3 sm:py-3">
                                                {formatLKR(app.totalPaid)}
                                            </td>

                                            <td className="hidden whitespace-nowrap px-2 py-2 text-gray-700 lg:table-cell sm:px-3 sm:py-3">
                                                {formatLKR(app.installmentValue)}
                                            </td>

                                            <td className="px-2 py-2 sm:px-3 sm:py-3">
                                                <span
                                                    className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-semibold sm:px-2 sm:text-[10px] ${getStatusBadge(
                                                        app.loanType
                                                    )}`}
                                                >
                                                    {app.loanType || "UNKNOWN"}
                                                </span>
                                            </td>

                                            <td className="hidden whitespace-nowrap px-2 py-2 text-gray-700 md:table-cell sm:px-3 sm:py-3">
                                                {formatLKR(app.remainingBalance)}
                                            </td>

                                            <td
                                                className={`hidden whitespace-nowrap px-2 py-2 font-bold md:table-cell sm:px-3 sm:py-3 ${styleArrearsAmount(
                                                    app.arrearsAmount
                                                )}`}
                                            >
                                                {formatLKR(app.arrearsAmount)}
                                            </td>

                                            <td className="hidden px-2 py-2 text-gray-700 lg:table-cell sm:px-3 sm:py-3">
                                                <div>
                                                    {app.approvedEmployee?.firstName ||
                                                        app.approvedEmployee?.lastName
                                                        ? `${app.approvedEmployee?.firstName || ""} ${app.approvedEmployee?.lastName || ""
                                                        }`
                                                        : "—"}
                                                </div>
                                                <div className="mt-1 text-[9px] text-gray-500 sm:text-[10px]">
                                                    {app.approvedEmployee?.nic || "—"}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {!loading && applicationData.length === 0 && (
                        <div className="px-6 py-16 text-center">
                            <h3 className="font-semibold text-gray-900">
                                No loan records found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                There are currently no ongoing loans to display.
                            </p>
                        </div>
                    )}

                    {!loading && totalMainPages > 1 && (
                        <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-4">
                            <p className="text-[10px] text-gray-500 sm:text-xs">
                                Page {currentPage} of {totalMainPages}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((p) => Math.max(p - 1, 1))
                                    }
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-black bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-gray-100 disabled:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                                >
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(p + 1, totalMainPages)
                                        )
                                    }
                                    disabled={currentPage === totalMainPages}
                                    className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <section className="md:hidden">
                    <div className="mb-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="mb-3">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Ongoing loan records
                            </h2>
                            <p className="mt-1 text-[11px] text-gray-500">
                                Tap a loan to view its payment history.
                            </p>
                        </div>
                        <input
                            type="text"
                            name="mobile-search"
                            placeholder="Search by Loan ID / Applicant"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                        />
                        {!loading && totalLoans > 0 && (
                            <p className="mt-2 text-[10px] text-gray-500">
                                Showing{" "}
                                <span className="font-semibold text-gray-800">
                                    {startIndex}–{endIndex}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-gray-800">
                                    {totalLoans}
                                </span>
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <div className="space-y-3" aria-label="Loading loan records">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-40 animate-pulse rounded-xl border border-gray-200 bg-white"
                                />
                            ))}
                        </div>
                    ) : applicationData.length > 0 ? (
                        <div className="space-y-2.5">
                            {applicationData.map((app, index) => {
                                const loanKey = app.id || app.fileNumber || index;
                                const isExpanded = expandedLoanKey === loanKey;

                                return (
                                    <article
                                        key={loanKey}
                                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <button
                                            type="button"
                                            aria-expanded={isExpanded}
                                            aria-controls={`loan-details-${loanKey}`}
                                            onClick={() =>
                                                setExpandedLoanKey((currentKey) =>
                                                    currentKey === loanKey ? null : loanKey
                                                )
                                            }
                                            className="w-full p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-bold text-gray-900">
                                                        {app.customer?.name || "—"}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-[10px] text-gray-500">
                                                        {app.fileNumber || "—"} · {app.customer?.nic || "—"}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getStatusBadge(
                                                            app.loanType
                                                        )}`}
                                                    >
                                                        {app.loanType || "UNKNOWN"}
                                                    </span>
                                                    <span
                                                        aria-hidden="true"
                                                        className={`text-sm text-gray-500 transition-transform ${
                                                            isExpanded ? "rotate-180" : ""
                                                        }`}
                                                    >
                                                        ▾
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-100 pt-2.5">
                                                <div>
                                                    <p className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                                                        Loan amount
                                                    </p>
                                                    <p className="mt-0.5 text-xs font-semibold text-gray-900">
                                                        {formatLKR(app.amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                                                        Total paid
                                                    </p>
                                                    <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                                                        {formatLKR(app.totalPaid)}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div
                                                id={`loan-details-${loanKey}`}
                                                className="border-t border-gray-100 bg-slate-50/70 px-3 py-3"
                                            >
                                                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                                                    <div>
                                                        <p className="text-[10px] font-medium text-gray-500">
                                                            Loan date
                                                        </p>
                                                        <p className="text-xs text-gray-800">
                                                            {formatDate(app.createdAt)}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">
                                                            Ends {formatDate(app.endAt)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-medium text-gray-500">
                                                            Installments
                                                        </p>
                                                        <p className="text-xs text-gray-800">
                                                            {app.installment || 0} installments
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">
                                                            {app.interestRate || 0}% interest
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-medium text-gray-500">
                                                            Per installment
                                                        </p>
                                                        <p className="text-xs text-gray-800">
                                                            {formatLKR(app.installmentValue)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-medium text-gray-500">
                                                            Remaining balance
                                                        </p>
                                                        <p className="text-xs text-gray-800">
                                                            {formatLKR(app.remainingBalance)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-medium text-gray-500">
                                                            Arrears
                                                        </p>
                                                        <p
                                                            className={`text-xs font-semibold ${styleArrearsAmount(
                                                                app.arrearsAmount
                                                            )}`}
                                                        >
                                                            {formatLKR(app.arrearsAmount)}
                                                        </p>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-medium text-gray-500">
                                                            Approved by
                                                        </p>
                                                        <p className="truncate text-xs text-gray-800">
                                                            {app.approvedEmployee?.firstName ||
                                                            app.approvedEmployee?.lastName
                                                                ? `${app.approvedEmployee?.firstName || ""} ${
                                                                      app.approvedEmployee?.lastName || ""
                                                                  }`.trim()
                                                                : "—"}
                                                        </p>
                                                        <p className="truncate text-[10px] text-gray-500">
                                                            {app.approvedEmployee?.nic || ""}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => openLoanDetails(app)}
                                                    className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                                                >
                                                    View payment history
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900">
                                No loan records found
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                                There are currently no ongoing loans to display.
                            </p>
                        </div>
                    )}

                    {!loading && totalMainPages > 1 && (
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                            <p className="text-[11px] text-gray-500">
                                Page {currentPage} of {totalMainPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((page) => Math.max(page - 1, 1))
                                    }
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.min(page + 1, totalMainPages)
                                        )
                                    }
                                    disabled={currentPage === totalMainPages}
                                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Payment details modal */}
            {selectedLoan && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-2 backdrop-blur-sm sm:p-4"
                    onClick={closeModal}
                    aria-hidden="true"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="payment-details-title"
                        onClick={(event) => event.stopPropagation()}
                        className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
                    >
                        {/* Modal header */}
                        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-3 py-3 sm:px-6 sm:py-5">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 sm:text-xs">
                                    Payment history
                                </p>

                                <h2
                                    id="payment-details-title"
                                    className="mt-0.5 text-base font-bold text-gray-900 sm:mt-1 sm:text-2xl"
                                >
                                    {selectedLoan?.fileNumber
                                        ? `Loan ${selectedLoan.fileNumber}`
                                        : "Loan Payment Details"}
                                </h2>

                                {selectedLoan?.customer?.name && (
                                    <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-sm">
                                        {selectedLoan.customer.name}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Close payment details"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 sm:h-9 sm:w-9 sm:text-xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Payment summary */}
                        <div className="grid grid-cols-3 gap-1.5 border-b border-gray-200 bg-gray-50 px-2.5 py-2 sm:gap-3 sm:px-6 sm:py-4">
                            <div>
                                <p className="text-[8px] text-gray-500 sm:text-xs">
                                    Total records
                                </p>
                                <p className="mt-0.5 text-[10px] font-bold text-gray-900 sm:mt-1 sm:text-base">
                                    {paymentsTotalElements}
                                </p>
                            </div>

                            <div>
                                <p className="text-[8px] text-gray-500 sm:text-xs">
                                    Loan type
                                </p>
                                <p className="mt-0.5 text-[10px] font-bold text-gray-900 sm:mt-1 sm:text-base">
                                    {selectedLoan?.loanType || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-[8px] text-gray-500 sm:text-xs">
                                    Installment value
                                </p>
                                <p className="mt-0.5 text-[10px] font-bold text-gray-900 sm:mt-1 sm:text-base">
                                    {formatLKR(selectedLoan?.installmentValue)}
                                </p>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {paymentsLoading ? (
                                <div className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                Loading payment records...
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Please wait...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : currentPayments.length > 0 ? (
                                <>
                                <div className="space-y-1.5 p-2 md:hidden">
                                    {currentPayments.map((value, index) => {
                                        const dueAmount =
                                            (value.paidAmount || 0) -
                                            (selectedLoan?.installmentValue || 0);
                                        const paymentKey =
                                            value.id || value.installmentNumber || index;
                                        const isPaymentExpanded =
                                            expandedPaymentKey === paymentKey;

                                        return (
                                            <article
                                                key={paymentKey}
                                                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                                            >
                                                <button
                                                    type="button"
                                                    aria-expanded={isPaymentExpanded}
                                                    aria-controls={`payment-details-${paymentKey}`}
                                                    onClick={() =>
                                                        setExpandedPaymentKey((currentKey) =>
                                                            currentKey === paymentKey
                                                                ? null
                                                                : paymentKey
                                                        )
                                                    }
                                                    className="w-full px-2.5 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                                                >
                                                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                                                        <span className="text-left text-xs font-bold text-gray-900">
                                                            #{value.installmentNumber || "—"}
                                                        </span>
                                                        <span className="flex min-w-0 items-center justify-end gap-2">
                                                            <span className="max-w-[155px] truncate text-right text-[11px] font-semibold text-gray-800">
                                                                {Number(value.paidAmount) === 0
                                                                    ? "No payment received"
                                                                    : formatLKR(value.paidAmount)}
                                                            </span>
                                                            <span
                                                                aria-hidden="true"
                                                                className={`shrink-0 text-xs text-gray-500 transition-transform ${
                                                                    isPaymentExpanded ? "rotate-180" : ""
                                                                }`}
                                                            >
                                                                ▾
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="mt-1.5 flex items-center justify-between border-t border-gray-100 pt-1.5">
                                                        <span className="text-left text-[9px] text-gray-500">
                                                            Due amount
                                                        </span>
                                                        <span
                                                            className={`ml-auto rounded-full bg-amber-50 px-1.5 py-0.5 text-right text-[9px] font-semibold ${styleDueAmount(
                                                                dueAmount
                                                            )}`}
                                                        >
                                                            {formatLKR(dueAmount)}
                                                        </span>
                                                    </div>
                                                </button>
                                                {isPaymentExpanded && (
                                                <div
                                                    id={`payment-details-${paymentKey}`}
                                                    className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-100 bg-slate-50/70 px-2.5 py-2"
                                                >
                                                    <div className="min-w-0 text-left">
                                                        <p className="text-[9px] font-medium text-gray-500">
                                                            Paid at
                                                        </p>
                                                        {value.paidAt ? (
                                                            <>
                                                                <p className="text-[10px] text-gray-800">
                                                                    {new Date(
                                                                        value.paidAt
                                                                    ).toLocaleDateString("en-LK", {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    })}
                                                                </p>
                                                                <p className="text-[9px] text-gray-500">
                                                                    {new Date(
                                                                        value.paidAt
                                                                    ).toLocaleTimeString("en-LK", {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true,
                                                                    })}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className="text-[10px] text-gray-800">
                                                                —
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 text-right">
                                                        <p className="text-[9px] font-medium text-gray-500">
                                                            Processed by
                                                        </p>
                                                        {value.employee?.firstName ? (
                                                            <>
                                                                <p className="truncate text-[10px] font-medium text-gray-800">
                                                                    {value.employee.firstName}{" "}
                                                                    {value.employee.lastName}
                                                                </p>
                                                                <p className="truncate text-[9px] text-gray-500">
                                                                    {value.employee.nic || "—"}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className="text-[10px] text-gray-800">
                                                                —
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                                <table className="hidden w-full min-w-[500px] text-xs md:table sm:text-sm">
                                    <thead className="sticky top-0 border-b border-gray-200 bg-white">
                                        <tr className="text-left text-[9px] font-bold uppercase tracking-wide text-gray-500 sm:text-xs">
                                            <th className="px-3 py-3 sm:px-6 sm:py-4">
                                                Installment
                                            </th>
                                            <th className="px-3 py-3 sm:px-6 sm:py-4">
                                                Paid Amount
                                            </th>
                                            <th className="px-3 py-3 sm:px-6 sm:py-4 hidden md:table-cell">
                                                Paid At
                                            </th>
                                            <th className="px-3 py-3 sm:px-6 sm:py-4 hidden lg:table-cell">
                                                Processed By
                                            </th>
                                            <th className="px-3 py-3 sm:px-6 sm:py-4">
                                                Due Amount
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {currentPayments.map((value, index) => (
                                            <tr
                                                key={value.id || value.installmentNumber || index}
                                                className="transition-colors hover:bg-gray-50"
                                            >
                                                <td className="px-3 py-3 font-semibold text-gray-900 sm:px-6 sm:py-4">
                                                    <span className="text-gray-400"># </span>
                                                    {value.installmentNumber || "—"}
                                                </td>

                                                <td className="px-3 py-3 font-bold text-gray-900 sm:px-6 sm:py-4">
                                                    {Number(value.paidAmount) === 0
                                                        ? "No payment received"
                                                        : formatLKR(value.paidAmount)}
                                                </td>

                                                <td className="hidden whitespace-nowrap px-3 py-3 text-gray-600 md:table-cell sm:px-6 sm:py-4">
                                                    {value.paidAt ? (
                                                        <>
                                                            <div>
                                                                {new Date(
                                                                    value.paidAt
                                                                ).toLocaleDateString("en-LK", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })}
                                                            </div>
                                                            <div className="mt-1 text-[9px] text-gray-400 sm:text-xs">
                                                                {new Date(
                                                                    value.paidAt
                                                                ).toLocaleTimeString("en-LK", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>

                                                <td className="hidden px-3 py-3 text-gray-600 lg:table-cell sm:px-6 sm:py-4">
                                                    {value.employee?.firstName ? (
                                                        <>
                                                            <div className="font-medium text-gray-800">
                                                                {value.employee.firstName}{" "}
                                                                {value.employee.lastName}
                                                            </div>
                                                            <div className="text-[9px] text-gray-400 sm:text-xs">
                                                                {value.employee.nic || "—"}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>

                                                <td className="px-3 py-3 sm:px-6 sm:py-4">
                                                    <span
                                                        className={`inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 sm:px-3 ${styleDueAmount(
                                                            (value.paidAmount || 0) -
                                                            (selectedLoan?.installmentValue || 0)
                                                        )}`}
                                                    >
                                                        {formatLKR(
                                                            (value.paidAmount || 0) -
                                                            (selectedLoan?.installmentValue || 0)
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </>
                            ) : (
                                <div className="px-4 py-10 text-center sm:px-6 sm:py-16">
                                    <h3 className="font-semibold text-gray-900">
                                        No payment records
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                        No payment history is available for this loan.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Payment pagination */}
                        {paymentsTotalPages > 1 && (
                            <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-6 sm:py-4">
                                <p className="hidden text-xs text-gray-500 sm:block">
                                    Page {paymentPage} of {paymentsTotalPages}
                                </p>

                                <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setExpandedPaymentKey(null);
                                            setPaymentPage((p) => Math.max(p - 1, 1))
                                        }}
                                        disabled={paymentPage === 1}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                                    >
                                        Previous
                                    </button>

                                    <span className="min-w-[80px] text-center text-[10px] font-medium text-gray-600 sm:text-xs">
                                        Page {paymentPage} of {paymentsTotalPages}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setExpandedPaymentKey(null);
                                            setPaymentPage((p) =>
                                                Math.min(p + 1, paymentsTotalPages)
                                            )
                                        }}
                                        disabled={paymentPage === paymentsTotalPages}
                                        className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanSummary;