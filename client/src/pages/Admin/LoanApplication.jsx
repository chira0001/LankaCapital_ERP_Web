import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { Textarea } from '@/component/ui/textarea';
import axiosAPI from '@/api/axiosAPI';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/component/ui/select';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/component/ui/alert-dialog';

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
  const currentEmployeeId = 3;

  const [applicationData, setApplicationData] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showLoan, setShowLoan] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");

  const [filters, setFilters] = useState({
    status: "ALL",
    search: "",
    loanId: "",
    minAmount: "",
    maxAmount: "",
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    const filtered = applyFilters(applicationData, filters);
    setFilteredApps(filtered);
  }, [filters, applicationData]);

  const fetchApplications = async () => {
    try {
      const res = await axiosAPI.get("/admin/loans");
      const data = res.data;

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

      // else if (actionType === 'reset') {
      //   await axiosAPI.put("/admin/reset", {
      //     fileNumber: selectedApp.fileNumber,
      //     employeeId: currentEmployeeId
      //   });
      // }

      // else if (actionType === 'complete') {
      //   await axiosAPI.put("/admin/complete", {
      //     fileNumber: selectedApp.fileNumber,
      //     employeeId: currentEmployeeId
      //   });
      // }

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

            {/* LOAN DETAIL SECTION */}

            {console.log("selected : ", selectedApp)}
            {showLoan && selectedApp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

                {/* Modal Container */}
                <div className="relative w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-[fadeIn_.2s_ease-in-out]">

                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setShowLoan(false);
                      setSelectedApp(null);
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
                      <h3 className="text-lg font-semibold text-gray-800 mb-6">
                        Loan Information
                      </h3>

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

                        <Info label="Decision Note">
                          {selectedApp.decisionNote || "Not available"}
                        </Info>

                        <Info label="Entered By">
                          Id: {selectedApp.enteredBy?.id} <br />
                          {selectedApp.enteredBy?.firstName} {selectedApp.enteredBy?.lastName}
                        </Info>

                        <Info label="Approved By">
                          {selectedApp.approvedBy?.id
                            ? <>
                              Id: {selectedApp.approvedBy.id} <br />
                              {selectedApp.approvedBy.firstName} {selectedApp.approvedBy.lastName}
                            </>
                            : "Approval Pending"}
                        </Info>

                        <Info label="Updated By">
                          {selectedApp.updatedBy?.id
                            ? <>
                              Id: {selectedApp.updatedBy.id} <br />
                              {selectedApp.updatedBy.firstName} {selectedApp.updatedBy.lastName}
                            </>
                            : "No updates made"}
                        </Info>

                        {selectedApp.rejectionNote && (
                          <Info label="Rejection Note">
                            {selectedApp.rejectionNote}
                          </Info>
                        )}

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
                          {selectedApp.customer?.bank || "N/A"}
                        </Info>

                        <Info label="Bank Account">
                          {selectedApp.customer?.bankAccount || "N/A"}
                        </Info>

                      </div>
                    </div>

                    {/* ================= ACTION SECTION ================= */}
                    <div className="border-t pt-6 flex flex-wrap gap-3">

                      {(() => {
                        const status = (selectedApp.status || '').toUpperCase();

                        if (status === 'PENDING') {
                          return (
                            <>
                              <button
                                onClick={() => handleAction(selectedApp, 'approve')}
                                className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() => handleAction(selectedApp, 'incomplete')}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg text-sm font-medium transition"
                              >
                                Mark Incomplete
                              </button>

                              <button
                                onClick={() => handleAction(selectedApp, 'reject')}
                                className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
                              >
                                Reject
                              </button>
                            </>
                          );
                        }

                        return (
                          <button
                            onClick={() => handleAction(selectedApp, 'reset')}
                            className="border border-yellow-500 text-yellow-600 hover:bg-yellow-50 px-6 py-2.5 rounded-lg text-sm font-medium transition"
                          >
                            Reset
                          </button>
                        );
                      })()}

                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* ALERT DIALOG */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType?.toUpperCase()} LOAN
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} this loan?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {actionType === 'approve' && (
            <div className="my-4">
              <Label>Decision Note</Label>
              <Textarea
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LoanApplication;