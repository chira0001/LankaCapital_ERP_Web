import React, { useState, useEffect } from "react";
import axiosAPI from "@/api/axiosAPI";

const formatLKR = (amount) =>
    new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
    }).format(amount || 0);

const LoanSummary = () => {
    const role = localStorage.getItem("role");

    const mainRowsPerPage = 20;
    const selectedRowsPerPage = 15;

    const [mainCurrentPage, setMainCurrentPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const [applicationData, setApplicationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        if (!selectedApp) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setSelectedApp(null);
                setCurrentPage(1);
            }
        };

        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [selectedApp]);

    const fetchApplications = async () => {
        try {
            const res = await axiosAPI.get(`/${role}/loan-summary`);
            setApplicationData(res.data);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const styleArrearsAmount = (amount) => {
        if (amount === 0) return "text-amber-600 bg-amber-50 border-amber-200";
        if (amount < 0) return "text-red-600 bg-red-50 border-red-200";
        if (amount > 0) return "text-emerald-600 bg-emerald-50 border-emerald-200";
        return "text-gray-600 bg-gray-50 border-gray-200";
    };

    const getStatusBadge = (status) => {
        const normalized = (status ?? "").toUpperCase();
        const styles = {
            WEEKLY: "bg-slate-100 text-slate-700 border-slate-300",
            DAILY: "bg-gray-900 text-white border-gray-900",
        };
        return styles[normalized] || styles.WEEKLY;
    };

    // Main table pagination - 20 records per page
    const mainIndexOfLastRow = mainCurrentPage * mainRowsPerPage;
    const mainIndexOfFirstRow = mainIndexOfLastRow - mainRowsPerPage;
    const mainCurrentRows = applicationData.slice(
        mainIndexOfFirstRow,
        mainIndexOfLastRow
    );
    const mainTotalPages = Math.ceil(applicationData.length / mainRowsPerPage);

    // Selected app/payment table pagination - 15 records per page
    const indexOfLastRow = currentPage * selectedRowsPerPage;
    const indexOfFirstRow = indexOfLastRow - selectedRowsPerPage;

    const currentRows = selectedApp
        ? selectedApp.slice(indexOfFirstRow, indexOfLastRow)
        : [];

    const totalPages = selectedApp
        ? Math.ceil(selectedApp.length / selectedRowsPerPage)
        : 0;

    const closeModal = () => {
        setSelectedApp(null);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center bg-white px-10 py-8 rounded-2xl shadow-sm border border-gray-200">
                    <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
                    <p className="text-gray-800 font-semibold tracking-wide">
                        Loading Loan Data...
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        Please wait while we prepare the summary.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-[1600px] mx-auto">
                {/* HEADER */}
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-medium mb-3">
                            Loan Management
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 tracking-tight">
                            Loan Summary
                        </h1>

                        <p className="text-gray-500 mt-2 text-sm sm:text-base">
                            Summary of all ongoing loan records and payment collections.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium">
                                Total Loans
                            </p>
                            <p className="text-2xl font-bold text-gray-950 mt-1">
                                {applicationData.length}
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium">
                                Current Page
                            </p>
                            <p className="text-2xl font-bold text-gray-950 mt-1">
                                {mainTotalPages === 0 ? 0 : mainCurrentPage}
                                <span className="text-sm text-gray-400 font-medium">
                                    {" "}
                                    / {mainTotalPages || 0}
                                </span>
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm col-span-2 sm:col-span-1">
                            <p className="text-xs text-gray-500 font-medium">
                                Rows Per Page
                            </p>
                            <p className="text-2xl font-bold text-gray-950 mt-1">
                                {mainRowsPerPage}
                            </p>
                        </div>
                    </div>
                </div>

                {/* MAIN TABLE CARD */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white">
                        <div>
                            <h2 className="text-lg font-bold text-gray-950">
                                Ongoing Loans
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Click on any loan row to view payment details.
                            </p>
                        </div>

                        <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                            Showing{" "}
                            <span className="font-semibold text-gray-900">
                                {applicationData.length === 0
                                    ? 0
                                    : mainIndexOfFirstRow + 1}
                            </span>{" "}
                            -{" "}
                            <span className="font-semibold text-gray-900">
                                {Math.min(mainIndexOfLastRow, applicationData.length)}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-900">
                                {applicationData.length}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-sm">
                            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                                <tr className="text-gray-500 uppercase text-[11px] tracking-wider">
                                    <th className="px-6 py-4 text-left font-bold">
                                        Loan ID
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold">
                                        Loan Date
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold">
                                        Complete Date
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold">
                                        Applicant
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold">
                                        Installments
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold">
                                        Per Installment
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold">
                                        Arrears
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold">
                                        Approved By
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {mainCurrentRows.length > 0 ? (
                                    mainCurrentRows.map((app, key) => (
                                        <tr
                                            key={key}
                                            className="group hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                            onClick={() => {
                                                setSelectedApp(app.dailyCollection || []);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-950 group-hover:text-black">
                                                    {app.fileNumber}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                {new Date(app.createdAt).toLocaleDateString(
                                                    "en-LK"
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                {new Date(app.endAt).toLocaleDateString(
                                                    "en-LK"
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {app.customer?.name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    NIC: {app.customer?.nic}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900">
                                                    {app.installment}x
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {app.interestRate}% interest
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-semibold text-gray-950 whitespace-nowrap">
                                                {formatLKR(app.amount)}
                                            </td>

                                            <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                                                {formatLKR(app.installmentValue)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs border font-semibold ${getStatusBadge(
                                                        app.loanType
                                                    )}`}
                                                >
                                                    {app.loanType}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs border font-bold ${styleArrearsAmount(
                                                        app.arrearsAmount
                                                    )}`}
                                                >
                                                    {formatLKR(app.arrearsAmount)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                <div className="font-semibold text-gray-900">
                                                    {app.approvedEmployee?.firstName}{" "}
                                                    {app.approvedEmployee?.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    NIC: {app.approvedEmployee?.nic}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                <span className="text-2xl">📄</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                No loan records found
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                There are no ongoing loans to display.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MAIN PAGINATION */}
                    {mainTotalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gray-50">
                            <p className="text-sm text-gray-500">
                                Page{" "}
                                <span className="font-semibold text-gray-900">
                                    {mainCurrentPage}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-gray-900">
                                    {mainTotalPages}
                                </span>
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        setMainCurrentPage((prev) =>
                                            Math.max(prev - 1, 1)
                                        )
                                    }
                                    disabled={mainCurrentPage === 1}
                                    className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={() =>
                                        setMainCurrentPage((prev) =>
                                            Math.min(prev + 1, mainTotalPages)
                                        )
                                    }
                                    disabled={mainCurrentPage === mainTotalPages}
                                    className="px-4 py-2 bg-gray-900 text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL */}
                {selectedApp && (
                    <div
                        className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                    >
                        <div
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl relative overflow-hidden border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* MODAL HEADER */}
                            <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between gap-4 bg-white">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-3">
                                        Payment Collection
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-950">
                                        Loan Payment Details
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Showing collected installments for the selected loan.
                                    </p>
                                </div>

                                <button
                                    onClick={closeModal}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition text-xl"
                                    aria-label="Close modal"
                                >
                                    ×
                                </button>
                            </div>

                            {/* MODAL BODY */}
                            <div className="p-6">
                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-gray-500">
                                        Total Payment Records:{" "}
                                        <span className="font-bold text-gray-950">
                                            {selectedApp.length}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                                        Showing{" "}
                                        <span className="font-semibold text-gray-900">
                                            {selectedApp.length === 0
                                                ? 0
                                                : indexOfFirstRow + 1}
                                        </span>{" "}
                                        -{" "}
                                        <span className="font-semibold text-gray-900">
                                            {Math.min(indexOfLastRow, selectedApp.length)}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-semibold text-gray-900">
                                            {selectedApp.length}
                                        </span>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto max-h-[520px]">
                                        <table className="w-full min-w-[850px] text-sm">
                                            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                                                <tr className="text-gray-500 uppercase text-[11px] tracking-wider">
                                                    <th className="px-6 py-4 text-left font-bold">
                                                        Installment
                                                    </th>
                                                    <th className="px-6 py-4 text-left font-bold">
                                                        Paid Amount
                                                    </th>
                                                    <th className="px-6 py-4 text-left font-bold">
                                                        Paid Date
                                                    </th>
                                                    <th className="px-6 py-4 text-left font-bold">
                                                        Paid Time
                                                    </th>
                                                    <th className="px-6 py-4 text-left font-bold">
                                                        Processed By
                                                    </th>
                                                    <th className="px-6 py-4 text-left font-bold">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {currentRows.length > 0 ? (
                                                    currentRows.map((value) => (
                                                        <tr
                                                            key={value.id}
                                                            className="hover:bg-gray-50 transition"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-gray-950">
                                                                    Installment #
                                                                    {value.installmentNumber}
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-gray-950">
                                                                    {formatLKR(value.paidAmount)}
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                                {new Date(
                                                                    value.paidAt
                                                                ).toLocaleDateString("en-US", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })}
                                                            </td>

                                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                                {new Date(
                                                                    value.paidAt
                                                                ).toLocaleTimeString("en-US", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })}
                                                            </td>

                                                            <td className="px-6 py-4 text-gray-600">
                                                                {value.employeeId}
                                                            </td>

                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    Paid
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan="6"
                                                            className="px-6 py-16 text-center"
                                                        >
                                                            <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                                <span className="text-2xl">
                                                                    💳
                                                                </span>
                                                            </div>
                                                            <h3 className="text-lg font-bold text-gray-900">
                                                                No payment records found
                                                            </h3>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                This loan does not have any
                                                                collection records yet.
                                                            </p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* SELECTED APP PAGINATION */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-5">
                                        <p className="text-sm text-gray-500">
                                            Page{" "}
                                            <span className="font-semibold text-gray-900">
                                                {currentPage}
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-semibold text-gray-900">
                                                {totalPages}
                                            </span>
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    setCurrentPage((prev) =>
                                                        Math.max(prev - 1, 1)
                                                    )
                                                }
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition"
                                            >
                                                Previous
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setCurrentPage((prev) =>
                                                        Math.min(prev + 1, totalPages)
                                                    )
                                                }
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 bg-gray-900 text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoanSummary;