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

function shiftFormulaRows(ws, startRow0, delta, wb, sheetName) {
    const firstShiftedRow1 = startRow0 + 1;
    const moveReference = (formula, pattern) =>
        formula.replace(pattern, (match, prefix, col, rowAbs, rowText) => {
            const row = Number(rowText);
            if (rowAbs === "$" || row < firstShiftedRow1) return match;
            return `${prefix}${col}${rowAbs}${row + delta}`;
        });

    for (const cell of Object.values(ws)) {
        if (!cell?.f) continue;
        cell.f = moveReference(cell.f, /(^|[^!A-Z0-9_])(\$?[A-Z]{1,3})(\$?)(\d+)/g);
    }

    if (!wb || !sheetName) return;

    const escapedSheetName = sheetName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sheetReference = new RegExp(
        `((?:'${escapedSheetName}'|${escapedSheetName})!)(\\$?[A-Z]{1,3})(\\$?)(\\d+)`,
        "g"
    );

    for (const sheet of Object.values(wb.Sheets)) {
        if (sheet === ws) continue;
        for (const cell of Object.values(sheet)) {
            if (!cell?.f) continue;
            cell.f = moveReference(cell.f, sheetReference);
        }
    }
}

function shiftRows(ws, startRow0, delta, workbookContext) {
    if (delta === 0) return;
    shiftFormulaRows(ws, startRow0, delta, workbookContext?.wb, workbookContext?.sheetName);

    if (delta > 0) {
        shiftRowsDown(ws, startRow0, delta);
        const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
        range.e.r += delta;
        ws["!ref"] = XLSX.utils.encode_range(range);
        return;
    }

    const keys = Object.keys(ws)
        .filter((key) => !key.startsWith("!"))
        .map((a) => ({ a, ...XLSX.utils.decode_cell(a) }))
        .filter(({ r }) => r >= startRow0)
        .sort((a, b) => a.r - b.r || a.c - b.c);

    for (const { a, r, c } of keys) {
        ws[addrOf(r + delta, c)] = ws[a];
        delete ws[a];
    }

    if (Array.isArray(ws["!merges"])) {
        ws["!merges"] = ws["!merges"].map((m) => {
            const shifted = { s: { ...m.s }, e: { ...m.e } };
            if (shifted.s.r >= startRow0) {
                shifted.s.r += delta;
                shifted.e.r += delta;
            }
            return shifted;
        });
    }

    if (Array.isArray(ws["!rows"])) {
        const rows = [];
        for (let r = 0; r < ws["!rows"].length; r++) {
            const row = ws["!rows"][r];
            if (!row) continue;
            rows[r >= startRow0 ? r + delta : r] = row;
        }
        ws["!rows"] = rows;
    }

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
    range.e.r = Math.max(range.s.r, range.e.r + delta);
    ws["!ref"] = XLSX.utils.encode_range(range);
}

function clearRows(ws, startRow0, endRow0) {
    for (const address of Object.keys(ws)) {
        if (address.startsWith("!")) continue;
        const { r } = XLSX.utils.decode_cell(address);
        if (r >= startRow0 && r < endRow0) delete ws[address];
    }

    if (Array.isArray(ws["!rows"])) {
        for (let r = startRow0; r < endRow0; r++) delete ws["!rows"][r];
    }
}

function setTotalFormula(ws, row0, col, colLetter, firstDataRow0, itemCount) {
    const cell = getCell(ws, row0, col);
    if (!cell?.f) return;

    cell.f = itemCount
        ? `SUM(${colLetter}${firstDataRow0 + 1}:${colLetter}${firstDataRow0 + itemCount})`
        : "0";
    cell.v = 0;
    cell.t = "n";
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
 * Populate Working from top to bottom. Each next section is found only after
 * the previous one has been resized, so headings never depend on fixed rows.
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

    const findWorkingLabel = (label) => {
        const found = findCellByTextInsensitive(ws, label, { col: 0 });
        if (!found) throw new Error(`Working sheet is missing the ${label} label`);
        return found;
    };

    const resizeRowsBefore = (headerText, nextHeaderText, itemCount, maxCol) => {
        const header = findWorkingLabel(headerText);
        const nextHeader = findWorkingLabel(nextHeaderText);
        const firstDataRow0 = header.r + 1;
        const availableRows = nextHeader.r - firstDataRow0;
        const templateRow0 = firstDataRow0;
        const delta = itemCount - availableRows;

        if (delta < 0) clearRows(ws, firstDataRow0 + itemCount, nextHeader.r);
        shiftRows(ws, nextHeader.r, delta, { wb, sheetName: "Working" });

        for (let index = 0; index < itemCount; index++) {
            cloneTemplateRowTo(ws, templateRow0, firstDataRow0 + index, maxCol);
        }

        return { firstDataRow0, templateRow0 };
    };

    // Income
    const interestLabel = findCellByTextInsensitive(ws, "Interest Income", { col: 0 });
    if (interestLabel) {
        setCellValueCreateIfMissing(ws, interestLabel.r, interestLabel.c + 1, {
            t: "n",
            v: safeNum(working.interestIncome),
        });
    }

    // Administrative Expenses. The Assets heading is shifted after every item.
    const adminItems = working.workingAdministrativeExpenseDtos || [];
    const adminBlock = resizeRowsBefore(
        "Administrative Expenses",
        "Assets",
        adminItems.length,
        1
    );
    adminItems.forEach((item, index) => {
        const row0 = adminBlock.firstDataRow0 + index;
        setCellValueCreateIfMissing(ws, row0, 0, { t: "s", v: item?.adminExpenseName ?? "" });
        setCellValueCreateIfMissing(ws, row0, 1, { t: "n", v: safeNum(item?.adminExpenseAmount) });
    });

    // Assets. The EPF heading follows the generated asset rows.
    const assetItems = working.workingAssetsDtos || [];
    const assetsBlock = resizeRowsBefore("Assets", "EPF ETF", assetItems.length, 2);
    assetItems.forEach((item, index) => {
        const row0 = assetsBlock.firstDataRow0 + index;
        setCellValueCreateIfMissing(ws, row0, 0, { t: "s", v: item?.assetName ?? "" });
        setCellValueCreateIfMissing(ws, row0, 1, { t: "n", v: safeNum(item?.assetAmount) });
    });

    // EPF / ETF. Its column-heading row remains in place; only the rows above Total resize.
    const epfItems = working.workingEPFETFDtos || [];
    const epfHeader = findWorkingLabel("EPF & ETF");
    const totalRow = findWorkingLabel("Total");
    const epfFirstDataRow0 = epfHeader.r + 1;
    const epfTemplateRow0 = epfFirstDataRow0;
    const epfAvailableRows = totalRow.r - epfFirstDataRow0;
    const epfDelta = epfItems.length - epfAvailableRows;
    if (epfDelta < 0) clearRows(ws, epfFirstDataRow0 + epfItems.length, totalRow.r);
    shiftRows(ws, totalRow.r, epfDelta, { wb, sheetName: "Working" });

    const epfFmt = "mmm yyyy";
    epfItems.forEach((item, index) => {
        const row0 = epfFirstDataRow0 + index;
        cloneTemplateRowTo(ws, epfTemplateRow0, row0, 3);

        setCellValueCreateIfMissing(ws, row0, 0, {
            t: "n",
            v: parseToSerial(item?.date) ?? "",
            z: epfFmt,
            numFmt: epfFmt,
        });
        setCellValueCreateIfMissing(ws, row0, 1, {
            t: "n",
            v: safeNum(item?.epf20 ?? item?.EPF20),
        });
    });

    const newTotalRow = findWorkingLabel("Total");
    setTotalFormula(ws, newTotalRow.r, 1, "B", epfFirstDataRow0, epfItems.length);
    setTotalFormula(ws, newTotalRow.r, 2, "C", epfFirstDataRow0, epfItems.length);
    setTotalFormula(ws, newTotalRow.r, 3, "D", epfFirstDataRow0, epfItems.length);
}

export function fillFinancialTemplate(wb, data) {
    if (!wb) throw new Error("Workbook missing");
    if (!data || typeof data !== "object") throw new Error("Data missing");

    if (Array.isArray(data.ppe)) fillPPEWorksheet(wb, data.ppe);
    if (data.working) fillWorkingWorksheet(wb, data.working);

    return wb;
}
