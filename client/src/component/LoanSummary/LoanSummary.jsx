import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { Textarea } from '@/component/ui/textarea';
import axiosAPI from '@/api/axiosAPI';

const useToast = () => {
    return (toast) => console.log("Toast:", toast);
};

const formatLKR = (amount) =>
    new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR'
    }).format(amount);

const LoanSummary = () => {
    const toast = useToast();

    const [applicationData, setApplicationData] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showLoan, setShowLoan] = useState(false);
    const [decisionNote, setDecisionNote] = useState("");
    const [isEdit, setIsEdit] = useState(false);

    const [filters, setFilters] = useState({
        status: "ALL",
        search: "",
        loanId: "",
        minAmount: "",
        maxAmount: "",
    });

    const [loanUpdatePayload, setLoanUpdatePayload] = useState({
        amount: "",
        decisionNote: "",
        documentCharge: "",
        interestRate: "",
        installment: "",
        status: ""
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        const filtered = applyFilters(applicationData, filters);
        setFilteredApps(filtered);
    }, [filters, applicationData]);

    useEffect(() => {
        if (showLoan || isEdit) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [showLoan, isEdit]);

    const fetchApplications = async () => {
        try {
            const res = await axiosAPI.get("/admin/loans");
            const data = res.data;
            console.log("Loans : ", data)
            setApplicationData(data);
            setFilteredApps(applyFilters(data, filters));
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (data, filters) => {
        let filtered = [...data];

        if (filters.status !== "ALL") {
            filtered = filtered.filter(
                app => (app.status || "").toUpperCase() === filters.status
            );
        }

        if (filters.search) {
            filtered = filtered.filter(app =>
                (app.customerId ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(filters.search.toLowerCase())
            );
        }

        if (filters.loanId) {
            filtered = filtered.filter(app =>
                app.fileNumber?.toLowerCase()
                    .includes(filters.loanId.toLowerCase())
            );
        }

        if (filters.minAmount) {
            filtered = filtered.filter(
                app => Number(app.amount) >= Number(filters.minAmount)
            );
        }

        if (filters.maxAmount) {
            filtered = filtered.filter(
                app => Number(app.amount) <= Number(filters.maxAmount)
            );
        }

        return filtered;
    };

    const handleAction = (app, action) => {
        setSelectedApp(app);
        setActionType(action);
        setDecisionNote('');
        setShowDialog(true);
    };

    const confirmAction = async () => {
        if (!selectedApp) return;

        try {
            setLoading(true);

            if (actionType === 'approve') {
                if (!decisionNote.trim()) {
                    toast({
                        title: 'Error',
                        description: 'Decision note is required',
                        variant: 'destructive'
                    });
                    return;
                }

                await axiosAPI.put("/admin/approve", {
                    fileNumber: selectedApp.fileNumber,
                    employeeId: currentEmployeeId,
                    decisionNote
                });
            }

            else if (actionType === 'reject') {
                await axiosAPI.put("/admin/reject", {
                    fileNumber: selectedApp.fileNumber,
                    decisionNote,
                    employeeId: currentEmployeeId
                });
            }

            else if (actionType === 'reset') {
                await axiosAPI.put("/admin/reset", {
                    fileNumber: selectedApp.fileNumber,
                    employeeId: currentEmployeeId
                });
            }

            else if (actionType === 'incomplete') {
                await axiosAPI.put("/admin/incomplete", {
                    fileNumber: selectedApp.fileNumber,
                    employeeId: currentEmployeeId
                });
            }

            await fetchApplications();

            toast({
                title: 'Success',
                description: `Application ${actionType} successfully`
            });

        } catch (error) {
            console.error('Failed to update application:', error);
            toast({
                title: 'Error',
                description: 'Failed to update application',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
            setShowDialog(false);
            setSelectedApp(null);
            setActionType(null);
            setDecisionNote('');
        }
    };

    const getStatusBadge = (status) => {
        const normalized = (status ?? '').toUpperCase();

        const styles = {
            PENDING: 'bg-gray-100 text-gray-700 border-gray-200',
            APPROVED: 'bg-black text-white border-black',
            COMPLETED: 'bg-green-100 text-green-700 border-green-200',
            REJECTED: 'bg-red-100 text-red-700 border-red-200'
        };

        return styles[normalized] || styles.PENDING;
    };

    const Info = ({ label, children }) => (
        <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">{label}</span>
            <span className="text-sm font-medium text-gray-800 break-words">
                {children}
            </span>
        </div>
    );

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex min-h-screen bg-gray-50 w-full">
                <div className="flex-1">
                    <div className="p-6">

                        <h1 className="text-3xl font-bold text-black mb-6">
                            Loan Applications
                        </h1>

                        {/* TABLE */}
                        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Loan ID</th>
                                        <th className="px-6 py-4 text-left">Loan Date</th>
                                        <th className="px-6 py-4 text-left">Applicant NIC</th>
                                        <th className="px-6 py-4 text-left">Applicant Name</th>
                                        <th className="px-6 py-4 text-left">Amount</th>
                                        <th className="px-6 py-4 text-left">Status</th>
                                        <th className="px-6 py-4 text-left">Entered By</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredApps.map((app) => (
                                        <tr
                                            key={app.fileNumber}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => {
                                                setSelectedApp(app);
                                                setShowLoan(true);
                                            }}
                                        >
                                            {/* {console.log("App : ", app)} */}
                                            <td className="px-6 py-4">
                                                {app.fileNumber.slice(0, 8)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(app.createdAt).toLocaleDateString("en-LK", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                {app.customer.nic}
                                            </td>
                                            <td className="px-6 py-4">
                                                {app.customer.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {formatLKR(app.amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs border ${getStatusBadge(app.status)}`}>
                                                    {(app.status || '').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {app.enteredBy?.firstName} {app.enteredBy?.lastName}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoanSummary