import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Download, Calendar, FileText, Undo2 } from 'lucide-react';
import { Button } from '@/component/ui/button';
import axiosAPI from '@/api/axiosAPI';
import * as XLSX from 'xlsx';

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

  const fetchPettyCash = async () => {
    const res = await axiosAPI.get("/admin/pettyCash");
    setPettyCashData(res.data);
    setLoading(false);
  };

  const fetchPettyCashCategories = async () => {
    const res = await axiosAPI.get("/admin/pettyCashCategories");
    setPettyCashCategoryDetails(res.data);
  };

  const updatePettyCashRequest = async (id) => {
    try {

      let categoryId = pettyCashUpdatePayload.categoryId;

      // ✅ Create new category if provided
      if (newCategory.trim() !== "") {
        const categoryRes = await axiosAPI.post(
          "/admin/pettyCashCategories",
          { categoryName: newCategory }
        );
        categoryId = categoryRes.data.id;
      }

      const finalPayload = {

        amount: pettyCashUpdatePayload.amount,
        // amount : 1000.0,
        narration: pettyCashUpdatePayload.narration,
        category: categoryId
      };

      console.log("finalPayload : ", finalPayload)
      await axiosAPI.put(`/admin/pettyCash/${id}`, finalPayload);

      await fetchPettyCash();
      setIsEdit(false);
      setIsRowClicked(false);
      setNewCategory("");

    } catch (e) {
      console.log(e);
    }
  };

  const approve = async (id) => {
    setActionLoadingId(id);
    await axiosAPI.put(`/admin/pettyCash/approve/${id}`);
    await fetchPettyCash();
    setActionLoadingId(null);
  };

  const reject = async (id) => {
    setActionLoadingId(id);
    await axiosAPI.put(`/admin/pettyCash/reject/${id}`);
    await fetchPettyCash();
    setActionLoadingId(null);
  };

  const undo = async (id) => {
    setActionLoadingId(id);
    const username = localStorage.getItem("username");
    await axiosAPI.put(`/admin/undo/${id}/${username}`);
    await fetchPettyCash();
    setActionLoadingId(null);
  };

  const handleExportExcel = () => {
    const exportData = pettyCashData.map((item) => ({
      Date: new Date(item.dateTime).toLocaleDateString(),
      Employee: item.requestEmployee?.firstName || 'N/A',
      Amount: item.amount,
      Narration: item.narration || '',
      Status: item.request
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Petty Cash');
    XLSX.writeFile(wb, `PettyCash_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Petty Cash Management</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 p-6">

        {/* HEADER */}
        <header className="max-w-7xl mx-auto mb-6 flex justify-between items-end border-b pb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Petty Cash Requests
          </h1>

          <Button
            onClick={handleExportExcel}
            className="bg-white border border-slate-300 hover:bg-slate-100"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </header>

        {/* TABLE */}
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
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
                    onClick={() => {
                      setPettyCashInfo(record);
                      setPettyCashUpdatePayload({
                        amount: record.amount,
                        narration: record.narration,
                        categoryId: record.pettyCashCategory?.id
                      });
                      setIsRowClicked(true);
                    }}
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
                          <button onClick={(e) => { e.stopPropagation(); approve(record.id); }}
                            className="px-3 py-1 text-xs bg-emerald-50 text-emerald-700 rounded">
                            Approve
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); reject(record.id); }}
                            className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); undo(record.id); }}
                          className="px-3 py-1 text-xs bg-slate-100 rounded">
                          <Undo2 className="w-3 h-3 inline mr-1" />
                          Undo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* DETAILS DRAWER */}
        {isRowClicked && pettyCashInfo && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
            onClick={() => setIsRowClicked(false)}
          >
            <div
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slide-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between mb-6">
                <h2 className="font-semibold text-lg">Petty Cash Details</h2>
                <button onClick={() => setIsRowClicked(false)}>✕</button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Amount</p>
                  <p className="font-bold text-lg">{formatLKR(pettyCashInfo.amount)}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Narration</p>
                  <p>{pettyCashInfo.narration}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Category</p>
                  <p>{pettyCashInfo.pettyCashCategory?.categoryName}</p>
                </div>

                <div>
                  <StatusBadge status={pettyCashInfo.request} />
                </div>

                <button
                  onClick={() => setIsEdit(true)}
                  className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-900"
                >
                  Edit Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {isEdit && pettyCashInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
              <h2 className="text-lg font-semibold mb-4">Edit Petty Cash</h2>

              <div className="space-y-4">
                <input
                  type="number"
                  value={pettyCashUpdatePayload.amount}
                  onChange={(e) =>
                    setPettyCashUpdatePayload(prev => ({ ...prev, amount: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                />

                <textarea
                  value={pettyCashUpdatePayload.narration}
                  onChange={(e) =>
                    setPettyCashUpdatePayload(prev => ({ ...prev, narration: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                />

                <select
                  value={pettyCashUpdatePayload.categoryId}
                  onChange={(e) =>
                    setPettyCashUpdatePayload(prev => ({ ...prev, categoryId: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Category</option>
                  {pettyCashCategoryDetails.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Or create new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />

                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setIsEdit(false)}
                    className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button
                    onClick={() => updatePettyCashRequest(pettyCashInfo.id)}
                    className="px-4 py-2 bg-slate-800 text-white rounded">
                    Save Changes
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