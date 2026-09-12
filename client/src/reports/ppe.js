import XLSX from "xlsx-js-style";
import dayjs from "dayjs";

function getSheetByNameInsensitive(wb, desiredName) {
    const found =
        wb.SheetNames.find(
            (n) => String(n).trim().toLowerCase() === String(desiredName).trim().toLowerCase()
        ) || desiredName;

    return { sheetName: found, ws: wb.Sheets[found] };
}

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

function setCellValuePreserveStyle(ws, r, c, { t, v, z, numFmt }) {
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
}

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

function cloneRowTemplate(ws, templateRow0, maxCol) {
    const cells = [];
    for (let c = 0; c <= maxCol; c++) {
        const cell = getCell(ws, templateRow0, c);
        cells[c] = cell ? { ...cell, s: cell.s ? { ...cell.s } : cell.s } : null;
    }

    const row = Array.isArray(ws["!rows"]) && ws["!rows"][templateRow0]
        ? { ...ws["!rows"][templateRow0] }
        : null;

    return { cells, row };
}

function applyRowTemplate(ws, template, targetRow0, maxCol) {
    for (let c = 0; c <= maxCol; c++) {
        const addr = addrOf(targetRow0, c);
        const source = template?.cells?.[c];
        if (source) {
            ws[addr] = { ...source, s: source.s ? { ...source.s } : source.s };
        } else {
            delete ws[addr];
        }
    }

    if (template?.row) {
        ws["!rows"] = ws["!rows"] || [];
        ws["!rows"][targetRow0] = { ...template.row };
    }
}

function setCellValueAllowFormula(ws, r, c, { t, v, f, z, numFmt }) {
    const a = addrOf(r, c);
    const cell = ws[a] || (ws[a] = {});

    delete cell.f;
    if (f) {
        cell.f = f;
        cell.t = t || "n";
        cell.v = v ?? 0;
    } else {
        cell.t = t;
        cell.v = v;
    }

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

function setRowBold(ws, row0, maxCol) {
    for (let col = 0; col <= maxCol; col++) {
        const cell = getCell(ws, row0, col);
        if (!cell) continue;
        cell.s = {
            ...(cell.s || {}),
            font: { ...(cell.s?.font || {}), bold: true },
        };
    }
}

function applyCellStylePatch(ws, row0, col, patch) {
    const cell = ws[addrOf(row0, col)] || (ws[addrOf(row0, col)] = { t: "s", v: "" });
    cell.s = {
        ...(cell.s || {}),
        ...patch,
        font: { ...(cell.s?.font || {}), ...(patch.font || {}) },
        alignment: { ...(cell.s?.alignment || {}), ...(patch.alignment || {}) },
        border: { ...(cell.s?.border || {}), ...(patch.border || {}) },
    };
}

function applyPPEWorksheetStyle(ws, headerRow0, startRow0, totalRow0, maxCol) {
    const thinBorder = {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
    };

    applyCellStylePatch(ws, 0, 0, {
        font: { bold: true },
        alignment: { horizontal: "left", vertical: "center" },
    });

    for (let row0 = headerRow0; row0 <= totalRow0; row0++) {
        for (let col = 0; col <= maxCol; col++) {
            applyCellStylePatch(ws, row0, col, {
                border: thinBorder,
                alignment: { vertical: "center", wrapText: row0 === headerRow0 },
            });
        }
    }

    for (let col = 0; col <= maxCol; col++) {
        applyCellStylePatch(ws, headerRow0, col, {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
        });
        applyCellStylePatch(ws, totalRow0, col, {
            font: { bold: true },
            alignment: { vertical: "center" },
        });
    }

    for (let row0 = startRow0; row0 <= totalRow0; row0++) {
        applyCellStylePatch(ws, row0, 0, { alignment: { horizontal: "left", vertical: "center" } });
        [2, 3, 5, 6].forEach((col) =>
            applyCellStylePatch(ws, row0, col, {
                alignment: { horizontal: "right", vertical: "center" },
            })
        );
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
    const valueMaxCol = COLS.DEP_AMOUNT;
    const maxCol = Math.max(range0.e.c, valueMaxCol);
    
    let totalsRow0 = findCellByTextInsensitive(ws, "Total", { col: COLS.ASSET })?.r ?? null;
    let dummyCount = totalsRow0 !== null ? Math.max(totalsRow0 - startRow0, 0) : 0;

    if (totalsRow0 === null) {
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
    }

    if (dummyCount === 0) {
        dummyCount = 1;
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

        setCellValueAllowFormula(ws, r0, COLS.ASSET, { t: "s", v: item.asset ?? "" });

        setCellValueAllowFormula(ws, r0, COLS.PURCHASED, {
            t: "n",
            v: purchasedSerial ?? "",
            z: dateNumFmt,
            numFmt: dateNumFmt,
        });

        setCellValueAllowFormula(ws, r0, COLS.RATE, {
            t: "n",
            v: Number(item.rate ?? 0) || 0,
        });

        setCellValueAllowFormula(ws, r0, COLS.AMOUNT, {
            t: "n",
            v: Number(item.amount ?? 0) || 0,
        });

        setCellValueAllowFormula(ws, r0, COLS.DEP_START, {
            t: "n",
            v: depStartSerial ?? "",
            z: dateNumFmt,
            numFmt: dateNumFmt,
        });

        setCellValueAllowFormula(ws, r0, COLS.DATE, {
            t: "n",
            v: Number(item.date ?? 0) || 0,
        });

        setCellValueAllowFormula(ws, r0, COLS.DEP_AMOUNT, {
            t: "n",
            v: Number(item.depreciationAmount ?? 0) || 0,
        });
    }

    if (desiredCount < dummyCount) {
        for (let r0 = startRow0 + desiredCount; r0 < startRow0 + dummyCount; r0++) {
            cloneTemplateRowTo(ws, templateRow0, r0, maxCol);
            setCellValueAllowFormula(ws, r0, COLS.ASSET, { t: "s", v: "" });
            setCellValueAllowFormula(ws, r0, COLS.PURCHASED, { t: "s", v: "", z: dateNumFmt });
            setCellValueAllowFormula(ws, r0, COLS.RATE, { t: "s", v: "" });
            setCellValueAllowFormula(ws, r0, COLS.AMOUNT, { t: "s", v: "" });
            setCellValueAllowFormula(ws, r0, COLS.DEP_START, { t: "s", v: "", z: dateNumFmt });
            setCellValueAllowFormula(ws, r0, COLS.DATE, { t: "s", v: "" });
            setCellValueAllowFormula(ws, r0, COLS.DEP_AMOUNT, { t: "s", v: "" });
        }
    }

    const firstDataRowNum1 = startRow0 + 1;
    const lastDataRowNum1 = startRow0 + desiredCount;

    const updateSumFormula = (r0, c, colLetter) => {
        setCellValueAllowFormula(ws, r0, c, {
            t: "n",
            v: 0,
            f:
                desiredCount > 0
                    ? `SUM(${colLetter}${firstDataRowNum1}:${colLetter}${lastDataRowNum1})`
                    : "0",
        });
    };

    setCellValueAllowFormula(ws, newTotalsRow0, COLS.ASSET, { t: "s", v: "Total" });
    updateSumFormula(newTotalsRow0, COLS.AMOUNT, "D");
    updateSumFormula(newTotalsRow0, COLS.DEP_AMOUNT, "G");
    applyPPEWorksheetStyle(ws, startRow0 - 1, startRow0, newTotalsRow0, valueMaxCol);

    const newRange = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
    if (delta > 0 && totalsRow0 <= newRange.e.r) newRange.e.r += delta;
    newRange.e.r = Math.max(newRange.e.r, newTotalsRow0, startRow0 + desiredCount);
    ws["!ref"] = XLSX.utils.encode_range(newRange);
}

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
        const blankRowsAfterSection = 2;
        const requiredRows = itemCount + blankRowsAfterSection;
        const delta = requiredRows - availableRows;

        if (itemCount < availableRows) clearRows(ws, firstDataRow0 + itemCount, nextHeader.r);
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

    ["Income", "Administrative Expenses", "Assets", "EPF ETF", "EPF & ETF", "Total"].forEach(
        (label) => {
            const header = findWorkingLabel(label);
            setRowBold(ws, header.r, label === "EPF & ETF" || label === "Total" ? 3 : 2);
        }
    );

    setCellValueCreateIfMissing(ws, epfHeader.r, 0, {
        t: "s",
        v: "EPF & ETF Month",
    });
}

function normalizeTrialBalanceSections(tb) {
    const sectionAliases = new Map([
        ["bankaccounts", "BankAccounts"],
        ["bank accounts", "BankAccounts"],
        ["bankaccount", "BankAccounts"],
        ["bank account", "BankAccounts"],
        ["assets", "Assets"],
        ["asset", "Assets"],
        ["liabilities", "Liabilities"],
        ["liability", "Liabilities"],
        ["equity", "Equity"],
        ["income", "Income"],
        ["expenses", "Expenses"],
        ["expense", "Expenses"],
    ]);

    const sections = {
        BankAccounts: [],
        Assets: [],
        Liabilities: [],
        Equity: [],
        Income: [],
        Expenses: [],
    };

    const pushItem = (sectionKey, item) => {
        if (!sectionKey || !sections[sectionKey] || !item) return;
        sections[sectionKey].push(item);
    };

    if (Array.isArray(tb)) {
        tb.forEach((item) => {
            const rawType = String(item?.accountType ?? item?.type ?? "").trim().toLowerCase();
            pushItem(sectionAliases.get(rawType), item);
        });
        return sections;
    }

    if (!tb || typeof tb !== "object") return sections;

    Object.entries(tb).forEach(([key, value]) => {
        const sectionKey = sectionAliases.get(String(key).trim().toLowerCase());
        if (Array.isArray(value)) {
            value.forEach((item) => pushItem(sectionKey, item));
        }
    });

    return sections;
}

function normalizeTrialBalanceRows(items) {
    const grouped = new Map();

    (Array.isArray(items) ? items : []).forEach((item) => {
        const accountName = String(item?.accountName ?? item?.name ?? "").trim();
        if (!accountName) return;

        const amount = Number(item?.amount ?? item?.value ?? 0);
        if (!Number.isFinite(amount)) return;

        const transactionType = String(item?.transactionType ?? item?.type ?? "DR").trim().toUpperCase();
        const current = grouped.get(accountName) || { accountName, dr: 0, cr: 0 };
        if (transactionType === "CR") current.cr += amount;
        else current.dr += amount;
        grouped.set(accountName, current);
    });

    return Array.from(grouped.values()).map((row) => {
        const net = (Number(row.dr) || 0) - (Number(row.cr) || 0);
        if (net >= 0) return { accountName: row.accountName, dr: net, cr: 0 };
        return { accountName: row.accountName, dr: 0, cr: Math.abs(net) };
    });
}

function formatTrialBalanceDate(value) {
    const parsed = value ? dayjs(value) : null;
    if (!parsed?.isValid()) return null;

    const day = parsed.date();
    const suffix =
        day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
                ? "nd"
                : day % 10 === 3 && day !== 13
                    ? "rd"
                    : "th";

    return `${day}${suffix} ${parsed.format("MMMM YYYY")}`;
}

function findPPEDataStartRow0(ws) {
    const header = findCellByTextInsensitive(ws, "Asset", { col: 0 });
    return header ? header.r + 1 : 3;
}

export function fillTBWorksheet(wb, tb, ppeRows = [], endDate = null) {
    if (!wb) throw new Error("Workbook missing");

    const { sheetName, ws } = getSheetByNameInsensitive(wb, "TB");
    if (!ws) throw new Error("TB sheet not found in template");

    const COLS = { ACCOUNT: 0, DR: 1, CR: 2 };
    const rangeBefore = XLSX.utils.decode_range(ws["!ref"] || "A1:C1");
    const valueMaxCol = COLS.CR;
    const styleMaxCol = Math.max(rangeBefore.e.c, valueMaxCol);
    const sectionOrder = [
        { key: "BankAccounts", label: "Bank accounts" },
        { key: "Assets", label: "Assets" },
        { key: "Liabilities", label: "Liabilities" },
        { key: "Equity", label: "Equity" },
        { key: "Income", label: "Income" },
        { key: "Expenses", label: "Expenses" },
    ];

    const headerRow = findCellByTextInsensitive(ws, "Accounts", { col: COLS.ACCOUNT });
    const totalRow = findCellByTextInsensitive(ws, "Total", { col: COLS.ACCOUNT });
    if (!headerRow || !totalRow) throw new Error("TB sheet layout is missing Accounts or Total");

    const firstBodyRow0 = headerRow.r + 1;
    const existingTotalRow0 = totalRow.r;

    const sectionTemplates = {};
    const itemTemplates = {};
    let fallbackSectionTemplate = null;
    let fallbackItemTemplate = null;

    sectionOrder.forEach(({ key, label }) => {
        const found = findCellByTextInsensitive(ws, label, { col: COLS.ACCOUNT });
        if (!found) return;

        sectionTemplates[key] = cloneRowTemplate(ws, found.r, styleMaxCol);
        fallbackSectionTemplate = fallbackSectionTemplate || sectionTemplates[key];

        if (found.r + 1 < existingTotalRow0) {
            itemTemplates[key] = cloneRowTemplate(ws, found.r + 1, styleMaxCol);
            fallbackItemTemplate = fallbackItemTemplate || itemTemplates[key];
        }
    });

    const totalTemplate = cloneRowTemplate(ws, existingTotalRow0, styleMaxCol);
    const differenceTemplate = cloneRowTemplate(ws, existingTotalRow0 + 1, styleMaxCol);

    const manualSections = normalizeTrialBalanceSections(tb);
    const ppeItems = Array.isArray(ppeRows) ? ppeRows : [];
    const ppeSheetName = getSheetByNameInsensitive(wb, "PPE").sheetName;
    const ppeWs = wb.Sheets[ppeSheetName];
    const ppeDataStartRow0 = ppeWs ? findPPEDataStartRow0(ppeWs) : 3;
    const ppeTotalRow1 = ppeDataStartRow0 + ppeItems.length + 1;
    const ppeAssetNames = new Set();

    const ppeAssetRows = ppeItems
        .map((item, index) => {
            const accountName = String(item?.asset ?? item?.assetName ?? "").trim();
            if (!accountName) return null;
            ppeAssetNames.add(accountName.toLowerCase());
            return {
                accountName,
                drFormula: `'${ppeSheetName}'!D${ppeDataStartRow0 + index + 1}`,
                drFallback: Number(item?.amount ?? 0) || 0,
                cr: 0,
            };
        })
        .filter(Boolean);

    const depreciationTotal = ppeItems.reduce(
        (sum, item) => sum + (Number(item?.depreciationAmount) || 0),
        0
    );
    const depreciationRow =
        ppeItems.length > 0
            ? {
                accountName:
                    findCellByTextInsensitive(ws, "Accumalated Deprecion", { col: COLS.ACCOUNT })?.cell
                        ?.v ||
                    findCellByTextInsensitive(ws, "Accumulated Deprecion", { col: COLS.ACCOUNT })?.cell
                        ?.v ||
                    "Accumalated Deprecion",
                dr: 0,
                crFormula: `'${ppeSheetName}'!G${ppeTotalRow1}`,
                crFallback: depreciationTotal,
            }
            : null;

    const sections = sectionOrder.map(({ key, label }) => {
        const normalizedRows = normalizeTrialBalanceRows(manualSections[key]);
        const manualRows =
            key === "Assets"
                ? normalizedRows.filter(
                    (row) => !ppeAssetNames.has(String(row.accountName).trim().toLowerCase())
                )
                : normalizedRows;

        const rows =
            key === "Assets"
                ? [...ppeAssetRows, ...(depreciationRow ? [depreciationRow] : []), ...manualRows]
                : manualRows;

        return { key, label, rows };
    });

    const desiredBodyRowCount = sections.reduce(
        (count, section) => count + 1 + section.rows.length,
        0
    );
    const currentBodyRowCount = existingTotalRow0 - firstBodyRow0;
    const delta = desiredBodyRowCount - currentBodyRowCount;

    shiftRows(ws, existingTotalRow0, delta, { wb, sheetName });

    const newTotalRow0 = existingTotalRow0 + delta;
    clearRows(ws, firstBodyRow0, newTotalRow0);

    let row0 = firstBodyRow0;
    sections.forEach((section) => {
        applyRowTemplate(
            ws,
            sectionTemplates[section.key] || fallbackSectionTemplate,
            row0,
            styleMaxCol
        );
        setCellValueAllowFormula(ws, row0, COLS.ACCOUNT, { t: "s", v: section.label });
        setCellValueAllowFormula(ws, row0, COLS.DR, { t: "s", v: "" });
        setCellValueAllowFormula(ws, row0, COLS.CR, { t: "s", v: "" });
        setRowBold(ws, row0, valueMaxCol);
        row0++;

        section.rows.forEach((item) => {
            applyRowTemplate(
                ws,
                itemTemplates[section.key] || fallbackItemTemplate,
                row0,
                styleMaxCol
            );
            setCellValueAllowFormula(ws, row0, COLS.ACCOUNT, {
                t: "s",
                v: item.accountName ?? "",
            });
            const drValue = Number(item.dr ?? item.drFallback ?? 0) || 0;
            const crValue = Number(item.cr ?? item.crFallback ?? 0) || 0;

            setCellValueAllowFormula(
                ws,
                row0,
                COLS.DR,
                item.drFormula || drValue
                    ? { t: "n", v: drValue, f: item.drFormula }
                    : { t: "s", v: "" }
            );
            setCellValueAllowFormula(
                ws,
                row0,
                COLS.CR,
                item.crFormula || crValue
                    ? { t: "n", v: crValue, f: item.crFormula }
                    : { t: "s", v: "" }
            );
            row0++;
        });
    });

    applyRowTemplate(ws, totalTemplate, newTotalRow0, styleMaxCol);
    setCellValueAllowFormula(ws, newTotalRow0, COLS.ACCOUNT, { t: "s", v: "Total" });
    setCellValueAllowFormula(ws, newTotalRow0, COLS.DR, {
        t: "n",
        v: 0,
        f: `SUM(B${firstBodyRow0 + 1}:B${newTotalRow0})`,
    });
    setCellValueAllowFormula(ws, newTotalRow0, COLS.CR, {
        t: "n",
        v: 0,
        f: `SUM(C${firstBodyRow0 + 1}:C${newTotalRow0})`,
    });
    setRowBold(ws, newTotalRow0, valueMaxCol);

    applyRowTemplate(ws, differenceTemplate, newTotalRow0 + 1, styleMaxCol);
    setCellValueAllowFormula(ws, newTotalRow0 + 1, COLS.ACCOUNT, { t: "s", v: "" });
    setCellValueAllowFormula(ws, newTotalRow0 + 1, COLS.DR, {
        t: "n",
        v: 0,
        f: `B${newTotalRow0 + 1}-C${newTotalRow0 + 1}`,
    });
    setCellValueAllowFormula(ws, newTotalRow0 + 1, COLS.CR, { t: "s", v: "" });

    if (delta < 0) {
        clearRows(ws, newTotalRow0 + 2, existingTotalRow0 + 2);
    }

    const formattedDate =
        formatTrialBalanceDate(endDate) ||
        formatTrialBalanceDate(
            Object.values(manualSections)
                .flat()
                .find((item) => item?.financialDate)?.financialDate
        );
    if (formattedDate) {
        const asAtCell = findCellByTextInsensitive(ws, "As at 31st March 2025", {
            col: COLS.ACCOUNT,
        });
        if (asAtCell) {
            setCellValueAllowFormula(ws, asAtCell.r, asAtCell.c, {
                t: "s",
                v: `As at ${formattedDate}`,
            });
        }
    }

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
    range.e.r = Math.max(range.s.r, newTotalRow0 + 1);
    range.e.c = Math.max(range.e.c, styleMaxCol);
    ws["!ref"] = XLSX.utils.encode_range(range);

    [0, 1, 2, headerRow.r].forEach((boldRow0) => setRowBold(ws, boldRow0, valueMaxCol));
}

export function fillFinancialTemplate(wb, data) {
    if (!wb) throw new Error("Workbook missing");
    if (!data || typeof data !== "object") throw new Error("Data missing");

    if (Array.isArray(data.ppe)) fillPPEWorksheet(wb, data.ppe);
    if (data.working) fillWorkingWorksheet(wb, data.working);
    if (data.tb || data.trialBalance) {
        fillTBWorksheet(
            wb,
            data.tb || data.trialBalance,
            Array.isArray(data.ppe) ? data.ppe : [],
            data.endDate || data.periodEndDate || data.financialDate
        );
    }

    return wb;
}
