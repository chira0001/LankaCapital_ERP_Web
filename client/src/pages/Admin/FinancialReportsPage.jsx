import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Download } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Label } from "@/component/ui/label";
import api from "@/lib/api";
import * as XLSX from "xlsx";

import MonthPicker from "@/components/reports/MonthPicker";
import YearPicker from "@/components/reports/YearPicker";
import dayjs from "dayjs";

const FinancialReportsPage = () => {
  const [reportType, setReportType] = useState("dashboard");

  const [month, setMonth] = useState(dayjs());
  const [year, setYear] = useState(dayjs());

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // ============================
  // FORMATTERS
  // ============================
  const formatMonth = (value) =>
    value ? value.format("YYYY-MM") : "";

  const formatYear = (value) =>
    value ? value.format("YYYY") : "";

  // ============================
  // ENDPOINTS
  // ============================
  const getEndpoint = (type) => {
    switch (type) {
      case "loans":
        return "/admin/reports/loans/monthly";
      case "expenses":
        return "/admin/reports/expenses/monthly";
      case "dashboard":
        return "/admin/financial-dashboard";
      case "cashflow":
        return "/admin/financial-cashflow";
      case "balance":
        return "/admin/financial-balance-sheet";
      case "profitloss":
        return "/admin/financial-profit-loss";
      case "statement":
        return "/admin/financial-report";
      case "annual-report":
        return "/admin/annual-report";
      case "annual-balance":
        return "/admin/annual-balance-sheet";
      case "annual-cashflow":
        return "/admin/annual-cash-flow";
      default:
        return "/admin/financial-dashboard";
    }
  };

  // ============================
  // GENERATE
  // ============================
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      let res;

      const monthlyTypes = [
        "dashboard",
        "cashflow",
        "balance",
        "profitloss",
        "statement",
        "loans",
        "expenses",
      ];

      if (monthlyTypes.includes(reportType)) {
        res = await api.get(getEndpoint(reportType), {
          params: { month: formatMonth(month) },
        });
      } else {
        res = await api.get(getEndpoint(reportType), {
          params: { year: formatYear(year) },
        });
      }

      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // EXPORT EXCEL
  // ============================
  const handleExportExcel = () => {
    if (!data) return;

    const ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Report");

    XLSX.writeFile(
      wb,
      `${reportType}_${formatMonth(month)}.xlsx`
    );
  };

  // ============================
  // PDF DOWNLOAD
  // ============================
  const handleDownloadPDF = async () => {
    try {
      const res = await api.get("/admin/financial-report/pdf", {
        params: { month: formatMonth(month) },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `financial-report_${formatMonth(month)}.pdf`
      );
      document.body.appendChild(link);
      link.click();
    } catch {
      alert("PDF download failed");
    }
  };

  // ============================
  // IMPORT EXCEL
  // ============================
  const handleImportExcel = async () => {
    if (!importFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", importFile);

      // const res = await api.post(
      //   "/admin/financial-statement/import",
      //   formData,
      //   {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //     Authorization: `Bearer ${localStorage.getItem("token")}`,
      //   },
      // }
      // );

      api.interceptors.request.use((config) => {
        const token = localStorage.getItem("token");

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      });



      setImportResult(`Imported ${res.data.length} month(s) successfully.`);
    } catch (err) {
      setImportResult(err.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // ============================
  // TABLE RENDER
  // ============================
  const renderTable = () => {
    if (!data) return null;

    if (Array.isArray(data)) {
      const allKeys = Array.from(
        data.reduce((set, row) => {
          Object.keys(row).forEach((k) => set.add(k));
          return set;
        }, new Set())
      );

      const renderCell = (val) => {
        if (val === null || val === undefined) return "-";
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
      };

      return (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              {allKeys.map((key) => (
                <th key={key} className="p-2 border text-left">
                  {key}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t">
                {allKeys.map((key) => (
                  <td key={`${i}-${key}`} className="p-2 border">
                    {renderCell(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Field</th>
            <th className="p-2 border">Value</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td className="p-2 border font-medium">{key}</td>
              <td className="p-2 border">{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // ============================
  // UI
  // ============================
  return (
    <>
      <Helmet>
        <title>Financial Reports</title>
      </Helmet>

      <h1 className="text-2xl font-bold mb-6">
        Financial Reports Dashboard
      </h1>

      {/* FILTER */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Report Type</Label>
            <select
              className="w-full border p-2 rounded"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="dashboard">Dashboard</option>
              <option value="loans">Loans</option>
              <option value="expenses">Expenses</option>
              <option value="statement">Statement</option>
              <option value="cashflow">Cash Flow</option>
              <option value="balance">Balance Sheet</option>
              <option value="profitloss">Profit & Loss</option>
              <option value="annual-report">Annual Report</option>
              <option value="annual-balance">Annual Balance Sheet</option>
              <option value="annual-cashflow">Annual Cash Flow</option>
            </select>
          </div>

          {!reportType.includes("annual") && (
            <div>
              <Label>Month</Label>
              <MonthPicker value={month} onChange={setMonth} />
            </div>
          )}

          {reportType.includes("annual") && (
            <div>
              <Label>Year</Label>
              <YearPicker value={year} onChange={setYear} />
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-600 mt-3 text-sm">{error}</p>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Loading..." : "Generate"}
          </Button>

          <Button onClick={handleExportExcel}>
            Export Excel
          </Button>

          <Button onClick={handleDownloadPDF} className="bg-red-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>

          {/* IMPORT */}
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setImportFile(e.target.files[0])}
          />

          <Button
            onClick={handleImportExcel}
            disabled={!importFile || importing}
          >
            {importing ? "Importing..." : "Import Excel"}
          </Button>

          {importResult && (
            <span className="text-sm text-gray-600">
              {importResult}
            </span>
          )}
        </div>
      </div>

      {/* OUTPUT */}
      <div className="bg-white p-6 rounded-xl shadow">
        {!data ? (
          <p className="text-gray-500">
            Select report type and generate
          </p>
        ) : (
          renderTable()
        )}
      </div>
    </>
  );
};

export default FinancialReportsPage;