import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Label } from "@/component/ui/label";
import axiosApi from "../../api/axiosAPI.js";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EquityChanges from "../../component/AdminReports/EquityChanges.jsx";
import TrialBalance from "../../component/AdminReports/TrialBalance.jsx";
import Cashflow from "../../component/AdminReports/Cashflow.jsx";
import FinancialStatementNotes from "../../component/AdminReports/FinancialStatementNotes.jsx";
import NoteShare from "../../component/AdminReports/NoteShare.jsx";
import IncomeTax from "../../component/AdminReports/IncomeTax.jsx";

/**
 * Collapsible section (keeps children mounted -> state preserved).
 */
const CollapsibleSection = memo(function CollapsibleSection({
  id,
  title,
  description,
  open,
  onToggle,
  children,
}) {
  return (
    <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-5 lg:px-6 bg-gray-50 border-b">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {description}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 pt-0.5">
            <span
              className={`inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 transition-transform ${open ? "rotate-180" : "rotate-0"
                }`}
              aria-hidden="true"
            >
              <ChevronDown className="h-4 w-4 text-gray-700" />
            </span>
          </div>
        </div>
      </button>

      <div id={id} className={open ? "block" : "hidden"}>
        <div className="px-4 py-4 sm:px-5 lg:px-6">{children}</div>
      </div>
    </section>
  );
});

// -------------------- Report Output (multiple arrays -> multiple tables) --------------------

const humanTitle = (key) =>
  String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const ReportTables = memo(function ReportTables({ data }) {
  const renderCell = useCallback((val) => {
    if (val === null || val === undefined) return "-";
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  }, []);

  const renderArrayTable = useCallback(
    (rows) => {
      const safeRows = Array.isArray(rows) ? rows : [];

      const allKeys = Array.from(
        safeRows.reduce((set, row) => {
          Object.keys(row || {}).forEach((k) => set.add(k));
          return set;
        }, new Set())
      );

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
              {safeRows.map((row, i) => (
                <tr key={i} className="border-t">
                  {allKeys.map((key) => (
                    <td
                      key={`${i}-${key}`}
                      className="align-top whitespace-nowrap px-3 py-2 text-gray-700"
                    >
                      {renderCell(row?.[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
    [renderCell]
  );

  const renderObjectTable = useCallback(
    (obj) => (
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
            {Object.entries(obj || {}).map(([k, v]) => (
              <tr key={k} className="border-t">
                <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-800">
                  {k}
                </td>
                <td className="px-3 py-2 text-gray-700">{renderCell(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    [renderCell]
  );

  const sortedSections = useMemo(() => {
    if (!data) return [];

    // If API returns a top-level array, render it once as a single section.
    if (Array.isArray(data)) {
      return [{ key: "report", value: data }];
    }

    if (typeof data !== "object") {
      return [{ key: "report", value: { value: data } }];
    }

    // Preferred section order (others appended after)
    const preferredOrder = [
      "ppe",
      "tb",
      "incometax",
      "incomeTax",
      "p10",
      "p09",
      "p11",
      "pl",
      "bs",
      "ce",
      "cf",
      "working",
      "statement",
    ];

    const entries = Object.entries(data);

    const preferred = preferredOrder
      .filter((k) => Object.prototype.hasOwnProperty.call(data, k))
      .map((k) => [k, data[k]]);

    const rest = entries.filter(([k]) => !preferredOrder.includes(k));

    return [...preferred, ...rest].map(([key, value]) => ({ key, value }));
  }, [data]);

  if (!data) return null;

  // Single array response: show without heading (keeps old feel)
  if (Array.isArray(data)) {
    return renderArrayTable(data);
  }

  return (
    <div className="space-y-6">
      {sortedSections.map(({ key, value }) => {
        const isArray = Array.isArray(value);

        // Skip empty arrays (optional, same behavior as your earlier snippet)
        if (isArray && value.length === 0) return null;

        return (
          <section key={key} className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900">
              {humanTitle(key)}
            </h3>

            {isArray ? (
              renderArrayTable(value)
            ) : value && typeof value === "object" ? (
              renderObjectTable(value)
            ) : (
              renderObjectTable({ value })
            )}
          </section>
        );
      })}
    </div>
  );
});

const FinancialReportsPage = () => {
  const [reportType, setReportType] = useState("");
  const [month, setMonth] = useState(dayjs());

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // kept (existing)
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [assetsPayload, setAssetsPayload] = useState({
    assetName: "",
    purchasedMonth: "",
    depreciationMonth: "",
    rate: "",
    amount: "",
  });

  const [assetsList, setAssetsList] = useState([]);
  const [isAssetsListLoading, setIsAssetsListLoading] = useState(false);

  const assetsCount = useMemo(
    () => (Array.isArray(assetsList) ? assetsList.length : 0),
    [assetsList]
  );

  // (was commented out; needed by export/pdf handlers)
  const formatMonth = useCallback((d) => dayjs(d).format("YYYY-MM"), []);

  const reportTypes = useMemo(
    () => [
      { value: "ppe", name: "PPE" },
      { value: "working", name: "Working" },
      { value: "tb", name: "TB" },
      { value: "bs", name: "BS" },
      { value: "ce", name: "CE" },
      { value: "cf", name: "CF" },
      { value: "p09", name: "P09" },
      { value: "p10", name: "P10" },
      { value: "p11", name: "P11" },
      { value: "pl", name: "PL" },
      { value: "incomeTax", name: "Income Tax" },
      { value: "statement", name: "Complete Report" },
    ],
    []
  );

  // -------------------- Date handlers --------------------
  const handleStartDateChange = useCallback((e) => {
    setStartDate(e.target.value);
  }, []);

  const handleEndDateChange = useCallback((e) => {
    const val = e.target.value;
    setEndDate(val);
  }, []);

  // -------------------- Assets --------------------
  const fetchAssets = useCallback(async () => {
    try {
      setIsAssetsListLoading(true);
      const res = await axiosApi.get("/admin/assets");
      setAssetsList(res.data);
    } catch (e) {
      toast.error("Error loading asset. Try again...");
    } finally {
      setIsAssetsListLoading(false);
    }
  }, []);

  const saveAssetToRegistry = useCallback(async () => {
    try {
      setIsSaving(true);
      await axiosApi.post("/admin/assets", assetsPayload);
      toast.success("Asset successfully added");
      fetchAssets();
    } catch (e) {
      toast.error("Error adding asset. Try again...");
      console.log(e);
    } finally {
      setIsSaving(false);
    }
  }, [assetsPayload, fetchAssets]);

  // -------------------- Reports --------------------
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);

    console.log(
      "Generate Payload : ",
      "reportType - " +
      reportType +
      ", startDate - " +
      startDate +
      ", endDate - " +
      endDate
    );

    try {
      const res = await axiosApi.get(`/admin/reports`, {
        params: {
          reportType,
          startDate: startDate,
          endDate: endDate,
        },
      });
      console.log("res.data : ", res.data);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate]);

  const handleExportExcel = useCallback(async () => {
    if (!data || !Array.isArray(data.ppe)) return;

    try {
      const templateUrl = encodeURI("/templates/Audited Accounts 2425.xlsx");
      const response = await fetch(templateUrl);
      if (!response.ok) {
        toast.error("Excel template not found");
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });
      const date1904 = !!wb?.Workbook?.WBProps?.date1904;

      const toExcelSerial = (jsDate) => {
        if (!(jsDate instanceof Date) || Number.isNaN(jsDate.getTime())) return null;
        const epoch = Date.UTC(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
        const excelEpoch = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30); // 1900 system base
        return (epoch - excelEpoch) / 86400000;
      };

      const parseISOToSerial = (iso) => {
        if (!iso) return null;
        const d = dayjs(iso);
        if (!d.isValid()) return null;
        return toExcelSerial(d.toDate());
      };

      const ppeSheetName =
        wb.SheetNames.find((n) => n?.trim?.().toLowerCase() === "ppe") || "PPE";
      const ws = wb.Sheets[ppeSheetName];

      if (!ws) {
        toast.error("PPE sheet not found in template");
        return;
      }
      const isBlank = (v) => v === null || v === undefined || String(v).trim() === "";
      const addrOf = (r, c) => XLSX.utils.encode_cell({ r, c });
      const getCell = (r, c) => ws[addrOf(r, c)];

      const setCellValuePreserveStyle = (r, c, { t, v, z, numFmt }) => {
        const a = addrOf(r, c);
        const cell = ws[a];
        if (!cell) return;

        if (cell.f) return;

        cell.t = t;
        cell.v = v;

        if (z) cell.z = z;
        if (numFmt) {
          cell.z = cell.z || numFmt;
          cell.s = cell.s || {};
          cell.s.numFmt = cell.s.numFmt || numFmt;
        }
      };

      const cloneTemplateRowTo = (templateRow0, targetRow0, maxCol) => {
        const fromRowNum1 = templateRow0 + 1;
        const toRowNum1 = targetRow0 + 1;
        for (let c = 0; c <= maxCol; c++) {
          const srcAddr = addrOf(templateRow0, c);
          const dstAddr = addrOf(targetRow0, c);

          const src = ws[srcAddr];
          if (!src) continue;
          if (ws[dstAddr]) continue;
          const cloned = { ...src };

          if (cloned.f) {
            cloned.f = String(cloned.f).replace(
              /(\$?[A-Z]{1,3})(\$?)(\d+)/g,
              (m, col, rowAbs, rowStr) => {
                const rowNum = Number(rowStr);
                if (rowAbs === "$") return m;
                if (rowNum === fromRowNum1) return `${col}${rowAbs}${toRowNum1}`;
                return m;
              }
            );
            cloned.v = 0;
            cloned.t = cloned.t || "n";
          }

          ws[dstAddr] = cloned;
        }

        if (Array.isArray(ws["!rows"]) && ws["!rows"][templateRow0] && !ws["!rows"][targetRow0]) {
          ws["!rows"][targetRow0] = { ...ws["!rows"][templateRow0] };
        }
      };

      const shiftRowsDown = (startRow0, delta) => {
        if (delta <= 0) return;

        const keys = Object.keys(ws).filter((k) => !k.startsWith("!"));
        const decoded = keys.map((a) => {
          const { r, c } = XLSX.utils.decode_cell(a);
          return { a, r, c };
        });

        decoded.sort((x, y) => y.r - x.r || y.c - x.c);

        for (const { a, r, c } of decoded) {
          if (r < startRow0) continue;
          const newAddr = addrOf(r + delta, c);
          ws[newAddr] = ws[a];
          delete ws[a];
        }

        if (Array.isArray(ws["!merges"])) {
          ws["!merges"] = ws["!merges"].map((m) => {
            const nm = { s: { ...m.s }, e: { ...m.e } };
            if (nm.s.r >= startRow0) {
              nm.s.r += delta;
              nm.e.r += delta;
            } else if (nm.e.r >= startRow0) {
              nm.e.r += delta;
            }
            return nm;
          });
        }

        if (Array.isArray(ws["!rows"])) {
          const newRows = [];
          for (let i = 0; i < ws["!rows"].length; i++) {
            const rowObj = ws["!rows"][i];
            if (!rowObj) continue;
            if (i >= startRow0) newRows[i + delta] = rowObj;
            else newRows[i] = rowObj;
          }
          ws["!rows"] = newRows;
        }
      };
      const range0 = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
      let headerRow0 = null;
      for (const a of Object.keys(ws)) {
        if (a.startsWith("!")) continue;
        const cell = ws[a];
        if (!cell) continue;
        if (typeof cell.v === "string" && cell.v.trim().toLowerCase() === "asset") {
          const d = XLSX.utils.decode_cell(a);
          if (d.c === 0) {
            headerRow0 = d.r;
            break;
          }
          if (headerRow0 === null) headerRow0 = d.r;
        }
      }
      const startRow0 = headerRow0 !== null ? headerRow0 + 1 : 3;
      const COLS = {
        ASSET: 0,
        PURCHASED: 1,
        RATE: 2,
        AMOUNT: 3,
        DEP_START: 4,
        DATE: 5,
        DEP_AMOUNT: 6,
      };
      const maxCol = COLS.DEP_AMOUNT;
      let dummyCount = 0;
      let totalsRow0 = null;

      for (let r = startRow0; r <= range0.e.r; r++) {
        const assetVal = getCell(r, COLS.ASSET)?.v;
        if (!isBlank(assetVal)) {
          dummyCount++;
          continue;
        }
        if (dummyCount > 0) {
          totalsRow0 = r;
          break;
        }
      }

      if (dummyCount === 0) {
        dummyCount = 2;
        totalsRow0 = startRow0 + dummyCount;
      }
      if (totalsRow0 === null) totalsRow0 = startRow0 + dummyCount;

      const templateRow0 = startRow0;
      const templatePurchasedCell = getCell(templateRow0, COLS.PURCHASED);
      const templateDepStartCell = getCell(templateRow0, COLS.DEP_START);

      const dateNumFmt =
        templatePurchasedCell?.z ||
        templatePurchasedCell?.s?.numFmt ||
        templateDepStartCell?.z ||
        templateDepStartCell?.s?.numFmt ||
        "mmm-yy";

        const rows = data.ppe;
      const desiredCount = rows.length;
      const delta = desiredCount - dummyCount;

      if (delta > 0) shiftRowsDown(totalsRow0, delta);
      const newTotalsRow0 = totalsRow0 + Math.max(delta, 0);

      for (let i = 0; i < desiredCount; i++) {
        const r0 = startRow0 + i;

        cloneTemplateRowTo(templateRow0, r0, maxCol);

        const item = rows[i] || {};
        const purchasedSerial = parseISOToSerial(item.monthOfPurchased);
        const depStartSerial = parseISOToSerial(item.monthStartingDepreciation);
        setCellValuePreserveStyle(r0, COLS.ASSET, { t: "s", v: item.asset ?? "" });
        setCellValuePreserveStyle(r0, COLS.PURCHASED, {
          t: "n",
          v: purchasedSerial ?? "",
          z: dateNumFmt,
          numFmt: dateNumFmt,
        });

        setCellValuePreserveStyle(r0, COLS.RATE, {
          t: "n",
          v: Number(item.rate ?? 0) || 0,
        });

        setCellValuePreserveStyle(r0, COLS.AMOUNT, {
          t: "n",
          v: Number(item.amount ?? 0) || 0,
        });

        setCellValuePreserveStyle(r0, COLS.DEP_START, {
          t: "n",
          v: depStartSerial ?? "",
          z: dateNumFmt,
          numFmt: dateNumFmt,
        });

        setCellValuePreserveStyle(r0, COLS.DATE, {
          t: "n",
          v: Number(item.date ?? 0) || 0,
        });
      }

      if (desiredCount < dummyCount) {
        for (let r0 = startRow0 + desiredCount; r0 < startRow0 + dummyCount; r0++) {
          cloneTemplateRowTo(templateRow0, r0, maxCol);
          setCellValuePreserveStyle(r0, COLS.ASSET, { t: "s", v: "" });
          setCellValuePreserveStyle(r0, COLS.PURCHASED, {
            t: "s",
            v: "",
            z: dateNumFmt,
            numFmt: dateNumFmt,
          });
          setCellValuePreserveStyle(r0, COLS.RATE, { t: "s", v: "" });
          setCellValuePreserveStyle(r0, COLS.AMOUNT, { t: "s", v: "" });
          setCellValuePreserveStyle(r0, COLS.DEP_START, {
            t: "s",
            v: "",
            z: dateNumFmt,
            numFmt: dateNumFmt,
          });
          setCellValuePreserveStyle(r0, COLS.DATE, { t: "s", v: "" });
        }
      }
      const firstDataRowNum1 = startRow0 + 1;
      const lastDataRowNum1 = startRow0 + desiredCount;

      const updateSumIfFormula = (r0, c, colLetter) => {
        const a = addrOf(r0, c);
        const cell = ws[a];
        if (!cell || !cell.f) return;
        if (desiredCount <= 0) {
          cell.f = "0";
          cell.v = 0;
          cell.t = "n";
          return;
        }
        cell.f = `SUM(${colLetter}${firstDataRowNum1}:${colLetter}${lastDataRowNum1})`;
        cell.v = 0;
        cell.t = "n";
      };

      updateSumIfFormula(newTotalsRow0, COLS.AMOUNT, "D");
      updateSumIfFormula(newTotalsRow0, COLS.DEP_AMOUNT, "G");
      const newRange = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
      if (delta > 0 && totalsRow0 <= newRange.e.r) newRange.e.r += delta;
      newRange.e.r = Math.max(newRange.e.r, newTotalsRow0, startRow0 + desiredCount);
      ws["!ref"] = XLSX.utils.encode_range(newRange);

      XLSX.writeFile(wb, `Audited Accounts ${formatMonth(month)}.xlsx`);
    } catch (error) {
      console.error(error);
      toast.error("Excel export failed");
    }
  }, [data, month, formatMonth]);

  const handleDownloadPDF = useCallback(async () => {
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
  }, [month, formatMonth]);

  // -------------------- Collapsible states --------------------
  const [sectionsOpen, setSectionsOpen] = useState({
    trialBalance: true,
    equityChanges: false,
    cashflow: false,
    financialNotes: false,
    noteShare: false,
    incomeTax: false,
  });

  const toggleSection = useCallback((key) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // -------------------- Height sync: form -> list (lg+) --------------------
  const formCardRef = useRef(null);
  const [formCardHeight, setFormCardHeight] = useState(null);
  const [isLgUp, setIsLgUp] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsLgUp(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useLayoutEffect(() => {
    if (!isAddingAsset || !isLgUp) return;

    const el = formCardRef.current;
    if (!el) return;

    const measure = () => {
      const h = el.getBoundingClientRect().height;
      if (h) setFormCardHeight(Math.ceil(h));
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isAddingAsset, isLgUp]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mx-auto w-full max-w-7xl space-y-6 p-3 sm:p-4 lg:p-6">
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
            <div className="mt-4 rounded-lg">
              <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
                {/* Form */}
                <div className="lg:col-span-4">
                  <div
                    ref={formCardRef}
                    className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100"
                  >
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
                          className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                          onChange={(e) => {
                            setAssetsPayload((prev) => ({
                              ...prev,
                              [e.target.name]: e.target.value,
                            }));
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
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

                        <div>
                          <Label htmlFor="depreciationMonth">
                            Depreciation Date
                            <span className="text-red-500">*</span>
                          </Label>
                          <input
                            id="depreciationMonth"
                            type="date"
                            name="depreciationMonth"
                            className="mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                            onChange={(e) => {
                              setAssetsPayload((prev) => ({
                                ...prev,
                                [e.target.name]: e.target.value,
                              }));
                            }}
                          />
                        </div>

                        <div>
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

                        <div>
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
                <div className="lg:col-span-8">
                  <div
                    className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100 flex flex-col"
                    style={
                      isLgUp && formCardHeight
                        ? { height: `${formCardHeight}px` }
                        : undefined
                    }
                  >
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

                    <div className="mt-4 flex-1 min-h-0">
                      {assetsCount > 0 ? (
                        <div className="h-full overflow-y-auto rounded-lg border">
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
                                  Depreciated Date
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
                                  ? new Date(
                                    asset.purchasedMonth
                                  ).toLocaleDateString("en-LK", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                  : "-";

                                const depDateStr = asset?.depreciationMonth
                                  ? new Date(
                                    asset.depreciationMonth
                                  ).toLocaleDateString("en-LK", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
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
                                      {depDateStr}
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
                        <div className="h-full rounded-lg border bg-gray-50 p-4">
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
                        <div className="h-full rounded-lg border border-dashed bg-gray-50 p-6 text-sm text-gray-600">
                          <p className="font-medium text-gray-800">
                            No assets are available
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Add a new asset using the form to start building
                            your registry.
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

        {/* Report Generator + Collapsible notes */}
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
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <input
                id="startDate"
                type="date"
                onChange={handleStartDateChange}
                className="date-input mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <input
                id="endDate"
                type="date"
                onChange={handleEndDateChange}
                className="date-input mt-1 w-full rounded-md border bg-white p-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <CollapsibleSection
              id="trial-balance"
              title="Trial Balance"
              description="Add trial balance lines and review existing inputs for the selected period."
              open={sectionsOpen.trialBalance}
              onToggle={() => toggleSection("trialBalance")}
            >
              <TrialBalance
                periodStartDate={startDate}
                periodEndDate={endDate}
              />
            </CollapsibleSection>

            <CollapsibleSection
              id="equity-changes"
              title="Equity Changes"
              description="Enter equity movement values and save them for the period."
              open={sectionsOpen.equityChanges}
              onToggle={() => toggleSection("equityChanges")}
            >
              <EquityChanges
                periodStartDate={startDate}
                periodEndDate={endDate}
              />
            </CollapsibleSection>

            <CollapsibleSection
              id="cashflow"
              title="Cash Flow"
              description="Enter cash flow values for the selected period."
              open={sectionsOpen.cashflow}
              onToggle={() => toggleSection("cashflow")}
            >
              <Cashflow periodStartDate={startDate} periodEndDate={endDate} />
            </CollapsibleSection>

            <CollapsibleSection
              id="financial-notes"
              title="Financial Statement Notes (Assets)"
              description="Enter opening and depreciation balances per asset."
              open={sectionsOpen.financialNotes}
              onToggle={() => toggleSection("financialNotes")}
            >
              <FinancialStatementNotes
                periodStartDate={startDate}
                periodEndDate={endDate}
              />
            </CollapsibleSection>

            <CollapsibleSection
              id="note-share"
              title="Notes: Shares (P11)"
              description="Enter number of shares for the period."
              open={sectionsOpen.noteShare}
              onToggle={() => toggleSection("noteShare")}
            >
              <NoteShare periodStartDate={startDate} periodEndDate={endDate} />
            </CollapsibleSection>

            <CollapsibleSection
              id="income-tax"
              title="Income Tax"
              description="Enter income tax notes for the period (locked once saved)."
              open={sectionsOpen.incomeTax}
              onToggle={() => toggleSection("incomeTax")}
            >
              <IncomeTax
                periodStartDate={startDate}
                periodEndDate={endDate}
              />
            </CollapsibleSection>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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
            <ReportTables data={data} />
          )}
        </section>
      </div>
    </>
  );
};

export default FinancialReportsPage;