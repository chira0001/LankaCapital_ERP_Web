import * as XLSX from "xlsx";
import dayjs from "dayjs";

/**
 * Case-insensitive sheet getter
 */
function getSheetByNameInsensitive(wb, desiredName) {
    const found =
        wb.SheetNames.find(
            (n) => String(n).trim().toLowerCase() === String(desiredName).trim().toLowerCase()
        ) || desiredName;

    return { sheetName: found, ws: wb.Sheets[found] };
}

/**
 * Shared helpers (PPE + Working)
 */
function makeDateSerialHelpers(wb) {
    const date1904 = !!wb?.Workbook?.WBProps?.date1904;

    const toExcelSerial = (jsDate) => {
        if (!(jsDate instanceof Date) || Number.isNaN(jsDate.getTime())) return null;
        const epoch = Date.UTC(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
        const excelEpoch = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30);
        return (epoch - excelEpoch) / 86400000;
    };

    const parseToSerial = (value) => {
        if (!value) return null;
        if (value instanceof Date) return toExcelSerial(value);

        // Most common: "2026-06-01" or ISO datetime
        if (typeof value === "string" || typeof value === "number") {
            const d = dayjs(value);
            if (!d.isValid()) return null;
            return toExcelSerial(d.toDate());
        }

        return null;
    };

    return { toExcelSerial, parseToSerial };
}

const isBlank = (v) => v === null || v === undefined || String(v).trim() === "";

const addrOf = (r, c) => XLSX.utils.encode_cell({ r, c });

function getCell(ws, r, c) {
    return ws[addrOf(r, c)];
}

/**
 * PPE behavior: do NOT create missing cells (preserve template only)
 */
function setCellValuePreserveStyle(ws, r, c, { t, v, z, numFmt }) {
    const a = addrOf(r, c);
    const cell = ws[a];
    if (!cell) return;
    if (cell.f) return; // do not override formulas

    cell.t = t;
    cell.v = v;

    if (z) cell.z = z;
    if (numFmt) {
        cell.z = cell.z || numFmt;
        cell.s = cell.s || {};
        cell.s.numFmt = cell.s.numFmt || numFmt;
    }
}

/**
 * Working fallback behavior: create if missing (still won't override formulas)
 */
function setCellValueCreateIfMissing(ws, r, c, { t, v, z, numFmt }) {
    const a = addrOf(r, c);
    const cell = ws[a] || (ws[a] = {});
    if (cell.f) return;

    cell.t = t;
    cell.v = v;

    if (z) cell.z = z;
    if (numFmt) {
        cell.z = cell.z || numFmt;
        cell.s = cell.s || {};
        cell.s.numFmt = cell.s.numFmt || numFmt;
    }
}

function cloneTemplateRowTo(ws, templateRow0, targetRow0, maxCol) {
    const fromRowNum1 = templateRow0 + 1;
    const toRowNum1 = targetRow0 + 1;

    for (let c = 0; c <= maxCol; c++) {
        const srcAddr = addrOf(templateRow0, c);
        const dstAddr = addrOf(targetRow0, c);

        const src = ws[srcAddr];
        if (!src) continue;
        if (ws[dstAddr]) continue; // keep existing cell (preserve style of already-created rows)

        const cloned = { ...src };

        // Adjust row refs inside formulas when cloning the template row
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
}

function shiftRowsDown(ws, startRow0, delta) {
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
}

function findCellByTextInsensitive(ws, desiredText, { col = null } = {}) {
    const wanted = String(desiredText).trim().toLowerCase();

    for (const a of Object.keys(ws)) {
        if (a.startsWith("!")) continue;
        const cell = ws[a];
        if (!cell) continue;
        if (typeof cell.v !== "string") continue;

        if (cell.v.trim().toLowerCase() !== wanted) continue;

        const d = XLSX.utils.decode_cell(a);
        if (col !== null && d.c !== col) continue;

        return { a, r: d.r, c: d.c, cell };
    }
    return null;
}

function updateSheetRefEndRow(ws, endRow0) {
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
    range.e.r = Math.max(range.e.r, endRow0);
    ws["!ref"] = XLSX.utils.encode_range(range);
}

/**
 * Heuristic: skip a "column titles" row (e.g. "Date | Amount", "Name | Amount")
 */
function looksLikeColumnTitlesRow(ws, row0, keyCol, maxCol) {
    const lower = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");

    const key = lower(getCell(ws, row0, keyCol)?.v);
    const v1 = lower(getCell(ws, row0, keyCol + 1)?.v);

    if (!key && !v1) return false;

    const keyLooksLikeTitle =
        ["name", "category", "description", "asset", "date", "month"].includes(key) ||
        key.includes("name") ||
        key.includes("date") ||
        key.includes("month") ||
        key.includes("category");

    const otherLooksLikeAmount = v1 === "amount" || v1.includes("amount") || v1 === "value";

    // Also consider any cell in the row to be "amount"
    let anyAmount = otherLooksLikeAmount;
    for (let c = keyCol; c <= maxCol; c++) {
        const vv = lower(getCell(ws, row0, c)?.v);
        if (vv === "amount" || vv.includes("amount") || vv === "value") {
            anyAmount = true;
            break;
        }
    }

    return keyLooksLikeTitle && anyAmount;
}

/**
 * Fill a "section table" in Working sheet:
 * - finds section header by text in column A
 * - uses template row below header (skipping column-title row if present)
 * - expands by shifting everything below the boundary row down
 */
function fillWorkingSectionTableDynamic({
    ws,
    headerText,
    headerCol = 0,
    keyCol = 0,
    maxCol,
    items,
    sectionHeadersLower, // used to stop scanning at next section
    writeRow, // (row0, item) => void
    clearRow, // (row0) => void
    sumColLetter = null, // optional: update SUM in totals row if a formula exists
    sumRowColIndex = null, // optional: which column holds SUM formula on totals row
}) {
    const headerCell = findCellByTextInsensitive(ws, headerText, { col: headerCol });
    if (!headerCell) return { mode: "not-found" };

    const range0 = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");

    // Pick template row: first "real" row after header (skip blank rows and optional title row)
    let templateRow0 = headerCell.r + 1;
    while (templateRow0 <= range0.e.r) {
        // find first row that has any cell objects in 0..maxCol
        let rowHasAny = false;
        for (let c = 0; c <= maxCol; c++) {
            if (getCell(ws, templateRow0, c)) {
                rowHasAny = true;
                break;
            }
        }
        if (!rowHasAny) {
            templateRow0++;
            continue;
        }

        if (looksLikeColumnTitlesRow(ws, templateRow0, keyCol, maxCol)) {
            templateRow0++;
            continue;
        }

        break;
    }

    // Determine dummyCount + boundary row
    let dummyCount = 0;
    let boundaryRow0 = null;
    let totalsRow0 = null;

    for (let r = templateRow0; r <= range0.e.r; r++) {
        const keyVal = getCell(ws, r, keyCol)?.v;

        // stop at blank row AFTER at least 1 dummy row
        if (isBlank(keyVal)) {
            if (dummyCount > 0) {
                boundaryRow0 = r;
                break;
            }
            continue;
        }

        // stop at "Total..." row
        if (typeof keyVal === "string" && keyVal.trim().toLowerCase().includes("total")) {
            totalsRow0 = r;
            boundaryRow0 = r;
            break;
        }

        // stop if we hit the next section header
        if (typeof keyVal === "string") {
            const k = keyVal.trim().toLowerCase();
            if (sectionHeadersLower.includes(k) && k !== String(headerText).trim().toLowerCase()) {
                boundaryRow0 = r;
                break;
            }
        }

        dummyCount++;
    }

    if (dummyCount === 0) {
        dummyCount = 1;
        boundaryRow0 = boundaryRow0 ?? templateRow0 + 1;
    }
    if (boundaryRow0 === null) boundaryRow0 = templateRow0 + dummyCount;

    const desiredCount = items.length;
    const delta = desiredCount - dummyCount;

    if (delta > 0) shiftRowsDown(ws, boundaryRow0, delta);
    const newBoundaryRow0 = boundaryRow0 + Math.max(delta, 0);
    const firstDataRowNum1 = templateRow0 + 1;
    const lastDataRowNum1 = templateRow0 + desiredCount;

    // write rows
    for (let i = 0; i < desiredCount; i++) {
        const r0 = templateRow0 + i;
        cloneTemplateRowTo(ws, templateRow0, r0, maxCol);
        writeRow(r0, items[i]);
    }

    // clear remaining placeholders (if fewer items)
    if (desiredCount < dummyCount) {
        for (let r0 = templateRow0 + desiredCount; r0 < templateRow0 + dummyCount; r0++) {
            cloneTemplateRowTo(ws, templateRow0, r0, maxCol);
            clearRow(r0);
        }
    }

    // Optional: update totals SUM formula if the template has it
    if (sumColLetter && sumRowColIndex != null) {
        const tr0 = totalsRow0 != null ? totalsRow0 + Math.max(delta, 0) : null;
        if (tr0 != null) {
            const totalsCell = getCell(ws, tr0, sumRowColIndex);
            if (totalsCell?.f) {
                if (desiredCount <= 0) {
                    totalsCell.f = "0";
                    totalsCell.v = 0;
                    totalsCell.t = "n";
                } else {
                    totalsCell.f = `SUM(${sumColLetter}${firstDataRowNum1}:${sumColLetter}${lastDataRowNum1})`;
                    totalsCell.v = 0;
                    totalsCell.t = "n";
                }
            }
        }
    }

    // Update sheet range
    const newRange = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
    if (delta > 0 && boundaryRow0 <= newRange.e.r) newRange.e.r += delta;
    newRange.e.r = Math.max(newRange.e.r, newBoundaryRow0, templateRow0 + desiredCount);
    ws["!ref"] = XLSX.utils.encode_range(newRange);

    return { mode: "dynamic", headerRow0: headerCell.r, templateRow0, boundaryRow0: newBoundaryRow0 };
}

/**
 * ---------------------------
 * PPE (unchanged behavior, but uses shared helpers)
 * ---------------------------
 */
export function fillPPEWorksheet(wb, ppeRows) {
    if (!wb) throw new Error("Worksheet missing");
    if (!Array.isArray(ppeRows)) throw new Error("PPE Rows must be an array");

    const { parseToSerial } = makeDateSerialHelpers(wb);

    const { ws } = getSheetByNameInsensitive(wb, "PPE");
    if (!ws) throw new Error("PPE sheet not found in template");

    const range0 = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
    let headerRow0 = null;

    // find header row by "Asset" text
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

    // detect dummy rows and totals row
    let dummyCount = 0;
    let totalsRow0 = null;

    for (let r = startRow0; r <= range0.e.r; r++) {
        const assetVal = getCell(ws, r, COLS.ASSET)?.v;
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

    const templatePurchasedCell = getCell(ws, templateRow0, COLS.PURCHASED);
    const templateDepStartCell = getCell(ws, templateRow0, COLS.DEP_START);

    const dateNumFmt =
        templatePurchasedCell?.z ||
        templatePurchasedCell?.s?.numFmt ||
        templateDepStartCell?.z ||
        templateDepStartCell?.s?.numFmt ||
        "mmm-yy";

    const desiredCount = ppeRows.length;
    const delta = desiredCount - dummyCount;

    if (delta > 0) shiftRowsDown(ws, totalsRow0, delta);
    const newTotalsRow0 = totalsRow0 + Math.max(delta, 0);

    for (let i = 0; i < desiredCount; i++) {
        const r0 = startRow0 + i;
        cloneTemplateRowTo(ws, templateRow0, r0, maxCol);

        const item = ppeRows[i] || {};
        const purchasedSerial = parseToSerial(item.monthOfPurchased);
        const depStartSerial = parseToSerial(item.monthStartingDepreciation);

        setCellValuePreserveStyle(ws, r0, COLS.ASSET, { t: "s", v: item.asset ?? "" });

        setCellValuePreserveStyle(ws, r0, COLS.PURCHASED, {
            t: "n",
            v: purchasedSerial ?? "",
            z: dateNumFmt,
            numFmt: dateNumFmt,
        });

        setCellValuePreserveStyle(ws, r0, COLS.RATE, {
            t: "n",
            v: Number(item.rate ?? 0) || 0,
        });

        setCellValuePreserveStyle(ws, r0, COLS.AMOUNT, {
            t: "n",
            v: Number(item.amount ?? 0) || 0,
        });

        setCellValuePreserveStyle(ws, r0, COLS.DEP_START, {
            t: "n",
            v: depStartSerial ?? "",
            z: dateNumFmt,
            numFmt: dateNumFmt,
        });

        setCellValuePreserveStyle(ws, r0, COLS.DATE, {
            t: "n",
            v: Number(item.date ?? 0) || 0,
        });
    }

    // clear remaining placeholders
    if (desiredCount < dummyCount) {
        for (let r0 = startRow0 + desiredCount; r0 < startRow0 + dummyCount; r0++) {
            cloneTemplateRowTo(ws, templateRow0, r0, maxCol);
            setCellValuePreserveStyle(ws, r0, COLS.ASSET, { t: "s", v: "" });
            setCellValuePreserveStyle(ws, r0, COLS.PURCHASED, { t: "s", v: "", z: dateNumFmt });
            setCellValuePreserveStyle(ws, r0, COLS.RATE, { t: "s", v: "" });
            setCellValuePreserveStyle(ws, r0, COLS.AMOUNT, { t: "s", v: "" });
            setCellValuePreserveStyle(ws, r0, COLS.DEP_START, { t: "s", v: "", z: dateNumFmt });
            setCellValuePreserveStyle(ws, r0, COLS.DATE, { t: "s", v: "" });
        }
    }

    // update totals formulas if present
    const firstDataRowNum1 = startRow0 + 1;
    const lastDataRowNum1 = startRow0 + desiredCount;

    const updateSumIfFormula = (r0, c, colLetter) => {
        const cell = getCell(ws, r0, c);
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

    // update !ref
    const newRange = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
    if (delta > 0 && totalsRow0 <= newRange.e.r) newRange.e.r += delta;
    newRange.e.r = Math.max(newRange.e.r, newTotalsRow0, startRow0 + desiredCount);
    ws["!ref"] = XLSX.utils.encode_range(newRange);
}

/**
 * ---------------------------
 * WORKING (UPDATED)
 * - auto-detect section row positions (dynamic)
 * - EPF date formatted as "Aug 2026" via Excel date serial + numFmt "mmm yyyy"
 * - still respects formulas (won't overwrite them)
 * ---------------------------
 */
export function fillWorkingWorksheet(wb, working) {
    if (!wb) throw new Error("Workbook missing");
    if (!working) throw new Error("Working data missing");

    const { ws } = getSheetByNameInsensitive(wb, "Working");
    if (!ws) throw new Error("Working sheet not found");

    const { parseToSerial } = makeDateSerialHelpers(wb);
    const safeNum = (v) => {
        const n = Number(v ?? 0);
        return Number.isFinite(n) ? n : 0;
    };

    // Known section headers in column A (used to avoid reading into the next section)
    const sectionHeadersLower = ["admin expenses", "assets", "epf/etf", "epf etf", "interest income"];

    // ---------------------------------------------------
    // 1) Interest Income (dynamic by label; fallback B2)
    // Template assumption: column A contains "Interest Income", value is in column B same row
    // ---------------------------------------------------
    const interestLabel = findCellByTextInsensitive(ws, "Interest Income", { col: 0 });
    if (interestLabel) {
        setCellValuePreserveStyle(ws, interestLabel.r, interestLabel.c + 1, {
            t: "n",
            v: safeNum(working.interestIncome),
        });
    } else {
        // fallback to old fixed cell B2
        setCellValueCreateIfMissing(ws, 1, 1, { t: "n", v: safeNum(working.interestIncome) });
    }

    // ---------------------------------------------------
    // 2) Admin Expenses (dynamic; fallback A5+)
    // Columns: A=name, B=amount
    // ---------------------------------------------------
    const adminItems = working.workingAdministrativeExpenseDtos || [];
    const adminRes = fillWorkingSectionTableDynamic({
        ws,
        headerText: "Admin Expenses",
        headerCol: 0,
        keyCol: 0,
        maxCol: 1,
        items: adminItems,
        sectionHeadersLower,
        writeRow: (r0, item) => {
            setCellValuePreserveStyle(ws, r0, 0, { t: "s", v: item?.adminExpenseName ?? "" });
            setCellValuePreserveStyle(ws, r0, 1, { t: "n", v: safeNum(item?.adminExpenseAmount) });
        },
        clearRow: (r0) => {
            setCellValuePreserveStyle(ws, r0, 0, { t: "s", v: "" });
            setCellValuePreserveStyle(ws, r0, 1, { t: "s", v: "" });
        },
        // Optional totals behavior if your template has a "Total" row with formula in column B:
        sumColLetter: "B",
        sumRowColIndex: 1,
    });

    // fallback (old fixed positions) if header not found
    if (adminRes.mode === "not-found") {
        let row = 4; // A5
        for (const item of adminItems) {
            setCellValueCreateIfMissing(ws, row, 0, { t: "s", v: item?.adminExpenseName ?? "" });
            setCellValueCreateIfMissing(ws, row, 1, { t: "n", v: safeNum(item?.adminExpenseAmount) });
            row++;
        }
        updateSheetRefEndRow(ws, row + 5);
    }

    // ---------------------------------------------------
    // 3) Assets (dynamic; fallback A9+)
    // Columns: A=name, B=amount
    // ---------------------------------------------------
    const assetItems = working.workingAssetsDtos || [];
    const assetsRes = fillWorkingSectionTableDynamic({
        ws,
        headerText: "Assets",
        headerCol: 0,
        keyCol: 0,
        maxCol: 1,
        items: assetItems,
        sectionHeadersLower,
        writeRow: (r0, item) => {
            setCellValuePreserveStyle(ws, r0, 0, { t: "s", v: item?.assetName ?? "" });
            setCellValuePreserveStyle(ws, r0, 1, { t: "n", v: safeNum(item?.assetAmount) });
        },
        clearRow: (r0) => {
            setCellValuePreserveStyle(ws, r0, 0, { t: "s", v: "" });
            setCellValuePreserveStyle(ws, r0, 1, { t: "s", v: "" });
        },
        sumColLetter: "B",
        sumRowColIndex: 1,
    });

    if (assetsRes.mode === "not-found") {
        let row = 8; // A9
        for (const item of assetItems) {
            setCellValueCreateIfMissing(ws, row, 0, { t: "s", v: item?.assetName ?? "" });
            setCellValueCreateIfMissing(ws, row, 1, { t: "n", v: safeNum(item?.assetAmount) });
            row++;
        }
        updateSheetRefEndRow(ws, row + 5);
    }

    // ---------------------------------------------------
    // 4) EPF/ETF (dynamic; fallback A13+)
    // Date format: "Aug 2026" => Excel numFmt "mmm yyyy"
    // Columns: A=date, B=amount
    // ---------------------------------------------------
    const epfItems = working.workingEPFETFDtos || [];
    const epfFmt = "mmm yyyy";

    const epfRes = fillWorkingSectionTableDynamic({
        ws,
        headerText: "EPF/ETF",
        headerCol: 0,
        keyCol: 0,
        maxCol: 1,
        items: epfItems,
        sectionHeadersLower,
        writeRow: (r0, item) => {
            const serial = parseToSerial(item?.date);
            setCellValuePreserveStyle(ws, r0, 0, {
                t: "n",
                v: serial ?? "",
                z: epfFmt,
                numFmt: epfFmt,
            });

            setCellValuePreserveStyle(ws, r0, 1, {
                t: "n",
                v: safeNum(item?.epf20 ?? item?.EPF20),
            });
        },
        clearRow: (r0) => {
            setCellValuePreserveStyle(ws, r0, 0, { t: "s", v: "", z: epfFmt, numFmt: epfFmt });
            setCellValuePreserveStyle(ws, r0, 1, { t: "s", v: "" });
        },
        sumColLetter: "B",
        sumRowColIndex: 1,
    });

    if (epfRes.mode === "not-found") {
        let row = 12; // A13
        for (const item of epfItems) {
            const serial = parseToSerial(item?.date);
            setCellValueCreateIfMissing(ws, row, 0, {
                t: "n",
                v: serial ?? "",
                z: epfFmt,
                numFmt: epfFmt,
            });
            setCellValueCreateIfMissing(ws, row, 1, {
                t: "n",
                v: safeNum(item?.epf20 ?? item?.EPF20),
            });
            row++;
        }
        updateSheetRefEndRow(ws, row + 5);
    }
}

export function fillFinancialTemplate(wb, data) {
    if (!wb) throw new Error("Workbook missing");
    if (!data || typeof data !== "object") throw new Error("Data missing");

    if (Array.isArray(data.ppe)) fillPPEWorksheet(wb, data.ppe);
    if (data.working) fillWorkingWorksheet(wb, data.working);

    return wb;
}