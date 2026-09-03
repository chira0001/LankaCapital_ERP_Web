import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Label } from "@/component/ui/label";
import axiosApi from "../../api/axiosAPI.js";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EquityChanges from "../../component/AdminReports/EquityChanges.jsx";
import TrialBalance from "../../component/AdminReports/TrialBalance.jsx";

const FinancialReportsPage = () => {
  const [reportType, setReportType] = useState("");

  const [month, setMonth] = useState(dayjs());

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [TrialBalanceArrayData, setTrialBalanceArrayData] = useState({
    accountName: "",
    transactionType: "",
    accountType: "",
    amount: "",
    financialDate: endDate, // kept in sync with endDate input
  });

  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [assetsPayload, setAssetsPayload] = useState({
    assetName: "",
    purchasedMonth: "",
    rate: "",
    amount: "",
  });

  const [assetsList, setAssetsList] = useState([]);
  const [isAssetsListLoading, setIsAssetsListLoading] = useState(false);

  const formatMonth = useCallback((d) => dayjs(d).format("YYYY-MM"), []);

  // Memoize reportTypes so it is not recreated on every render
  const reportTypes = useMemo(
    () => [
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
    ],
    []
  );

  // -------------------- Dates --------------------
  const handleStartDateChange = useCallback((e) => {
    setStartDate(e.target.value);
  }, []);

  const handleEndDateChange = useCallback((e) => {
    const val = e.target.value;
    setEndDate(val);

    // keep TB financialDate synced for NEW rows
    setTrialBalanceArrayData((prev) => ({
      ...prev,
      financialDate: val,
    }));
  }, []);

  // -------------------- Assets --------------------
  const fetchAssets = useCallback(async () => {
    try {
      setIsAssetsListLoading(true);
      const res = await axiosApi.get("/admin/assets");
      setAssetsList(res.data);
      setIsAssetsListLoading(false);
    } catch (e) {
      setIsAssetsListLoading(false);
      toast.error("Error loading asset. Try again...");
    }
  }, []);

  const saveAssetToRegistry = useCallback(async () => {
    try {
      setIsSaving(true);
      await axiosApi.post("/admin/assets", assetsPayload);
      toast.success("Asset successfully added");
      setIsSaving(false);
      fetchAssets();
    } catch (e) {
      toast.error("Error adding asset. Try again...");
      setIsSaving(false);
      console.log(e);
    }
  }, [assetsPayload, fetchAssets]);

  // -------------------- Reports --------------------
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res = await axiosApi.get(`/admin/reports`, {
        params: {
          reportType: reportType,
          startDate: formatMonth(month),
          endDate: formatMonth(month),
        },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [reportType, month, formatMonth]);

  const handleExportExcel = useCallback(() => {
    if (!data) return;

    const ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Report");

    XLSX.writeFile(wb, `${reportType}_${formatMonth(month)}.xlsx`);
  }, [data, reportType, month, formatMonth]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      const res = await axiosApi.get("/admin/financial-report/pdf", {
        params: { month: formatMonth(month) },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `financial-report_${formatMonth(month)}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch {
      alert("PDF download failed");
    }
  }, [month, formatMonth]);

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
        <div className="w-full overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>
                {allKeys.map((key) => (
                  <th
                    key={key}
                    className="whitespace-nowrap border-b px-3 py-2 text-left font-semibold text-gray-800"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white">
              {data.map((row, i) => (
                <tr key={i} className="border-t">
                  {allKeys.map((key) => (
                    <td
                      key={`${i}-${key}`}
                      className="align-top whitespace-nowrap px-3 py-2 text-gray-700"
                    >
                      {renderCell(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-800">
                Field
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-800">
                Value
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {Object.entries(data).map(([key, value]) => (
              <tr key={key} className="border-t">
                <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-800">
                  {key}
                </td>
                <td className="px-3 py-2 text-gray-700">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const assetsCount = useMemo(() => {
    return Array.isArray(assetsList) ? assetsList.length : 0;
  }, [assetsList]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Financials Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Generate reports, export to Excel, and download PDFs.
          </p>
        </header>

        {/* Asset Registry */}
        <section className="rounded-xl border bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900">
                Asset Registry
              </h2>
              <p className="mt-0.5 text-sm text-gray-600">
                View or Add new fixed assets to your registry.
              </p>
            </div>

            {!isAddingAsset ? (
              <Button
                onClick={() => {
                  setIsAddingAsset(true);
                  fetchAssets();
                }}
              >
                Add an asset
              </Button>
            ) : (
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <div className="text-xs text-gray-500">
                  {isAssetsListLoading
                    ? "Loading assets..."
                    : `${assetsCount} assets`}
                </div>
              </div>
            )}
          </div>

          {isAddingAsset ? (
            <div className="mt-4 rounded-lg ">
              <div className="grid gap-3 lg:grid-cols-12">
                {/* Form */}
                <div className="lg:col-span-6">
                  <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Add new assets
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Enter new assets to registry entries
                      </p>
                    </div>

                    <div className="mt-4 grid gap-4">
                      <div>
                        <Label htmlFor="assetName">
                          Asset Name<span className="text-red-500">*</span>
                        </Label>
                        <input
                          id="assetName"
                          type="text"
                          name="assetName"
                          className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none ring-0 transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                          onChange={(e) => {
                            setAssetsPayload((prev) => ({
                              ...prev,
                              [e.target.name]: e.target.value,
                            }));
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-1">
                          <Label htmlFor="purchasedMonth">
                            Purchased Date<span className="text-red-500">*</span>
                          </Label>
                          <input
                            id="purchasedMonth"
                            type="date"
                            name="purchasedMonth"
                            className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                            onChange={(e) => {
                              setAssetsPayload((prev) => ({
                                ...prev,
                                [e.target.name]: e.target.value,
                              }));
                            }}
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <Label htmlFor="rate">
                            Rate (%)<span className="text-red-500">*</span>
                          </Label>
                          <input
                            id="rate"
                            type="text"
                            name="rate"
                            className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                            onChange={(e) => {
                              setAssetsPayload((prev) => ({
                                ...prev,
                                [e.target.name]: e.target.value,
                              }));
                            }}
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <Label htmlFor="amount">
                            Amount(LKR)<span className="text-red-500">*</span>
                          </Label>
                          <input
                            id="amount"
                            type="text"
                            name="amount"
                            className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                            onChange={(e) => {
                              setAssetsPayload((prev) => ({
                                ...prev,
                                [e.target.name]: e.target.value,
                              }));
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingAsset(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => saveAssetToRegistry()}
                          className="w-full sm:w-auto"
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assets List */}
                <div className="lg:col-span-6">
                  <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Existing assets
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Review the current registry entries.
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        onClick={fetchAssets}
                        disabled={isAssetsListLoading}
                      >
                        {isAssetsListLoading ? "Refreshing..." : "Refresh"}
                      </Button>
                    </div>

                    <div className="mt-4">
                      {assetsCount > 0 ? (
                        <div className="max-h-44 overflow-y-auto rounded-lg border">
                          <table className="min-w-full text-sm">
                            <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                              <tr>
                                <th className="whitespace-nowrap border-b px-3 py-2 text-left font-semibold text-gray-800">
                                  Asset Name
                                </th>
                                <th className="whitespace-nowrap border-b px-3 py-2 text-left font-semibold text-gray-800">
                                  Purchased Date
                                </th>
                                <th className="whitespace-nowrap border-b px-3 py-2 text-left font-semibold text-gray-800">
                                  Rate(%)
                                </th>
                                <th className="whitespace-nowrap border-b px-3 py-2 text-left font-semibold text-gray-800">
                                  Amount(LKR)
                                </th>
                              </tr>
                            </thead>

                            <tbody className="bg-white">
                              {assetsList.map((asset, key) => {
                                const dateStr = asset?.purchasedMonth
                                  ? new Date(asset.purchasedMonth).toLocaleDateString(
                                    "en-LK",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                  : "-";

                                return (
                                  <tr
                                    key={key}
                                    className="border-t hover:bg-gray-50/50 transition-colors"
                                  >
                                    <td className="px-3 py-2 text-gray-800">
                                      {asset?.assetName ?? "-"}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                                      {dateStr}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                                      {asset?.rate ?? "-"}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                                      {asset?.amount ?? "-"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : isAssetsListLoading ? (
                        <div className="rounded-lg border bg-gray-50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                Loading Assets Details
                              </p>
                              <p className="text-xs text-gray-500">
                                Please wait while we fetch the latest data...
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="h-8 w-full rounded bg-white/70 ring-1 ring-gray-100 animate-pulse" />
                            <div className="h-8 w-full rounded bg-white/70 ring-1 ring-gray-100 animate-pulse" />
                            <div className="h-8 w-full rounded bg-white/70 ring-1 ring-gray-100 animate-pulse" />
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-sm text-gray-600">
                          <p className="font-medium text-gray-800">
                            No assets are available
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Add a new asset using the form to start building your
                            registry.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Report Generator */}
        <section className="rounded-xl border bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900">
                Generate report
              </h2>
              <p className="mt-0.5 text-sm text-gray-600">
                Choose a date range and report type, then export or download.
              </p>
            </div>

            <div className="text-xs text-gray-500">
              Current month:{" "}
              <span className="font-medium text-gray-700">
                {formatMonth(month)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <input
                id="startDate"
                type="date"
                name=""
                onChange={handleStartDateChange}
                className="date-input mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <input
                id="endDate"
                type="date"
                name=""
                onChange={handleEndDateChange}
                className="date-input mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <TrialBalance periodStartDate={startDate} periodEndDate={endDate} />
          <EquityChanges periodStartDate={startDate} periodEndDate={endDate} />

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <select
                id="reportType"
                className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="">Select Report Type</option>
                {reportTypes.map((type, key) => (
                  <option value={type.value} key={key}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? "Loading..." : "Generate"}
            </Button>

            <Button onClick={handleExportExcel} variant="outline">
              Export Excel
            </Button>

            <Button
              onClick={handleDownloadPDF}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </section>

        {/* Output */}
        <section className="rounded-xl border bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Output</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Results appear here after generating a report.
              </p>
            </div>
            <div className="text-xs text-gray-500">
              {data ? "Report loaded" : "No data"}
            </div>
          </div>

          {!data ? (
            <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-sm text-gray-600">
              Select report type and generate
            </div>
          ) : (
            renderTable()
          )}
        </section>
      </div>
    </>
  );
};

export default FinancialReportsPage;