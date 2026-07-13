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

      else if (actionType === 'complete') {
        await axiosAPI.put("/admin/complete", {
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
              <div className="mt-6 p-6 bg-white rounded-xl shadow border">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="font-semibold">File Number:</label>
                    <p>{selectedApp.fileNumber.slice(0, 8)}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Loan Date:</label>
                    <p>{new Date(selectedApp.createdAt).toLocaleString("en-LK", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Customer NIC:</label>
                    <p>{selectedApp.customer.nic}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Customer Name:</label>
                    <p>{selectedApp.customer.name}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Customer Address:</label>
                    <p>{selectedApp.customer.address}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Customer Phone Number:</label>
                    <p>{selectedApp.customer.phoneNumber}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Bank Name:</label>
                    <p>{selectedApp.customer.bank ? selectedApp.customer.bank : "N/A"}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Bank Account Number:</label>
                    <p>{selectedApp.customer.bankAccount ? selectedApp.customer.bankAccount : "N/A"}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Customer Email:</label>
                    <p>{selectedApp.customer.email ? selectedApp.customer.email : "N/A"}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Amount:</label>
                    <p>Rs. {selectedApp.amount}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Document Charge:</label>
                    <p>Rs. {selectedApp.documentCharge}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Number of Installments:</label>
                    <p>{selectedApp.noOfInstallments}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Interest Rate:</label>
                    <p>{selectedApp.interestRate}%</p>
                  </div>

                  <div>
                    <label className="font-semibold">Entered By:</label>
                    <p>
                      Id: {selectedApp.enteredBy.id} <br />
                      {selectedApp.enteredBy.firstName} {selectedApp.enteredBy.lastName}</p>
                  </div>
                  {
                    selectedApp.rejectionNote ?
                      <div>
                        <label className="font-semibold">Decision Note:</label>
                        <p>{selectedApp.rejectionNote}%</p>
                      </div>
                      :
                      ""
                  }
                  <div>
                    <label className="font-semibold">Status:</label>
                    <p>{selectedApp.status}</p>
                  </div>
                </div>

                <div className="mt-4">
                  {(() => {
                    const status = (selectedApp.status || '').toUpperCase();

                    if (status === 'PENDING') {
                      return (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(selectedApp, 'approve')}
                            className="bg-black text-white px-4 py-2 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(selectedApp, 'incomplete')}
                            className="bg-black text-white px-4 py-2 rounded"
                          >
                            Incomplete
                          </button>
                          <button
                            onClick={() => handleAction(selectedApp, 'reject')}
                            className="border border-red-600 text-red-600 px-4 py-2 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button
                        onClick={() => handleAction(selectedApp, 'reset')}
                        className="border border-yellow-500 text-yellow-600 px-4 py-2 rounded"
                      >
                        Reset
                      </button>
                    );
                  })()}
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