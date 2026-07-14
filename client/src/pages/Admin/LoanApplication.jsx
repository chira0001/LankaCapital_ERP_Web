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

const LoanApplication = () => {
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

  const handleUpdateLoan = async () => {
    try {
      await axiosAPI.put(
        `/admin/loans/${selectedApp.fileNumber}`,
        loanUpdatePayload
      );

      toast({
        title: "Success",
        description: "Loan updated successfully"
      });

      const res = await axiosAPI.get("/admin/loans");
      const updatedData = res.data;

      setApplicationData(updatedData);
      setFilteredApps(applyFilters(updatedData, filters));

      const updatedLoan = updatedData.find(
        (loan) => loan.fileNumber === selectedApp.fileNumber
      );

      if (updatedLoan) {
        setSelectedApp(updatedLoan);
      }

      setIsEdit(false);

    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update loan",
        variant: "destructive"
      });
    }
  };

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

            {/* LOAN DETAIL SECTION */}
            {showLoan && selectedApp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

                {/* Modal Container */}
                <div className="relative w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-[fadeIn_.2s_ease-in-out]">

                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setShowLoan(false);
                      setSelectedApp(null);
                      setIsEdit(false);
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>

                  {/* Header */}
                  <div className="px-8 py-6 border-b bg-gray-50 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Loan Details
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      File #{selectedApp.fileNumber.slice(0, 8)}
                    </p>
                  </div>

                  <div className="p-8 space-y-10">

                    {/* ================= LOAN INFORMATION ================= */}
                    <div>
                      <div className='flex justify-between items-center'>
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">
                          Loan Information
                        </h3>
                        {console.log("selectedApp : ", selectedApp)}
                        <button
                          onClick={() => {
                            setLoanUpdatePayload({
                              amount: selectedApp.amount || "",
                              decisionNote: selectedApp.decisionNote || "",
                              documentCharge: selectedApp.documentCharge || "",
                              interestRate: selectedApp.interestRate || "",
                              installment: selectedApp.noOfInstallments || "",
                              status: selectedApp.status || "PENDING"
                            });
                            setIsEdit(true);
                          }}
                          className='bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors shadow-md'
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 21h14c1.1 0 2-.9 2-2v-7h-2v7H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2"></path>
                            <path d="M7 13v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l9-9a.996.996 0 0 0 0-1.41l-3-3a.996.996 0 0 0-1.41 0l-9.01 8.99A1 1 0 0 0 7 13m10-7.59L18.59 7 17.5 8.09 15.91 6.5zm-8 8 5.5-5.5 1.59 1.59-5.5 5.5H9z"></path>
                          </svg>
                          Edit
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">

                        <Info label="Loan Date">
                          {new Date(selectedApp.createdAt).toLocaleString("en-LK", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </Info>

                        <Info label="Amount">
                          Rs. {selectedApp.amount}
                        </Info>

                        <Info label="Document Charge">
                          Rs. {selectedApp.documentCharge}
                        </Info>

                        <Info label="Installments">
                          {selectedApp.noOfInstallments}
                        </Info>

                        <Info label="Interest Rate">
                          {selectedApp.interestRate}%
                        </Info>

                        <Info label="Status">
                          {selectedApp.status || "Not available"}
                        </Info>

                        <Info label="Entered By">
                          Id: {selectedApp.enteredBy?.nic} <br />
                          {selectedApp.enteredBy?.firstName} {selectedApp.enteredBy?.lastName}
                        </Info>
                        {console.log("NIC : ", selectedApp)}
                        <Info label="Updated By">
                          {selectedApp.updatedBy?.id
                            ? <>
                              Id: {selectedApp.updatedBy.nic} <br />
                              {selectedApp.updatedBy.firstName} {selectedApp.updatedBy.lastName}
                            </>
                            : "No updates made"}
                        </Info>

                        <Info label="Approved By">
                          {selectedApp.approvedBy?.id
                            ? <>
                              Id: {selectedApp.approvedBy.nic} <br />
                              {selectedApp.approvedBy.firstName} {selectedApp.approvedBy.lastName}
                            </>
                            : "Approval Pending"}
                        </Info>

                        {selectedApp.rejectionNote && (
                          <Info label="Rejection Note">
                            {selectedApp.rejectionNote}
                          </Info>
                        )}

                        <div className="col-span-3">
                          <Info label="Decision Note">
                            {selectedApp.decisionNote || "Not available"}
                          </Info>
                        </div>

                      </div>
                    </div>

                    {/* ================= CUSTOMER INFORMATION ================= */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-6">
                        Customer Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">

                        <Info label="NIC">
                          {selectedApp.customer?.nic}
                        </Info>

                        <Info label="Name">
                          {selectedApp.customer?.name}
                        </Info>

                        <Info label="Address">
                          {selectedApp.customer?.address}
                        </Info>

                        <Info label="Phone">
                          {selectedApp.customer?.phoneNumber}
                        </Info>

                        <Info label="Email">
                          {selectedApp.customer?.email || "N/A"}
                        </Info>

                        <Info label="Bank">
                          {selectedApp.customer?.bank || "N/A"} <br />
                          {selectedApp.customer?.bankAccount || "N/A"}
                        </Info>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isEdit && (
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => setIsEdit(false)}
              >

                <div
                  className="relative w-[95%] max-w-xl bg-white rounded-2xl shadow-2xl p-8"
                  onClick={(e) => e.stopPropagation()}
                >

                  {/* Close Button */}
                  <button
                    onClick={() => setIsEdit(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>

                  <h2 className="text-xl font-bold mb-6">
                    Update Loan Information
                  </h2>

                  <div className="space-y-4">
                    <div className='flex flex-col gap-2'>
                      <Label>Loan Amount</Label>
                      <Input
                        type="number"
                        value={loanUpdatePayload.amount}
                        onChange={(e) =>
                          setLoanUpdatePayload({
                            ...loanUpdatePayload,
                            amount: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className='flex flex-col gap-2'>
                      <Label>Document Charge</Label>
                      <Input
                        type="number"
                        value={loanUpdatePayload.documentCharge}
                        onChange={(e) =>
                          setLoanUpdatePayload({
                            ...loanUpdatePayload,
                            documentCharge: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className='flex flex-col gap-2'>
                      <Label>Interest Rate (%)</Label>
                      <Input
                        type="number"
                        value={loanUpdatePayload.interestRate}
                        onChange={(e) =>
                          setLoanUpdatePayload({
                            ...loanUpdatePayload,
                            interestRate: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className='flex flex-col gap-2'>
                      <Label>Installments</Label>
                      <Input
                        type="number"
                        value={loanUpdatePayload.installment}
                        onChange={(e) =>
                          setLoanUpdatePayload({
                            ...loanUpdatePayload,
                            installment: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className='flex flex-col gap-2'>
                      <Label>Status</Label>
                      <select
                        className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm 
           focus:outline-none focus:ring-2 focus:ring-black focus:border-black 
           disabled:opacity-50"
                        value={loanUpdatePayload.status}
                        onChange={(e) =>
                          setLoanUpdatePayload({
                            ...loanUpdatePayload,
                            status: e.target.value
                          })
                        }
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        {/* <option value="COMPLETED">COMPLETED</option> */}
                      </select>
                    </div>

                    <div className='flex flex-col gap-2'>
                      <Label>Decision Note (Optional)</Label>
                      <Textarea
                        value={loanUpdatePayload.decisionNote}
                        onChange={(e) =>
                          setLoanUpdatePayload({
                            ...loanUpdatePayload,
                            decisionNote: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={() => setIsEdit(false)}
                        className="px-4 py-2 rounded-lg border"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleUpdateLoan}
                        className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
                      >
                        Update Loan
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default LoanApplication;