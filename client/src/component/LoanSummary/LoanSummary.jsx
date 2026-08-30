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
        setPaymentsTotalPages(1);
        setPaymentsTotalElements(0);
        setPaymentsLoading(false);

        // optional: cancel in-flight payment request when closing
        if (paymentsAbortRef.current) paymentsAbortRef.current.abort();
    };

    const styleArrearsAmount = (amount) => {
        const numericAmount = Number(amount) || 0;

        if (numericAmount === 0) return "text-amber-600";
        if (numericAmount < 0) return "text-emerald-600";
        if (numericAmount > 0) return "text-red-600";

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
        fetchPayments(app?.id, 1);
    };

    // For "Showing X-Y of Z"
    const startIndex =
        totalLoans === 0 ? 0 : (currentPage - 1) * mainRowsPerPage + 1;
    const endIndex = Math.min(currentPage * mainRowsPerPage, totalLoans);

    const paymentRecords = Array.isArray(selectedApp) ? selectedApp : [];
    const currentPayments = paymentRecords; // already backend-paged

    return (
        <div className="min-h-screen w-full p-3">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="mx-auto max-w-[1600px]">
                {/* Page header */}
                <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                    <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 sm:text-xs">
                            Finance overview
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                            Loan Summary
                        </h1>

                        <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                            Review ongoing loans and inspect individual payment records.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm sm:px-4">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
                            Total loans
                        </p>

                        {loading ? (
                            <div className="mt-2 h-7 w-16 rounded bg-gray-100 animate-pulse" />
                        ) : (
                            <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                                {totalLoans}
                            </p>
                        )}
                    </div>
                </div>

                {/* Main Table for md+ */}
                <section className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-gray-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
                                Ongoing loan records
                            </h2>
                            <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
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
                                className="w-full sm:w-[260px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                            />
                        </div>

                        {!loading && totalLoans > 0 && (
                            <p className="text-[10px] text-gray-500 sm:text-xs">
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
                            <table className="w-full min-w-[900px] text-xs sm:text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr className="text-left text-[9px] font-bold uppercase tracking-wider text-gray-500 sm:text-[11px]">
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">
                                            Loan ID
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4 hidden lg:table-cell">
                                            Loan Date
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">
                                            Applicant
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4 hidden sm:table-cell">
                                            Installments
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">
                                            Amount
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4 hidden lg:table-cell">
                                            Per Installment
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">
                                            Type
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4 hidden md:table-cell">
                                            Remaining Balance
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4 hidden md:table-cell">
                                            Arrears
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4 hidden lg:table-cell">
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
                                            <td className="px-3 py-3 sm:px-5 sm:py-4">
                                                <span className="font-bold text-gray-900">
                                                    {app.fileNumber || "—"}
                                                </span>
                                            </td>

                                            <td className="hidden whitespace-nowrap px-3 py-3 text-gray-600 lg:table-cell sm:px-5 sm:py-4">
                                                <span className="font-bold text-black">
                                                    {formatDate(app.createdAt)}
                                                </span>
                                                <br />
                                                <span>{formatDate(app.endAt)}</span>
                                            </td>

                                            <td className="px-3 py-3 sm:px-5 sm:py-4">
                                                <div className="font-semibold text-gray-800">
                                                    {app.customer?.name || "—"}
                                                </div>
                                                <div className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                                                    {app.customer?.nic || "—"}
                                                </div>
                                            </td>

                                            <td className="hidden px-3 py-3 text-gray-700 sm:table-cell sm:px-5 sm:py-4">
                                                <span className="font-medium">
                                                    {app.installment || 0}x
                                                </span>
                                                <div className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                                                    {app.interestRate || 0}% interest
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-3 py-3 font-semibold text-gray-900 sm:px-5 sm:py-4">
                                                {formatLKR(app.amount)}
                                            </td>

                                            <td className="hidden whitespace-nowrap px-3 py-3 text-gray-700 lg:table-cell sm:px-5 sm:py-4">
                                                {formatLKR(app.installmentValue)}
                                            </td>

                                            <td className="px-3 py-3 sm:px-5 sm:py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold sm:px-3 ${getStatusBadge(
                                                        app.loanType
                                                    )}`}
                                                >
                                                    {app.loanType || "UNKNOWN"}
                                                </span>
                                            </td>

                                            <td className="hidden whitespace-nowrap px-3 py-3 text-gray-700 lg:table-cell sm:px-5 sm:py-4">
                                                {formatLKR(app.remainingBalance)}
                                            </td>

                                            <td
                                                className={`hidden whitespace-nowrap px-3 py-3 font-bold md:table-cell sm:px-5 sm:py-4 ${styleArrearsAmount(
                                                    app.arrearsAmount
                                                )}`}
                                            >
                                                {formatLKR(app.arrearsAmount)}
                                            </td>

                                            <td className="hidden px-3 py-3 text-gray-700 lg:table-cell sm:px-5 sm:py-4">
                                                <div>
                                                    {app.approvedEmployee?.firstName ||
                                                        app.approvedEmployee?.lastName
                                                        ? `${app.approvedEmployee?.firstName || ""} ${app.approvedEmployee?.lastName || ""
                                                        }`
                                                        : "—"}
                                                </div>
                                                <div className="mt-1 text-[10px] text-gray-500 sm:text-xs">
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
            </div>

            {/* Payment details modal */}
            {selectedLoan && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-4"
                    onClick={closeModal}
                    aria-hidden="true"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="payment-details-title"
                        onClick={(event) => event.stopPropagation()}
                        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        {/* Modal header */}
                        <div className="flex items-start justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 sm:text-xs">
                                    Payment history
                                </p>

                                <h2
                                    id="payment-details-title"
                                    className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl"
                                >
                                    {selectedLoan?.fileNumber
                                        ? `Loan ${selectedLoan.fileNumber}`
                                        : "Loan Payment Details"}
                                </h2>

                                {selectedLoan?.customer?.name && (
                                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                        {selectedLoan.customer.name}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Close payment details"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 sm:h-9 sm:w-9 sm:text-xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Payment summary */}
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:gap-3 sm:grid-cols-3 sm:px-6 sm:py-4">
                            <div>
                                <p className="text-[10px] text-gray-500 sm:text-xs">
                                    Total records
                                </p>
                                <p className="mt-1 font-bold text-gray-900">
                                    {paymentsTotalElements}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-gray-500 sm:text-xs">
                                    Loan type
                                </p>
                                <p className="mt-1 font-bold text-gray-900">
                                    {selectedLoan?.loanType || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-gray-500 sm:text-xs">
                                    Installment value
                                </p>
                                <p className="mt-1 font-bold text-gray-900">
                                    {formatLKR(selectedLoan?.installmentValue)}
                                </p>
                            </div>
                        </div>

                        <div className="overflow-auto">
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
                                <table className="w-full min-w-[500px] text-xs sm:text-sm">
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
                                                    {formatLKR(value.paidAmount)}
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
                            ) : (
                                <div className="px-4 py-12 text-center sm:px-6 sm:py-16">
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
                            <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4">
                                <p className="text-xs text-gray-500">
                                    Page {paymentPage} of {paymentsTotalPages}
                                </p>

                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPaymentPage((p) => Math.max(p - 1, 1))
                                        }
                                        disabled={paymentPage === 1}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <span className="min-w-[80px] text-center text-xs font-medium text-gray-600">
                                        Page {paymentPage} of {paymentsTotalPages}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPaymentPage((p) =>
                                                Math.min(p + 1, paymentsTotalPages)
                                            )
                                        }
                                        disabled={paymentPage === paymentsTotalPages}
                                        className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
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