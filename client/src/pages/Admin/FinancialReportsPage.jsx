import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Download } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Label } from "@/component/ui/label";
import api from "@/lib/api";
import axiosApi from "../../api/axiosAPI.js"
import * as XLSX from "xlsx";

import dayjs from "dayjs";

const FinancialReportsPage = () => {
  const [reportType, setReportType] = useState("");

  const [month, setMonth] = useState(dayjs());
  const [year, setYear] = useState(dayjs());

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const reportTypes = [
    { value: "PPE", name: "PPE" },
    { value: "Working", name: "Working" },
    { value: "TB", name: "TB" },
    { value: "BS", name: "BS" },
    { value: "CE", name: "CE" },
    { value: "CF", name: "CF" },
    { value: "BS", name: "BS" },
    { value: "CE", name: "CE" },
    { value: "CF", name: "CF" },
    { value: "P09", name: "P09" },
    { value: "P10", name: "P10" },
    { value: "P11", name: "P11" },
    { value: "PL", name: "PL" },
    { value: "Income Tax", name: "Income Tax" },
    { value: "Statement", name: "Complete Report" },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      let res = await axiosApi.get(`/admin/reports`, {
        params: {
          reportType: reportType,
          startDate: formatMonth(month),
          endDate: formatMonth(month)
        },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDownloadPDF = async () => {
    try {
      const res = await axiosApi.get("/admin/financial-report/pdf", {
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

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        Financial Reports Dashboard
      </h1>

      {/* FILTER */}
      <div className="mb-4 rounded-xl bg-white p-3 shadow sm:mb-6 sm:p-4 lg:p-6 lg:mb-6">
        <div className="grid md:grid-cols-3 gap-4">

          <div>
            <Label>Start Date</Label>
            <input type="date" name="" id="" className="w-full border p-2 rounded" />
          </div>

          <div>
            <Label>End Date</Label>
            <input type="date" name="" id="" className="w-full border p-2 rounded" />
          </div>

          <div>
            <Label>Report Type</Label>
            <select
              className="w-full border p-2 rounded"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="">Select Report Type</option>
              {reportTypes.map((type, key) => {
                return (
                  <option value={type.value} key={key}>{type.name}</option>
                )
              })}
            </select>
          </div>

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
        </div>
      </div>

      {/* OUTPUT */}
      <div className="rounded-xl bg-white p-3 shadow sm:p-4 lg:p-6">
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