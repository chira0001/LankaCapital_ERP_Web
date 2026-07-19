import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Download, Calendar, FileText, AlertCircle, User, Undo2 } from 'lucide-react';
import { Button } from '@/component/ui/button';
import axiosAPI from '@/api/axiosAPI';
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

// --- Constants & Helpers ---

const formatLKR = (amount) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
  }).format(amount || 0);

// --- Sub-Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-slate-100'}`}>
      {status}
    </span>
  );
};

const PettyCashPage = () => {
  const navigate = useNavigate();
  const [pettyCashData, setPettyCashData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [opRejecting, setOpRejecting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchPettyCash();
  }, []);

  const fetchPettyCash = async () => {
    try {
      const response = await axiosAPI.get("/admin/pettyCash");
      const data = response.data;
      setPettyCashData(data);

      const grouped = data.reduce((acc, curr) => {
        const date = new Date(curr.dateTime).toLocaleDateString();
        if (!acc[date]) acc[date] = { date, collected: 0 };
        acc[date].collected += Number(curr.amount);
        return acc;
      }, {});
      setChartData(Object.values(grouped));

    } catch (error) {
      console.error("Failed to load petty cash:", error);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      setActionLoadingId(id);
      await axiosAPI.put(`/admin/pettyCash/approve/${id}`);
      await fetchPettyCash();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const reject = async (id) => {
    try {
      setOpRejecting(true);
      await axiosAPI.put(`/admin/pettyCash/reject/${id}`);
      await fetchPettyCash();
      setOpRejecting(true);
    } catch (error) {
      console.error(error);
    } finally {
      setOpRejecting(true);
    }
  };

  const undo = async (id) => {
    try {
      setActionLoadingId(id);
      const username = localStorage.getItem("username");
      await axiosAPI.put(`/admin/undo/${id}/${username}`);
      await fetchPettyCash();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = pettyCashData.map((item) => ({
      Date: new Date(item.dateTime).toLocaleDateString(),
      Employee: item.requestEmployee?.firstName || item.requestEmployee?.email || 'N/A',
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
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-xs font-medium">Synchronizing Ledger Data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Petty Cash Management - LendPro</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 p-3 md:p-6 text-sm">

        {/* Page Header - Zoomed Out */}
        <header className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Petty Cash Requests
            </h1>
            <p className="mt-1 text-slate-500 text-xs max-w-md">
              Review pending financial requests from staff members. Approve valid expenses or reject discrepancies.
            </p>
          </div>

          <Button
            onClick={handleExportExcel}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm h-9 px-4 text-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
        </header>

        {/* Main Content Area - Compact */}
        <main className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-700">
              All Transactions
              <span className="ml-2 px-2 py-px bg-slate-200 text-slate-600 rounded text-[10px]">{pettyCashData.length}</span>
            </span>
          </div>

          {/* Table - Denser Spacing */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-sm uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-200">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Requester</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3">Narration</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-md">
                {pettyCashData.length > 0 ? (
                  pettyCashData.map((record) => (
                    <tr key={record.id} className="group hover:bg-blue-50/60 transition-colors duration-150">

                      {/* DATE */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center text-slate-600">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          {new Date(record.dateTime).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      {/* EMPLOYEE */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">
                            {record.requestEmployee?.firstName || record.requestEmployee?.email || 'Unknown'}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {record.requestEmployee?.email}
                          </span>
                        </div>
                      </td>

                      {/* AMOUNT */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <span className="font-mono font-bold text-slate-900 tabular-nums text-sm">
                          {formatLKR(record.amount)}
                        </span>
                      </td>

                      {/* NARRATION */}
                      <td className="px-5 py-3.5 max-w-[220px]">
                        <p className="text-slate-500 line-clamp-2 text-md" title={record.narration}>
                          {record.narration || <span className="italic text-slate-300">No description provided</span>}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-3.5 text-center">
                        <StatusBadge status={record.request} />
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-3.5 text-right">
                        {record.request === "PENDING" ? (
                          <div className="flex justify-end items-center gap-2 opacity-75 group-hover:opacity-100 transition-opacity">

                            <button
                              disabled={actionLoadingId === record.id}
                              onClick={() => approve(record.id)}
                              className={`px-3 py-1 rounded-md text-[10px] font-semibold border transition-colors
          ${actionLoadingId === record.id
                                  ? "bg-green-200 text-green-700 cursor-not-allowed"
                                  : "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border-green-200 hover:border-green-600"
                                }`}
                            >
                              {actionLoadingId === record.id ? "Processing..." : "Approve"}
                            </button>

                            <button
                              disabled={actionLoadingId === record.id}
                              onClick={() => reject(record.id)}
                              className={`px-3 py-1 rounded-md text-[10px] font-semibold border transition-colors
          ${actionLoadingId === record.id
                                  ? "bg-red-200 text-red-700 cursor-not-allowed"
                                  : "bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border-red-200 hover:border-red-600"
                                }`}
                            >
                              {opRejecting ? "Processing..." : "Reject"}
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={actionLoadingId === record.id}
                            onClick={() => undo(record.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-medium transition-colors
        ${actionLoadingId === record.id
                                ? "bg-slate-200 text-slate-600 cursor-not-allowed"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white"
                              }`}
                          >
                            <Undo2 className="w-3 h-3" />
                            {actionLoadingId === record.id ? "Processing..." : "Undo"}
                          </button>
                        )}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
                        <p className="font-medium text-xs text-slate-500">No requests found</p>
                        <p className="text-[10px] mt-1">New entries will appear here automatically.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70">
            <p className="text-[10px] text-slate-400 text-center">
              End of ledger list • Last updated {new Date().toLocaleTimeString()}
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default PettyCashPage;