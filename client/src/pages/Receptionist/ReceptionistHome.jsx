import React, { useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { XCircle } from "lucide-react";
import axiosAPI from '../../api/axiosAPI';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReceptionistHome = () => {
    const [pendingLoans, setPendingLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedPendingLoan, setSelectedPendingLoan] = useState(null);
    const [lastFileNumber, setLastFileNumber] = useState();


    const [pendingLoanUpdatePayload, setPendingLoanUpdatePayload] = useState({
        fileNumber: "",
        documentCharge: "",
        interestRate: ""
    });

    useEffect(() => {
        fetchPendingLoans();
    }, []);

    const fetchlastFileNumber = async (loanType) => {
        try {
            setLoading(true);
            const res = await axiosAPI.get(`/recep/loans/lastFileNumber/${loanType}`);
            setLastFileNumber(res.data);
            setLoading(false);
        } catch (e) {
            console.log(e);
        }
    }

    const fetchPendingLoans = async () => {
        try {
            setLoading(true);
            const response = await axiosAPI.get("/recep/loans");
            setPendingLoans(response.data);
        } catch (e) {
            console.error(e);
            toast.error('Error fetching pending loans');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (loan) => {
        setSelectedPendingLoan(loan);
        // Pre-fill the form with existing data if any
        setPendingLoanUpdatePayload({
            fileNumber: loan.fileNumber || "",
            documentCharge: loan.documentCharge || "",
            interestRate: loan.interestRate || ""
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPendingLoan(null);
    };

    // Unified input handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPendingLoanUpdatePayload(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const updatePendingLoan = async () => {
        if (!pendingLoanUpdatePayload.fileNumber.trim()) {
            toast.error("File Number is required to assign the loan.");
            return;
        }
        if (!pendingLoanUpdatePayload.documentCharge.trim()) {
            toast.error("Document charge is required to assign the loan.");
            return;
        }
        if (!pendingLoanUpdatePayload.interestRate.trim()) {
            toast.error("Interest rate is required to assign the loan.");
            return;
        }

        try {
            setSubmitting(true);
            await axiosAPI.put("/recep/loans", pendingLoanUpdatePayload, {
                params: {
                    fileNumber: selectedPendingLoan.fileNumber // Original identifier
                }
            });

            toast.success("Loan successfully updated and assigned!");
            handleCloseModal();
            await fetchPendingLoans(); // Refresh the list

        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message || "Failed to update loan");
        } finally {
            setSubmitting(false);
        }
    };

    const stats = [
        { title: "Total Customers", value: "1,240", growth: "+8 this week", bg: "bg-blue-50", text: "text-blue-600" },
        { title: "Active Loans", value: "860", growth: "+12 this month", bg: "bg-green-50", text: "text-green-600" },
        { title: "Pending Requests", value: pendingLoans.length.toString(), growth: "Need review", bg: "bg-yellow-50", text: "text-yellow-600" },
        { title: "Completed Today", value: "24", growth: "+3 vs yesterday", bg: "bg-purple-50", text: "text-purple-600" },
    ];

    return (
        <div className="flex flex-col gap-6 px-6 py-6 min-h-screen bg-gray-50">
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Receptionist Dashboard</h1>

            {/* ================= STATS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item, index) => (
                    <div key={index} className={`${item.bg} rounded-xl p-6 shadow-sm border border-gray-100`}>
                        <p className="text-gray-600 text-sm font-medium">{item.title}</p>
                        <h2 className={`text-3xl font-bold mt-2 ${item.text}`}>{item.value}</h2>
                        <p className="text-sm text-gray-500 mt-2">{item.growth}</p>
                    </div>
                ))}
            </div>

            {/* ================= MAIN GRID ================= */}
            <div className="grid lg:grid-cols-3 gap-6 flex-1">

                {/* ================= LOAN APPLICATIONS ================= */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                        <h2 className="font-semibold text-lg text-gray-800">
                            Field Officer's New Loan Collections
                        </h2>
                        <span className="text-sm text-gray-500">{pendingLoans.length} Pending</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : pendingLoans.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="font-medium">No pending loans found</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {pendingLoans.map((loan, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col md:flex-row md:justify-between md:items-center border border-gray-200 p-4 rounded-xl hover:shadow-md hover:border-blue-300 transition-all cursor-pointer bg-white group"
                                        onClick={() => {
                                            handleOpenModal(loan);
                                            fetchlastFileNumber(loan.loanType);
                                        }}
                                    >
                                        <div className="flex flex-col gap-1 mb-3 md:mb-0">
                                            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                {loan.customer?.name}
                                            </p>
                                            <span className="text-gray-500 text-xs">
                                                NIC: {loan.customer?.nic}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Officer: {loan.enteredBy?.firstName} {loan.enteredBy?.lastName} • {new Date(loan.createdAt).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-4">
                                            <p className="font-bold text-gray-800">
                                                LKR. {parseFloat(loan.amount || 0).toLocaleString()}
                                            </p>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                    {loan.status}
                                                </span>
                                                <button className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                                    Process
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= SCHEDULE ================= */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                    <h2 className="font-semibold text-lg mb-4 text-gray-800">Calendar</h2>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar sx={{ width: '100%' }} />
                    </LocalizationProvider>
                </div>
            </div>

            {/* ================= UPDATE LOAN MODAL ================= */}
            {
                showModal && selectedPendingLoan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-[fadeIn_0.2s_ease-in-out]">

                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Process Loan Application</h2>
                                    <p className="text-sm text-gray-500 mt-1">Review details and assign file parameters</p>
                                </div>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <XCircle className="w-7 h-7" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Left Column: Read-only Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Information</h3>
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                                            <InfoRow label="Name" value={selectedPendingLoan.customer?.name} />
                                            <InfoRow label="NIC" value={selectedPendingLoan.customer?.nic} />
                                            <InfoRow label="Phone" value={selectedPendingLoan.customer?.phoneNumber} />
                                            <InfoRow label="Address" value={selectedPendingLoan.customer?.address} />
                                            {selectedPendingLoan.customer?.email && <InfoRow label="Email" value={selectedPendingLoan.customer?.email} />}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Loan Details</h3>
                                        <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
                                            <InfoRow label="Requested Amount" value={`LKR. ${parseFloat(selectedPendingLoan.amount || 0).toLocaleString()}`} highlight />
                                            <InfoRow label="Installments" value={selectedPendingLoan.noOfInstallments} />
                                            <InfoRow label="Applied Date" value={new Date(selectedPendingLoan.createdAt).toLocaleDateString('en-GB')} />
                                            <InfoRow
                                                label="Entered By"
                                                value={
                                                    <>
                                                        {selectedPendingLoan.enteredBy.firstName}{" "}
                                                        {selectedPendingLoan.enteredBy.lastName}
                                                        <br />
                                                        NIC : {selectedPendingLoan.enteredBy.nic}
                                                    </>
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Editable Form */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Assign Parameters</h3>
                                    <div className="space-y-5">
                                        {loading ?
                                            <div className='mb-6 flex items-center gap-3'>
                                                <span className='text-md text-gray-500'>Fetching last file number...</span>
                                                <div className="flex items-center justify-center">
                                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            </div>
                                            :
                                            lastFileNumber ?
                                                <div className='mb-6 flex items-center gap-3'>
                                                    <span className='text-md text-gray-500'>Last File Number:</span>
                                                    <span className="px-3 py-1 bg-linear-to-r from-gray-700 to-gray-800 text-white text-md font-medium rounded-md">
                                                        {lastFileNumber}
                                                    </span>
                                                </div>
                                                :
                                                ""}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-gray-700">File Number <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="fileNumber"
                                                value={pendingLoanUpdatePayload.fileNumber}
                                                onChange={handleInputChange}
                                                placeholder="e.g., LN-2023-001"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Document Charges (LKR)<span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                name="documentCharge"
                                                value={pendingLoanUpdatePayload.documentCharge}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 100"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Interest Rate (%)<span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                name="interestRate"
                                                value={pendingLoanUpdatePayload.interestRate}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 12.5"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={updatePendingLoan}
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        "Update & Assign Loan"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

// Helper component for clean info rows
const InfoRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-start">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`text-sm font-semibold text-right max-w-[60%] break-words ${highlight ? 'text-blue-700 text-base' : 'text-gray-800'}`}>
            {value || "N/A"}
        </span>
    </div>
);

export default ReceptionistHome;