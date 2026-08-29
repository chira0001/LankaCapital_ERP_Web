import React, { useState, useEffect, useMemo } from "react";
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
    const role = localStorage.getItem("role");

    const mainRowsPerPage = 20;
    const paymentRowsPerPage = 15;

    const [currentPage, setCurrentPage] = useState(1);
    const [paymentPage, setPaymentPage] = useState(1);

    const [applicationData, setApplicationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [selectedLoan, setSelectedLoan] = useState(null);

    // Search
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                closeModal();
            }
        };

        if (selectedApp) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "auto";
        };
    }, [selectedApp]);

    const fetchApplications = async () => {
        try {
            const res = await axiosAPI.get(`/${role}/loan-summary`);
            setApplicationData(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error fetching applications:", error);
            setApplicationData([]);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedApp(null);
        setSelectedLoan(null);
        setPaymentPage(1);
    };

    const styleArrearsAmount = (amount) => {
        const numericAmount = Number(amount) || 0;

        if (numericAmount === 0) return "text-amber-600";
        if (numericAmount < 0) return "text-emerald-600";
        if (numericAmount > 0) return "text-red-600";
        // if (numericAmount > 0) return "text-emerald-600";

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

    // Filtered applications (Search by Loan ID + Applicant)
    const filteredApplications = useMemo(() => {
        const q = (searchTerm || "").trim().toLowerCase();
        if (!q) return applicationData;

        return applicationData.filter((app) => {
            const loanId = (app.fileNumber ?? "").toString().toLowerCase();
            const applicantName = (app.customer?.name ?? "").toLowerCase();
            // optional but still part of "Applicant" info, helps searching reliably
            const applicantNic = (app.customer?.nic ?? "").toLowerCase();

            return (
                loanId.includes(q) ||
                applicantName.includes(q) ||
                applicantNic.includes(q)
            );
        });
    }, [applicationData, searchTerm]);

    // When search changes, reset to first page (so results don't appear empty due to pagination)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Main table pagination (based on filtered results)
    const totalMainPages = Math.ceil(filteredApplications.length / mainRowsPerPage);

    useEffect(() => {
        // Keep currentPage valid when filtering reduces results
        if (totalMainPages === 0 && currentPage !== 1) setCurrentPage(1);
        if (totalMainPages > 0 && currentPage > totalMainPages) {
            setCurrentPage(totalMainPages);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalMainPages]);

    const indexOfLastMainRow = currentPage * mainRowsPerPage;
    const indexOfFirstMainRow = indexOfLastMainRow - mainRowsPerPage;

    const currentApplications = filteredApplications.slice(
        indexOfFirstMainRow,
        indexOfLastMainRow
    );

    // Selected loan payment pagination
    const paymentRecords = Array.isArray(selectedApp) ? selectedApp : [];

    const totalPaymentPages = Math.ceil(paymentRecords.length / paymentRowsPerPage);

    const indexOfLastPayment = paymentPage * paymentRowsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentRowsPerPage;

    const currentPayments = paymentRecords.slice(
        indexOfFirstPayment,
        indexOfLastPayment
    );

    const openLoanDetails = (app) => {
        setSelectedLoan(app);
        setSelectedApp(app.dailyCollection || []);
        setPaymentPage(1);
    };

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

                        {/* Keep page visible; only table sections show loading */}
                        {loading ? (
                            <div className="mt-2 h-7 w-16 rounded bg-gray-100 animate-pulse" />
                        ) : (
                            <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                                {applicationData.length}
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
                                placeholder="Search Loan"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-[260px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                            />
                        </div>

                        {!loading && filteredApplications.length > 0 && (
                            <p className="text-[10px] text-gray-500 sm:text-xs">
                                Showing{" "}
                                <span className="font-semibold text-gray-800">
                                    {indexOfFirstMainRow + 1}–
                                    {Math.min(
                                        indexOfLastMainRow,
                                        filteredApplications.length
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-gray-800">
                                    {filteredApplications.length}
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            // Loader ONLY for the table section (does not hide entire window)
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

                                <div className="mt-6 space-y-3">
                                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse mt-2" />
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


                                        {/* <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4 hidden md:table-cell">
                                            Loan Date
                                        </th>
                                        <th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4 hidden lg:table-cell">
                                            Complete Date
                                        </th> */}

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
                                    {currentApplications.map((app, index) => (
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

                                            {/* <td className="hidden whitespace-nowrap px-3 py-3 text-gray-600 md:table-cell sm:px-5 sm:py-4">
                                                {formatDate(app.createdAt)}
                                            </td>

                                            <td className="hidden whitespace-nowrap px-3 py-3 text-gray-600 lg:table-cell sm:px-5 sm:py-4">
                                                {formatDate(app.endAt)}
                                            </td> */}

                                            <td className="hidden whitespace-nowrap px-3 py-3 text-gray-600 lg:table-cell sm:px-5 sm:py-4">
                                                <span className="font-bold text-black">{formatDate(app.createdAt)}</span>
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

                    {/* Empty state */}
                    {!loading && filteredApplications.length === 0 && (
                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                                📄
                            </div>
                            <h3 className="font-semibold text-gray-900">
                                No loan records found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                There are currently no ongoing loans to display.
                            </p>
                        </div>
                    )}

                    {/* Main table pagination */}
                    {!loading && totalMainPages > 1 && (
                        <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-4">
                            <p className="text-[10px] text-gray-500 sm:text-xs">
                                Page {currentPage} of {totalMainPages}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((page) => Math.max(page - 1, 1))
                                    }
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-black bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-gray-100 disabled:border-gray-400  disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
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
                                    className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Mobile Card List for Main Loans (md:hidden) */}
                <section className="md:hidden space-y-3">
                    {/* Mobile search */}
                    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search Loan"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                        />
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            Loading Loan Summary Details
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Please wait while we fetch the latest data...
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                                </div>
                            </div>

                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                                            <div className="mt-2 h-3 w-40 bg-gray-100 rounded animate-pulse" />
                                        </div>
                                        <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                                        <div className="h-10 bg-gray-50 border border-gray-100 rounded animate-pulse" />
                                        <div className="h-10 bg-gray-50 border border-gray-100 rounded animate-pulse" />
                                        <div className="h-10 bg-gray-50 border border-gray-100 rounded animate-pulse" />
                                        <div className="h-10 bg-gray-50 border border-gray-100 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {currentApplications.map((app, index) => (
                                <button
                                    key={app.id || app.fileNumber || index}
                                    onClick={() => openLoanDetails(app)}
                                    className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900">
                                                {app.fileNumber || "—"}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-600">
                                                {app.customer?.name || "—"}
                                                {app.customer?.nic && (
                                                    <span className="text-gray-400">
                                                        {" "}
                                                        · {app.customer.nic}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <span
                                            className={`inline-flex shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${getStatusBadge(
                                                app.loanType
                                            )}`}
                                        >
                                            {app.loanType || "UNKNOWN"}
                                        </span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                        <div>
                                            <p className="text-gray-500">Amount</p>
                                            <p className="font-semibold text-gray-900">
                                                {formatLKR(app.amount)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Per Installment</p>
                                            <p className="font-semibold text-gray-900">
                                                {formatLKR(app.installmentValue)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Installments</p>
                                            <p className="text-gray-800">
                                                {app.installment || 0}x{" "}
                                                <span className="text-gray-400">
                                                    ({app.interestRate || 0}%)
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Arrears</p>
                                            <p
                                                className={`font-semibold ${styleArrearsAmount(
                                                    app.arrearsAmount
                                                )}`}
                                            >
                                                {formatLKR(app.arrearsAmount)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {filteredApplications.length === 0 && (
                                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                                        📄
                                    </div>
                                    <h3 className="font-semibold text-gray-900">
                                        No loan records found
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        There are currently no ongoing loans to display.
                                    </p>
                                </div>
                            )}

                            {/* Mobile pagination */}
                            {totalMainPages > 1 && (
                                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((page) => Math.max(page - 1, 1))
                                        }
                                        disabled={currentPage === 1}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 disabled:opacity-40"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        Page {currentPage} of {totalMainPages}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((page) =>
                                                Math.min(page + 1, totalMainPages)
                                            )
                                        }
                                        disabled={currentPage === totalMainPages}
                                        className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>

            {/* Payment details modal */}
            {selectedApp && (
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
                                    {paymentRecords.length}
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

                        {/* Payment table (md+) */}
                        <div className="hidden md:block overflow-auto">
                            {currentPayments.length > 0 ? (
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
                                                                {new Date(value.paidAt).toLocaleDateString(
                                                                    "en-LK",
                                                                    {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    }
                                                                )}
                                                            </div>
                                                            <div className="mt-1 text-[9px] text-gray-400 sm:text-xs">
                                                                {new Date(value.paidAt).toLocaleTimeString(
                                                                    "en-LK",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true,
                                                                    }
                                                                )}
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
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                                        ✓
                                    </div>
                                    <h3 className="font-semibold text-gray-900">
                                        No payment records
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                        No payment history is available for this loan.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Payment Mobile Cards (md:hidden) */}
                        <div className="md:hidden overflow-y-auto flex-1">
                            {currentPayments.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {currentPayments.map((value, index) => (
                                        <div
                                            key={value.id || value.installmentNumber || index}
                                            className="p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        Installment #{value.installmentNumber || "—"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Paid:{" "}
                                                        <span className="font-semibold text-gray-800">
                                                            {formatLKR(value.paidAmount)}
                                                        </span>
                                                    </p>
                                                </div>
                                                <span
                                                    className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${styleDueAmount(
                                                        (value.paidAmount || 0) -
                                                        (selectedLoan?.installmentValue || 0)
                                                    )}`}
                                                >
                                                    {formatLKR(
                                                        (value.paidAmount || 0) -
                                                        (selectedLoan?.installmentValue || 0)
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                                                {value.paidAt && (
                                                    <span>
                                                        {new Date(value.paidAt).toLocaleDateString(
                                                            "en-LK",
                                                            {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            }
                                                        )}{" "}
                                                        ·{" "}
                                                        {new Date(value.paidAt).toLocaleTimeString(
                                                            "en-LK",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            }
                                                        )}
                                                    </span>
                                                )}
                                                {value.employee?.firstName && (
                                                    <span>
                                                        {value.employee.firstName}{" "}
                                                        {value.employee.lastName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-12 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                                        ✓
                                    </div>
                                    <h3 className="font-semibold text-gray-900">
                                        No payment records
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500">
                                        No payment history is available for this loan.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Payment pagination (shared between mobile and desktop) */}
                        {totalPaymentPages > 1 && (
                            <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4">
                                <p className="text-xs text-gray-500">
                                    Page {paymentPage} of {totalPaymentPages}
                                </p>

                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPaymentPage((page) => Math.max(page - 1, 1))
                                        }
                                        disabled={paymentPage === 1}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <span className="min-w-[80px] text-center text-xs font-medium text-gray-600">
                                        Page {paymentPage} of {totalPaymentPages}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPaymentPage((page) =>
                                                Math.min(page + 1, totalPaymentPages)
                                            )
                                        }
                                        disabled={paymentPage === totalPaymentPages}
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