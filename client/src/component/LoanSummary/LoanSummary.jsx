import React, { useState, useEffect } from "react";
import axiosAPI from "@/api/axiosAPI";

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
        : parsedDate.toLocaleDateString("en-LK");
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
        if (numericAmount < 0) return "text-red-600";
        if (numericAmount > 0) return "text-emerald-600";

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

    // Main table pagination
    const totalMainPages = Math.ceil(
        applicationData.length / mainRowsPerPage
    );

    const indexOfLastMainRow = currentPage * mainRowsPerPage;
    const indexOfFirstMainRow = indexOfLastMainRow - mainRowsPerPage;

    const currentApplications = applicationData.slice(
        indexOfFirstMainRow,
        indexOfLastMainRow
    );

    // Selected loan payment pagination
    const paymentRecords = Array.isArray(selectedApp) ? selectedApp : [];

    const totalPaymentPages = Math.ceil(
        paymentRecords.length / paymentRowsPerPage
    );

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
                    <p className="text-sm font-medium text-gray-600">
                        Loading loan data...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full p-3">
            <div className="mx-auto max-w-[1600px]">
                {/* Page header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Finance overview
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
                            Loan Summary
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Review ongoing loans and inspect individual payment
                            records.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Total loans
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {applicationData.length}
                        </p>
                    </div>
                </div>

                {/* Main table */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Ongoing loan records
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Select a row to view its payment history.
                            </p>
                        </div>

                        {applicationData.length > 0 && (
                            <p className="text-xs text-gray-500">
                                Showing{" "}
                                <span className="font-semibold text-gray-800">
                                    {indexOfFirstMainRow + 1}–
                                    {Math.min(
                                        indexOfLastMainRow,
                                        applicationData.length
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-gray-800">
                                    {applicationData.length}
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1150px] text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    <th className="whitespace-nowrap px-5 py-4">
                                        Loan ID
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4">
                                        Loan Date
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4">
                                        Complete Date
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4">
                                        Applicant
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4">
                                        Installments
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4">
                                        Amount
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4">
                                        Per Installment
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4">
                                        Type
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4">
                                        Arrears
                                    </th>
                                    <th className="whitespace-nowrap px-5 py-4">
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
                                        <td className="px-5 py-4">
                                            <span className="font-bold text-gray-900">
                                                {app.fileNumber || "—"}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                            {formatDate(app.createdAt)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                            {formatDate(app.endAt)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-gray-800">
                                                {app.customer?.name || "—"}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {app.customer?.nic || "—"}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-gray-700">
                                            <span className="font-medium">
                                                {app.installment || 0}x
                                            </span>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {app.interestRate || 0}% interest
                                            </div>
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">
                                            {formatLKR(app.amount)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                                            {formatLKR(app.installmentValue)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                                                    app.loanType
                                                )}`}
                                            >
                                                {app.loanType || "UNKNOWN"}
                                            </span>
                                        </td>

                                        <td
                                            className={`whitespace-nowrap px-5 py-4 font-bold ${styleArrearsAmount(
                                                app.arrearsAmount
                                            )}`}
                                        >
                                            {formatLKR(app.arrearsAmount)}
                                        </td>

                                        <td className="px-5 py-4 text-gray-700">
                                            <div>
                                                {app.approvedEmployee?.firstName ||
                                                    app.approvedEmployee?.lastName
                                                    ? `${app.approvedEmployee?.firstName || ""} ${app.approvedEmployee?.lastName || ""
                                                    }`
                                                    : "—"}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {app.approvedEmployee?.nic || "—"}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty state */}
                    {applicationData.length === 0 && (
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
                    {totalMainPages > 1 && (
                        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-gray-500">
                                Page {currentPage} of {totalMainPages}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.max(page - 1, 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.min(
                                                page + 1,
                                                totalMainPages
                                            )
                                        )
                                    }
                                    disabled={currentPage === totalMainPages}
                                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Payment details modal */}
            {selectedApp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
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
                        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Payment history
                                </p>

                                <h2
                                    id="payment-details-title"
                                    className="mt-1 text-2xl font-bold text-gray-900"
                                >
                                    {selectedLoan?.fileNumber
                                        ? `Loan ${selectedLoan.fileNumber}`
                                        : "Loan Payment Details"}
                                </h2>

                                {selectedLoan?.customer?.name && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {selectedLoan.customer.name}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Close payment details"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                                ×
                            </button>
                        </div>

                        {/* Payment summary */}
                        <div className="grid grid-cols-2 gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Total records
                                </p>
                                <p className="mt-1 font-bold text-gray-900">
                                    {paymentRecords.length}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Loan type
                                </p>
                                <p className="mt-1 font-bold text-gray-900">
                                    {selectedLoan?.loanType || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Installment value
                                </p>
                                <p className="mt-1 font-bold text-gray-900">
                                    {formatLKR(selectedLoan?.installmentValue)}
                                </p>
                            </div>
                        </div>

                        {/* Payment table */}
                        <div className="overflow-auto">
                            {currentPayments.length > 0 ? (
                                <table className="w-full min-w-[650px] text-sm">
                                    <thead className="sticky top-0 border-b border-gray-200 bg-white">
                                        <tr className="text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                                            <th className="px-6 py-4">
                                                Installment
                                            </th>
                                            <th className="px-6 py-4">
                                                Paid Amount
                                            </th>
                                            <th className="px-6 py-4">
                                                Paid At
                                            </th>
                                            <th className="px-6 py-4">
                                                Processed By
                                            </th>
                                            <th className="px-6 py-4">
                                                Due Amount
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {currentPayments.map((value, index) => (
                                            <tr
                                                key={
                                                    value.id ||
                                                    value.installmentNumber ||
                                                    index
                                                }
                                                className="transition-colors hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    <span className="text-gray-400"># </span>
                                                    {value.installmentNumber ||
                                                        "—"}
                                                </td>

                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    {formatLKR(
                                                        value.paidAmount
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                                    {value.paidAt ? (
                                                        <>
                                                            <div>
                                                                {new Date(
                                                                    value.paidAt
                                                                ).toLocaleDateString(
                                                                    "en-LK",
                                                                    {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    }
                                                                )}
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-400">
                                                                {new Date(
                                                                    value.paidAt
                                                                ).toLocaleTimeString(
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
                                                <td className="px-6 py-4 text-gray-600">
                                                    {value.employee?.firstName ? (
                                                        <>
                                                            <div className="font-medium text-gray-800">
                                                                {value.employee.firstName} {value.employee.lastName}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {value.employee.nic || "—"}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ${styleArrearsAmount((value.paidAmount || 0) - (selectedLoan?.installmentValue || 0))}`}>
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
                                <div className="px-6 py-16 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
                                        ✓
                                    </div>
                                    <h3 className="font-semibold text-gray-900">
                                        No payment records
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        No payment history is available for
                                        this loan.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Payment pagination */}
                        {totalPaymentPages > 1 && (
                            <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-gray-500">
                                    Showing {indexOfFirstPayment + 1}–
                                    {Math.min(
                                        indexOfLastPayment,
                                        paymentRecords.length
                                    )}{" "}
                                    of {paymentRecords.length} payments
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPaymentPage((page) =>
                                                Math.max(page - 1, 1)
                                            )
                                        }
                                        disabled={paymentPage === 1}
                                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    <span className="min-w-[90px] text-center text-xs font-medium text-gray-600">
                                        Page {paymentPage} of{" "}
                                        {totalPaymentPages}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPaymentPage((page) =>
                                                Math.min(
                                                    page + 1,
                                                    totalPaymentPages
                                                )
                                            )
                                        }
                                        disabled={
                                            paymentPage === totalPaymentPages
                                        }
                                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
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