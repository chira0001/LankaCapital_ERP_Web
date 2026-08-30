import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Download, Calendar, FileText, Undo2 } from 'lucide-react';
import { Button } from '@/component/ui/button';
import axiosAPI from '@/api/axiosAPI';
import * as XLSX from 'xlsx';
import CreatableSelect from "react-select/creatable";
import { ToastContainer } from 'react-toastify';

const formatLKR = (amount) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
  }).format(amount || 0);

const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200"
  };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
};

const PettyCashPage = () => {
  const [pettyCashData, setPettyCashData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [isRowClicked, setIsRowClicked] = useState(false);
  const [pettyCashInfo, setPettyCashInfo] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const [pettyCashCategoryDetails, setPettyCashCategoryDetails] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const [pettyCashUpdatePayload, setPettyCashUpdatePayload] = useState({
    amount: "",
    narration: "",
    categoryId: ""
  });

  useEffect(() => {
    fetchPettyCash();
    fetchPettyCashCategories();
  }, []);

  const options = pettyCashCategoryDetails.map(cat => ({
    value: cat.id,
    label: cat.categoryName
  }));

  const fetchPettyCash = async () => {
    try {
      const res = await axiosAPI.get("/admin/pettyCash");
      setPettyCashData(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPettyCashCategories = async () => {
    try {
      const res = await axiosAPI.get("/admin/pettyCashCategories");
      setPettyCashCategoryDetails(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const updatePettyCashRequest = async (id) => {
    try {
      setActionLoadingId({ action: "save", id });

      let categoryId = pettyCashUpdatePayload.categoryId;

      if (newCategory.trim() !== "") {
        const categoryRes = await axiosAPI.post(
          `/admin/pettyCashCategories?newCategory=${newCategory}`
        );
        categoryId = categoryRes.data;
        await fetchPettyCashCategories();
      }

      const finalPayload = {
        amount: pettyCashUpdatePayload.amount,
        narration: pettyCashUpdatePayload.narration,
        category: categoryId
      };

      await axiosAPI.put(`/admin/pettyCash/${id}`, finalPayload);

      await fetchPettyCash();
      setIsEdit(false);
      setIsRowClicked(false);
      setNewCategory("");
    } catch (e) {
      console.log(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const approve = async (id) => {
    try {
      setActionLoadingId({ action: "approve", id });
      await axiosAPI.put(`/admin/pettyCash/approve/${id}`);
      await fetchPettyCash();
    } catch (e) {
      console.log(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const reject = async (id) => {
    try {
      setActionLoadingId({ action: "reject", id });
      await axiosAPI.put(`/admin/pettyCash/reject/${id}`);
      await fetchPettyCash();
    } catch (e) {
      console.log(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const undo = async (id) => {
    try {
      setActionLoadingId({ action: "undo", id });
      const username = localStorage.getItem("username");
      await axiosAPI.put(`/admin/undo/${id}/${username}`);
      await fetchPettyCash();
    } catch (e) {
      console.log(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = pettyCashData
      .filter(item => item.request === "APPROVED")
      .map(item => ({
        Date: new Date(item.dateTime).toLocaleDateString(),
        Amount: item.amount,
        Narration: item.narration || '',
        Category: item.pettyCashCategory?.categoryName || '',
        Requested_By: item.requestEmployee
          ? `${item.requestEmployee.firstName} ${item.requestEmployee.lastName}`
          : 'N/A',
        Updated_By: item.updatedEmployee
          ? `${item.updatedEmployee.firstName} ${item.updatedEmployee.lastName}`
          : 'N/A',
        Approved_By: item.approvedEmployee
          ? `${item.approvedEmployee.firstName} ${item.approvedEmployee.lastName}`
          : 'N/A',
        Status: item.request
      }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Petty Cash');
    XLSX.writeFile(wb, `PettyCash_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const openDetails = (record) => {
    setPettyCashInfo(record);
    setPettyCashUpdatePayload({
      amount: record.amount,
      narration: record.narration,
      categoryId: record.pettyCashCategory?.id
    });
    setIsRowClicked(true);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="min-h-screen bg-slate-50 p-3 sm:p-4 lg:p-6">
        <header className="max-w-7xl mx-auto mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end border-b pb-4">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            Petty Cash Requests
          </h1>

          <Button
            onClick={handleExportExcel}
            className="w-full sm:w-auto bg-blue-600 border border-slate-300 hover:bg-slate-100"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </header>

        <div className="lg:mx-auto lg:max-w-7xl md:hidden space-y-3">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Loading Petty Cash Information
                    </p>
                    <p className="text-xs text-gray-500">
                      Please wait while we fetch the latest data...
                    </p>
                  </div>
                </div>

                {/* simple skeleton */}
                <div className="mt-6 space-y-3">
                  <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse mt-2" />
                </div>
              </div>
            </div>
          ) : (
            pettyCashData.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border border-gray-200 bg-white shadow p-3"
                onClick={() => openDetails(record)}
                role="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(record.dateTime).toLocaleDateString()}</span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                      {record.requestEmployee?.firstName} {record.requestEmployee?.lastName}
                    </p>

                    <p className="mt-1 text-xs text-slate-600 break-words">
                      {record.narration}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Category:{" "}
                      <span className="text-slate-800 font-medium">
                        {record.pettyCashCategory?.categoryName || "—"}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-mono font-semibold text-sm sm:text-base">
                      {formatLKR(record.amount)}
                    </p>
                    <div className="mt-1 flex justify-end">
                      <StatusBadge status={record.request} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex justify-end gap-2">
                  {record.request === "PENDING" ? (
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); approve(record.id); }}
                        className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded"
                      >
                        {actionLoadingId?.action === "approve" && actionLoadingId?.id === record.id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); reject(record.id); }}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded"
                      >
                        {actionLoadingId?.action === "reject" && actionLoadingId?.id === record.id
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); undo(record.id); }}
                      className="px-3 py-1.5 text-xs bg-slate-100 rounded"
                    >
                      <Undo2 className="w-3 h-3 inline mr-1" />
                      {actionLoadingId?.action === "undo" && actionLoadingId?.id === record.id
                        ? "Undoing..."
                        : "Undo"}
                    </button>
                  )}
                </div>
              </div>
            )))
          }
        </div>

        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow lg:mx-auto lg:max-w-7xl">
          {loading ? (
            <table className="w-full">
              <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Requester</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Narration</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="ml-auto h-4 w-24 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="mx-auto h-6 w-20 rounded-full bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="ml-auto h-8 w-24 rounded bg-gray-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>
              <table className="w-full">
                <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Requester</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3">Narration</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {pettyCashData.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-100 cursor-pointer"
                      onClick={() => openDetails(record)}
                    >
                      <td className="px-6 py-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(record.dateTime).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium">
                        {record.requestEmployee?.firstName} {record.requestEmployee?.lastName}
                      </td>

                      <td className="px-6 py-4 text-right font-mono font-semibold">
                        {formatLKR(record.amount)}
                      </td>

                      <td className="px-6 py-4">{record.narration}</td>

                      <td className="px-6 py-4">
                        {record.pettyCashCategory?.categoryName || "—"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={record.request} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        {record.request === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); approve(record.id); }}
                              className="px-3 py-1 text-xs bg-emerald-50 text-emerald-700 rounded"
                            >
                              {actionLoadingId?.action === "approve" && actionLoadingId?.id === record.id
                                ? "Approving..."
                                : "Approve"}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); reject(record.id); }}
                              className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded"
                            >
                              {actionLoadingId?.action === "reject" && actionLoadingId?.id === record.id
                                ? "Rejecting..."
                                : "Reject"}
                            </button>
                          </div>
                        ) : (
                          record.request != "APPROVED" &&
                          <button
                            onClick={(e) => { e.stopPropagation(); undo(record.id); }}
                            className="px-3 py-1 text-xs bg-slate-100 rounded"
                          >
                            <Undo2 className="w-3 h-3 inline mr-1" />
                            {actionLoadingId?.action === "undo" && actionLoadingId?.id === record.id
                              ? "Undoing..."
                              : "Undo"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DETAILS DRAWER */}
        {isRowClicked && pettyCashInfo && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
            onClick={() => setIsRowClicked(false)}
          >
            <div
              className="w-full max-w-none sm:max-w-md bg-white h-full shadow-2xl p-4 sm:p-6 overflow-y-auto animate-slide-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between mb-6">
                <h2 className="font-semibold text-lg">Petty Cash Details</h2>
                <button onClick={() => setIsRowClicked(false)}>✕</button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Date</p>
                  <p>{new Date(pettyCashInfo.dateTime).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Amount</p>
                  <p className="font-bold text-lg">{formatLKR(pettyCashInfo.amount)}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Narration</p>
                  <p>{pettyCashInfo.narration}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Requested Employee</p>
                  <p>
                    {pettyCashInfo.requestEmployee.firstName} {pettyCashInfo.requestEmployee.lastName}
                    <br />
                    <span>{pettyCashInfo.requestEmployee.nic}</span>
                  </p>
                </div>

                {pettyCashInfo.updatedEmployee.email !== "" &&
                  <div>
                    <p className="text-xs text-slate-400">Updated Employee</p>
                    <p>
                      {pettyCashInfo.updatedEmployee.firstName} {pettyCashInfo.updatedEmployee.lastName}
                      <br />
                      <span>{pettyCashInfo.updatedEmployee.nic}</span>
                    </p>
                  </div>
                }

                {pettyCashInfo.approvedEmployee.email &&
                  <div>
                    <p className="text-xs text-slate-400">
                      {pettyCashInfo.request == "APPROVED" ? "Approved Employee" : "Rejected Employee"}
                    </p>
                    <p>
                      {pettyCashInfo.approvedEmployee.firstName} {pettyCashInfo.approvedEmployee.lastName}
                      <br />
                      <span>{pettyCashInfo.approvedEmployee.nic}</span>
                    </p>
                  </div>
                }

                <div>
                  <p className="text-xs text-slate-400">Category</p>
                  <p>{pettyCashInfo.pettyCashCategory?.categoryName}</p>
                </div>

                <div>
                  <StatusBadge status={pettyCashInfo.request} />
                </div>
                {pettyCashInfo.request != "APPROVED" &&
                  <button
                    onClick={() => setIsEdit(true)}
                    className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-900"
                  >
                    Edit Request
                  </button>
                }
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {isEdit && pettyCashInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Edit Petty Cash</h2>

              <div className="space-y-4">
                <span className='text-sm text-slate-400'>Amount</span>
                <input
                  type="number"
                  value={pettyCashUpdatePayload.amount}
                  onChange={(e) =>
                    setPettyCashUpdatePayload(prev => ({ ...prev, amount: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                />

                <span className='text-sm text-slate-400'>Narration</span>
                <textarea
                  value={pettyCashUpdatePayload.narration}
                  onChange={(e) =>
                    setPettyCashUpdatePayload(prev => ({ ...prev, narration: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2 h-fit"
                />

                <span className='text-sm text-slate-400'>
                  Current Category :{" "}
                  <span className='text-slate-700 font-bold'>
                    {pettyCashCategoryDetails.find(cat => cat.id === pettyCashUpdatePayload.categoryId)?.categoryName}
                  </span>
                </span>

                <CreatableSelect
                  options={options}
                  onChange={(selectedOption) => {
                    if (selectedOption.__isNew__) {
                      setNewCategory(selectedOption.label);
                      setPettyCashUpdatePayload(prev => ({
                        ...prev,
                        categoryId: null
                      }));
                    } else {
                      setPettyCashUpdatePayload(prev => ({
                        ...prev,
                        categoryId: selectedOption.value
                      }));
                      setNewCategory("");
                    }
                  }}
                  placeholder="Select or type category"
                />

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsEdit(false)}
                    className="px-4 py-2 border rounded w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updatePettyCashRequest(pettyCashInfo.id)}
                    className="px-4 py-2 bg-slate-800 text-white rounded w-full sm:w-auto"
                  >
                    {actionLoadingId?.action === "save"
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default PettyCashPage;
