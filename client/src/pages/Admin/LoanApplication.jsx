import React, { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { Textarea } from '@/component/ui/textarea';
import axiosAPI from '@/api/axiosAPI';
import { ToastContainer } from 'react-toastify';

const useToast = () => {
  return (toast) => console.log("Toast:", toast);
};

const formatLKR = (amount) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
  }).format(Number(amount) || 0);

const LoanApplication = () => {
  const toast = useToast();

  const rowsPerPage = 20;

  const [applicationData, setApplicationData] = useState([]);
  const [loading, setLoading] = useState(true);

  // backend pagination meta
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // backend search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // existing states (kept)
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showLoan, setShowLoan] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const [loanUpdatePayload, setLoanUpdatePayload] = useState({
    amount: "",
    decisionNote: "",
    documentCharge: "",
    interestRate: "",
    installment: "",
    status: ""
  });

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // when search changes, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (showLoan || isEdit) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showLoan, isEdit]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const res = await axiosAPI.get("/admin/loans", {
        params: {
          page,
          size: rowsPerPage,
          search: debouncedSearch || ""
        }
      });

      const data = res.data || {};
      const content = Array.isArray(data.content) ? data.content : [];

      setApplicationData(content);
      setTotalPages(Number(data.totalPages) || 1);
      setTotalElements(Number(data.totalElements) || 0);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplicationData([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
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
      } else if (actionType === 'reject') {
        await axiosAPI.put("/admin/reject", {
          fileNumber: selectedApp.fileNumber,
          decisionNote,
          employeeId: currentEmployeeId
        });
      } else if (actionType === 'reset') {
        await axiosAPI.put("/admin/reset", {
          fileNumber: selectedApp.fileNumber,
          employeeId: currentEmployeeId
        });
      } else if (actionType === 'incomplete') {
        await axiosAPI.put("/admin/incomplete", {
          fileNumber: selectedApp.fileNumber,
          employeeId: currentEmployeeId
        });
      }

      // refresh current page using current search
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

      await fetchApplications();

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

  const startIndex = totalElements === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIndex = Math.min(page * rowsPerPage, totalElements);

  return (
    <>
      <div className="flex w-full min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="flex-1">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl font-bold text-black sm:text-3xl">
                  Loan Applications
                </h1>
                <p className="mt-1 text-xs text-gray-500">
                  Showing {startIndex}–{endIndex} of {totalElements}
                </p>
              </div>

              {/* Backend search */}
              <div className="w-full sm:w-[320px]">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Loan ID / NIC / Name"
                />
              </div>
            </div>

            {/* ===================== MOBILE LIST (cards) ===================== */}
            {loading ? (
              <div className="md:hidden space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="mt-2 h-3 w-32 bg-gray-100 rounded animate-pulse" />
                        <div className="mt-2 h-3 w-40 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div className="shrink-0">
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                        <div className="mt-2 h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="md:hidden space-y-3">
                {applicationData.map((app) => (
                  <button
                    key={app.fileNumber}
                    type="button"
                    className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition active:scale-[0.99] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20"
                    onClick={() => {
                      setSelectedApp(app);
                      setShowLoan(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900">
                          {app.fileNumber?.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-xs text-gray-600 truncate">
                          {app.customer?.name}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500 break-all">
                          NIC: {app.customer?.nic}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusBadge(app.status)}`}>
                          {(app.status || '').toUpperCase()}
                        </span>
                        <p className="mt-2 text-xs font-semibold text-gray-900">
                          {formatLKR(app.amount)}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString("en-LK", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>

                    {app.enteredBy?.firstName && (
                      <p className="mt-3 text-[11px] text-gray-500">
                        Entered by:{" "}
                        <span className="text-gray-700 font-medium">
                          {app.enteredBy?.firstName} {app.enteredBy?.lastName}
                        </span>
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ===================== TABLE (md+) ===================== */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow">
              {loading ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr className="text-xs uppercase tracking-wide text-gray-600">
                        <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">Loan ID</th>
                        <th className="hidden px-3 py-3 text-left sm:table-cell sm:px-4 md:px-6 md:py-4">Loan Date</th>
                        <th className="hidden px-3 py-3 text-left lg:table-cell lg:px-6 lg:py-4">Applicant NIC</th>
                        <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">Name</th>
                        <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">Amount</th>
                        <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">Status</th>
                        <th className="hidden px-3 py-3 text-left lg:table-cell lg:px-6 lg:py-4">Entered By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4 text-xs sm:text-sm">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                          </td>
                          <td className="hidden px-3 py-3 sm:table-cell sm:px-4 md:px-6 md:py-4 text-xs sm:text-sm">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </td>
                          <td className="hidden px-3 py-3 lg:table-cell lg:px-6 lg:py-4 text-xs sm:text-sm">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </td>
                          <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4 text-xs sm:text-sm">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                          </td>
                          <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4 text-xs sm:text-sm">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          </td>
                          <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">
                            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                          </td>
                          <td className="hidden px-3 py-3 lg:table-cell lg:px-6 lg:py-4 text-xs sm:text-sm">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr className="text-xs uppercase tracking-wide text-gray-600">
                        <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">Loan ID</th>
                        <th className="hidden px-3 py-3 text-left sm:table-cell sm:px-4 md:px-6 md:py-4">Loan Date</th>
                        <th className="hidden px-3 py-3 text-left lg:table-cell lg:px-6 lg:py-4">Applicant NIC</th>
                        <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">Name</th>
                        <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">Amount</th>
                        <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">Status</th>
                        <th className="hidden px-3 py-3 text-left lg:table-cell lg:px-6 lg:py-4">Entered By</th>
                      </tr>
                    </thead>

                    <tbody>
                      {applicationData.map((app) => (
                        <tr
                          key={app.fileNumber}
                          className="cursor-pointer border-t transition hover:bg-gray-50"
                          onClick={() => {
                            setSelectedApp(app);
                            setShowLoan(true);
                          }}
                        >
                          <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4 text-xs sm:text-sm">
                            {app.fileNumber?.slice(0, 8)}
                          </td>
                          <td className="hidden px-3 py-3 sm:table-cell sm:px-4 md:px-6 md:py-4 text-xs sm:text-sm">
                            {new Date(app.createdAt).toLocaleDateString("en-LK", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td className="hidden px-3 py-3 lg:table-cell lg:px-6 lg:py-4 text-xs sm:text-sm">
                            {app.customer?.nic}
                          </td>
                          <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4 text-xs sm:text-sm">
                            {app.customer?.name}
                          </td>
                          <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4 text-xs sm:text-sm">
                            {formatLKR(app.amount)}
                          </td>
                          <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">
                            <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${getStatusBadge(app.status)}`}>
                              {(app.status || '').toUpperCase()}
                            </span>
                          </td>
                          <td className="hidden px-3 py-3 lg:table-cell lg:px-6 lg:py-4 text-xs sm:text-sm">
                            {app.enteredBy?.firstName} {app.enteredBy?.lastName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">
                    Page {page} of {totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile pagination */}
            {!loading && totalPages > 1 && (
              <div className="md:hidden mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}

            {/* LOAN DETAIL SECTION (unchanged) */}
            {showLoan && selectedApp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
                <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
                  <button
                    onClick={() => {
                      setShowLoan(false);
                      setSelectedApp(null);
                      setIsEdit(false);
                    }}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-black transition"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>

                  <div className="px-4 py-4 sm:px-8 sm:py-6 border-b bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Loan Details
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      File #{selectedApp.fileNumber?.slice(0, 8)}
                    </p>
                  </div>

                  <div className="p-4 sm:p-8 space-y-6 sm:space-y-10">
                    <div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                          Loan Information
                        </h3>

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
                          className="w-full sm:w-auto bg-gray-800 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-md"
                        >
                          Edit
                        </button>
                      </div>

                      {console.log("selectedApp : ", selectedApp)}

                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-sm">
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

                        <Info label="Installment Value">
                          Rs. {selectedApp.installmentValue}
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

                        <Info label="Loan Type">
                          {selectedApp.loanType || "Not available"}
                        </Info>

                        <div className="col-span-1 md:col-span-2">
                          <Info label="Loan End Date">
                            {selectedApp.endAt ? new Date(selectedApp.endAt).toLocaleString("en-LK", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            }) : "Not Entered"}
                          </Info>
                        </div>

                        {selectedApp.decisionNote ? (
                          <div className="col-span-1 md:col-span-2 lg:col-span-3 border border-gray-200 p-3 sm:p-4 rounded-md bg-white">
                            <Info label="Decision Note">
                              {selectedApp.decisionNote}
                            </Info>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
                        Customer Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-sm">
                        <Info label="NIC">{selectedApp.customer?.nic}</Info>
                        <Info label="Name">{selectedApp.customer?.name}</Info>
                        <Info label="Address">{selectedApp.customer?.address}</Info>
                        <Info label="Phone">{selectedApp.customer?.phoneNumber}</Info>
                        <Info label="Email">{selectedApp.customer?.email || "N/A"}</Info>
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

            {/* EDIT LOAN MODAL (unchanged) */}
            {isEdit && (
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4"
                onClick={() => setIsEdit(false)}
              >
                <div
                  className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setIsEdit(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-black"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>

                  <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
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

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                      <button
                        onClick={() => setIsEdit(false)}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg border"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleUpdateLoan}
                        className="w-full sm:w-auto px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
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