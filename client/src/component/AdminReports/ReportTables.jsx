import dayjs from "dayjs";
import React, { memo, useCallback, useMemo } from "react";

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString("en-LK");
};

const formatDate = (value) => {
    if (!value) return "-";
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString("en-LK", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return String(value);
    }
};

const humanTitle = (key) =>
    String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();

const TableWrapper = ({ children, title }) => (
    <div className="w-full overflow-x-auto rounded-lg border bg-white">
        {title && (
            <div className="border-b bg-gray-50 px-4 py-2">
                <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            </div>
        )}
        <table className="min-w-full text-sm">{children}</table>
    </div>
);

const TableHeader = ({ columns }) => (
    <thead className="sticky top-0 z-10 bg-gray-50">
        <tr>
            {columns.map((col, idx) => (
                <th
                    key={idx}
                    className={`whitespace-nowrap border-b px-3 py-2 text-left font-semibold text-gray-800 ${col.align === "right" ? "text-right" : ""
                        }`}
                >
                    {col.label}
                </th>
            ))}
        </tr>
    </thead>
);

const TableRow = ({ row, columns, rowIndex }) => (
    <tr className="border-t hover:bg-gray-50/50 transition-colors">
        {columns.map((col, idx) => (
            <td
                key={idx}
                className={`px-3 py-2 text-gray-700 ${col.align === "right" ? "text-right" : ""
                    } ${col.bold ? "text-gray-400" : ""}`}
            >
                {col.render ? col.render(row, rowIndex) : row?.[col.key] ?? "-"}
            </td>
        ))}
    </tr>
);

// PPE Table
const PPETable = memo(function PPETable({ data }) {
    const rows = Array.isArray(data) ? data : [];

    const calculateTotals = useCallback(() => {
        return rows.reduce(
            (acc, row) => ({
                amount: acc.amount + (Number(row.amount) || 0),
                depreciationAmount:
                    acc.depreciationAmount + (Number(row.depreciationAmount) || 0),
            }),
            { amount: 0, depreciationAmount: 0 }
        );
    }, [rows]);

    const totals = calculateTotals();

    const columns = [
        { key: "asset", label: "Asset", bold: true },
        { key: "monthOfPurchased", label: "Month of Purchased", render: (row) => formatDate(row.monthOfPurchased) },
        { key: "date", label: "Days", align: "right" },
        { key: "rate", label: "Rate (%)", align: "right" },
        { key: "amount", label: "Amount (LKR)", align: "right", render: (row) => formatCurrency(row.amount) },
        { key: "depreciationAmount", label: "Depreciation (LKR)", align: "right", render: (row) => formatCurrency(row.depreciationAmount) },
    ];

    return (
        <>
            <h2>Property, Plant & Equipment (PPE)</h2>
            <TableWrapper>
                <TableHeader columns={columns} />
                <tbody className="bg-white">
                    {rows.map((row, idx) => (
                        <TableRow key={idx} row={row} columns={columns} rowIndex={idx} />
                    ))}
                    <tr className="border-t bg-gray-50 font-semibold">
                        <td className="px-3 py-2 text-gray-900">Total</td>
                        <td className="px-3 py-2"></td>
                        <td className="px-3 py-2"></td>
                        <td className="px-3 py-2"></td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-900">
                            {formatCurrency(totals.amount)}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-900">
                            {formatCurrency(totals.depreciationAmount)}
                        </td>
                    </tr>
                </tbody>
            </TableWrapper>
        </>
    );
});

// Working Table
const WorkingTable = memo(function WorkingTable({ data }) {
    const working = data || {};
    const adminExpenses = working.workingAdministrativeExpenseDtos || [];
    const assets = working.workingAssetsDtos || [];
    const epfEtf = working.workingEPFETFDtos || [];

    const totalAdminExpenses = adminExpenses.reduce(
        (sum, item) => sum + (Number(item.adminExpenseAmount) || 0),
        0
    );
    const totalAssets = assets.reduce(
        (sum, item) => sum + (Number(item.assetAmount) || 0),
        0
    );

    return (
        <div className="space-y-4 bg-gray-50 p-3 rounded-md border">
            {/* Interest Income */}
            <h2>Working</h2>
            <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                        Interest Income
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(working.interestIncome)}
                    </span>
                </div>
            </div>

            {/* Administrative Expenses */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">
                    Administrative Expenses
                </h4>
                <TableWrapper>
                    <TableHeader
                        columns={[
                            { key: "adminExpenseName", label: "Expense Name", bold: true },
                            { key: "adminExpenseAmount", label: "Amount (LKR)", align: "right", render: (row) => formatCurrency(row.adminExpenseAmount) },
                        ]}
                    />
                    <tbody className="bg-white">
                        {adminExpenses.map((row, idx) => (
                            <TableRow
                                key={idx}
                                row={row}
                                columns={[
                                    { key: "adminExpenseName", label: "Expense Name", bold: true },
                                    { key: "adminExpenseAmount", label: "Amount (LKR)", align: "right", render: (row) => formatCurrency(row.adminExpenseAmount) },
                                ]}
                                rowIndex={idx}
                            />
                        ))}
                        <tr className="border-t bg-gray-50 font-semibold">
                            <td className="px-3 py-2 text-gray-900">Total</td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                {formatCurrency(totalAdminExpenses)}
                            </td>
                        </tr>
                    </tbody>
                </TableWrapper>
            </div>

            {/* Assets */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Assets</h4>
                <TableWrapper>
                    <TableHeader
                        columns={[
                            { key: "assetName", label: "Asset Name", bold: true },
                            { key: "assetAmount", label: "Amount (LKR)", align: "right", render: (row) => formatCurrency(row.assetAmount) },
                        ]}
                    />
                    <tbody className="bg-white">
                        {assets.map((row, idx) => (
                            <TableRow
                                key={idx}
                                row={row}
                                columns={[
                                    { key: "assetName", label: "Asset Name", bold: true },
                                    { key: "assetAmount", label: "Amount (LKR)", align: "right", render: (row) => formatCurrency(row.assetAmount) },
                                ]}
                                rowIndex={idx}
                            />
                        ))}
                        <tr className="border-t bg-gray-50 font-semibold">
                            <td className="px-3 py-2 text-gray-900">Total</td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                {formatCurrency(totalAssets)}
                            </td>
                        </tr>
                    </tbody>
                </TableWrapper>
            </div>

            {/* EPF/ETF */}
            {epfEtf.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">EPF/ETF</h4>
                    <TableWrapper>
                        <TableHeader
                            columns={[
                                { key: "date", label: "Date", bold: true },
                                { key: "EPF20", label: "EPF 20%", align: "right", render: (row) => formatCurrency(row.EPF20) },
                            ]}
                        />
                        <tbody className="bg-white">
                            {epfEtf.map((row, idx) => (
                                <TableRow
                                    key={idx}
                                    row={row}
                                    columns={[
                                        { key: "date", label: "Date", bold: true },
                                        { key: "EPF20", label: "EPF 20%", align: "right", render: (row) => formatCurrency(row.EPF20) },
                                    ]}
                                    rowIndex={idx}
                                />
                            ))}
                        </tbody>
                    </TableWrapper>
                </div>
            )}
        </div>
    );
});

// TB Table (Trial Balance)
const TBTable = memo(function TBTable({ data, endDateVal }) {
    const tb = data || {};
    const end = endDateVal || dayjs();

    const sectionOrder = useMemo(
        () => [
            { key: "BankAccounts", label: "Bank accounts" },
            { key: "Assets", label: "Assets" },
            { key: "Liabilities", label: "Liabilities" },
            { key: "Equity", label: "Equity" },
            { key: "Income", label: "Income" },
            { key: "Expenses", label: "Expenses" },
        ],
        []
    );

    const normalizeSection = useCallback((items) => {
        const rows = Array.isArray(items) ? items : [];
        const map = new Map();

        rows.forEach((it) => {
            const name = it?.accountName ?? "-";
            const amount = Number(it?.amount ?? 0);
            const type = String(it?.transactionType ?? "").toUpperCase();

            if (!Number.isFinite(amount)) return;

            const cur = map.get(name) || { accountName: name, dr: 0, cr: 0 };
            if (type === "CR") cur.cr += amount;
            else cur.dr += amount; // default DR
            map.set(name, cur);
        });

        // Net to one side (like a TB)
        return Array.from(map.values()).map((r) => {
            const net = (Number(r.dr) || 0) - (Number(r.cr) || 0);
            if (net >= 0) return { accountName: r.accountName, dr: net, cr: 0 };
            return { accountName: r.accountName, dr: 0, cr: Math.abs(net) };
        });
    }, []);

    const { sections, totals } = useMemo(() => {
        const built = sectionOrder.map(({ key, label }) => {
            const rows = normalizeSection(tb?.[key]);
            const sectionTotal = rows.reduce(
                (acc, r) => {
                    acc.dr += Number(r.dr) || 0;
                    acc.cr += Number(r.cr) || 0;
                    return acc;
                },
                { dr: 0, cr: 0 }
            );

            return { key, label, rows, sectionTotal };
        });

        const totals = built.reduce(
            (acc, s) => {
                acc.dr += Number(s.sectionTotal.dr) || 0;
                acc.cr += Number(s.sectionTotal.cr) || 0;
                return acc;
            },
            { dr: 0, cr: 0 }
        );

        return { sections: built, totals };
    }, [tb, sectionOrder, normalizeSection]);

    const difference = (Number(totals.dr) || 0) - (Number(totals.cr) || 0);

    const columns = useMemo(
        () => [
            { key: "accountName", label: "Accounts", bold: true },
            {
                key: "dr",
                label: "Dr",
                align: "right",
                render: (row) => (row?.dr ? formatCurrency(row.dr) : "-"),
            },
            {
                key: "cr",
                label: "Cr",
                align: "right",
                render: (row) => (row?.cr ? formatCurrency(row.cr) : "-"),
            },
        ],
        []
    );

    const hasAnyRows = sections.some((s) => (s.rows || []).length > 0);

    if (!hasAnyRows) {
        return (
            <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-sm text-gray-600">
                No data available
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-col items-center">
                <span>N K R S Lanka Capital Pvt Ltd</span>
                <span>Trial Balance</span>
                <span>As at {end}</span>
            </div>
            <TableWrapper>
                <TableHeader columns={columns} />
                <tbody className="bg-white">
                    {sections.map((section) => (
                        <React.Fragment key={section.key}>
                            {/* Section header row (like the uploaded image) */}
                            <tr className="border-t bg-gray-50">
                                <td className="px-3 py-2 font-semibold text-gray-900">
                                    {section.label}
                                </td>
                                <td className="px-3 py-2" />
                                <td className="px-3 py-2" />
                            </tr>

                            {/* Section rows */}
                            {(section.rows || []).map((row, idx) => (
                                <TableRow
                                    key={`${section.key}-${row.accountName}-${idx}`}
                                    row={row}
                                    columns={columns}
                                    rowIndex={idx}
                                />
                            ))}
                        </React.Fragment>
                    ))}

                    {/* Total row */}
                    <tr className="border-t bg-gray-50 font-semibold">
                        <td className="px-3 py-2 text-gray-900">Total</td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-900">
                            {formatCurrency(totals.dr)}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-900">
                            {formatCurrency(totals.cr)}
                        </td>
                    </tr>

                    {/* Difference row (to resemble the bottom line in the image) */}
                    <tr className="border-t">
                        <td className="px-3 py-2 text-gray-700"></td>
                        <td className="px-3 py-2 text-right text-gray-900">
                            {difference ? formatCurrency(difference) : "-"}
                        </td>
                        <td className="px-3 py-2"></td>
                    </tr>
                </tbody>
            </TableWrapper>
        </div>
    );
});

const formatEquityDate = (value) => {
    const parsed = value ? dayjs(value) : null;
    if (!parsed?.isValid()) return "";

    const day = parsed.date();
    const suffix =
        day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
                ? "nd"
                : day % 10 === 3 && day !== 13
                    ? "rd"
                    : "th";

    return `${String(day).padStart(2, "0")}${suffix} ${parsed.format("MMMM YYYY")}`;
};

const readFirstNumberFromMap = (map, preferredKey = null) => {
    if (!map || typeof map !== "object") return 0;
    if (preferredKey && Object.prototype.hasOwnProperty.call(map, preferredKey)) {
        const preferred = Number(map[preferredKey]);
        return Number.isFinite(preferred) ? preferred : 0;
    }

    const firstValue = Object.values(map)[0];
    const number = Number(firstValue);
    return Number.isFinite(number) ? number : 0;
};

const findShareCapitalFromTB = (tb) => {
    if (!tb || typeof tb !== "object") return null;
    const equityRows = tb.Equity || tb.equity || [];
    if (!Array.isArray(equityRows)) return null;

    const row = equityRows.find(
        (item) => String(item?.accountName ?? "").trim().toLowerCase() === "share capital"
    );
    if (!row) return null;

    const amount = Number(row.amount ?? 0);
    if (!Number.isFinite(amount)) return null;

    const transactionType = String(row.transactionType ?? "").trim().toUpperCase();
    return transactionType === "DR" ? -amount : amount;
};

const CETable = memo(function CETable({ data, tb, endDateVal }) {
    const ce = data || {};
    const end = endDateVal ? dayjs(endDateVal) : null;
    const openingDate = end?.isValid()
        ? end.subtract(1, "year").add(1, "day")
        : null;

    const openingStated = readFirstNumberFromMap(ce.statedCapitalBalance);
    const openingRetained = readFirstNumberFromMap(ce.retainedEarningBalance);
    const sharesStated = findShareCapitalFromTB(tb);
    const sharesRetained = readFirstNumberFromMap(ce.retainedEarningShares, "Shares Issued");
    const profitStated = readFirstNumberFromMap(
        ce.statedCapitalPL,
        "Profit or Loss for the Period"
    );

    const safeNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
    const rows = [
        {
            item: `Balance as at ${openingDate ? formatEquityDate(openingDate) : "-"}`,
            statedCapital: openingStated,
            retainedEarnings: openingRetained,
        },
        {
            item: "Shares Issued",
            statedCapital: sharesStated,
            retainedEarnings: sharesRetained,
        },
        {
            item: "Profit/(Loss) for the Period",
            statedCapital: profitStated,
            retainedEarnings: null,
        },
    ].map((row) => ({
        ...row,
        total: safeNumber(row.statedCapital) + safeNumber(row.retainedEarnings),
    }));

    const closing = rows.reduce(
        (acc, row) => ({
            statedCapital: acc.statedCapital + safeNumber(row.statedCapital),
            retainedEarnings: acc.retainedEarnings + safeNumber(row.retainedEarnings),
            total: acc.total + safeNumber(row.total),
        }),
        { statedCapital: 0, retainedEarnings: 0, total: 0 }
    );

    const statementEnd = end?.isValid() ? formatEquityDate(end) : "-";

    const renderValue = (value) =>
        value === null || value === undefined ? "-" : formatCurrency(value);

    return (
        <div className="space-y-3">
            <div className="text-sm font-semibold uppercase text-gray-900">
                <div>N K R S LANKA CAPITAL (PRIVATE) LIMITED</div>
                <div>STATEMENT OF CHANGES IN EQUITY</div>
                <div>FOR THE PERIOD ENDED {String(statementEnd).toUpperCase()}</div>
            </div>

            <TableWrapper>
                <thead className="bg-white">
                    <tr>
                        <th className="border-b px-3 py-2 text-left"></th>
                        <th className="border-b px-3 py-2 text-right font-semibold text-gray-900">
                            Stated Capital<br />Rs.
                        </th>
                        <th className="border-b px-3 py-2 text-right font-semibold text-gray-900">
                            Retained Earnings<br />Rs.
                        </th>
                        <th className="border-b px-3 py-2 text-right font-semibold text-gray-900">
                            Total<br />Rs.
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {rows.map((row, idx) => (
                        <tr key={idx} className="border-t">
                            <td className="px-3 py-2 font-medium text-gray-900">{row.item}</td>
                            <td className="px-3 py-2 text-right text-gray-700">
                                {renderValue(row.statedCapital)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700">
                                {renderValue(row.retainedEarnings)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700">
                                {renderValue(row.total)}
                            </td>
                        </tr>
                    ))}
                    <tr className="border-t-2 border-gray-900 font-semibold">
                        <td className="px-3 py-2 text-gray-900">
                            Balance as at {statementEnd}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-900">
                            {formatCurrency(closing.statedCapital)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-900">
                            {formatCurrency(closing.retainedEarnings)}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-900">
                            {formatCurrency(closing.total)}
                        </td>
                    </tr>
                </tbody>
            </TableWrapper>
        </div>
    );
});

const formatCashFlowDate = (value) => {
    const parsed = value ? dayjs(value) : null;
    if (!parsed?.isValid()) return "31ST MARCH";

    return `${parsed.date()}${formatEquityDate(parsed).replace(/^\d+(st|nd|rd|th)\s/i, "$1 ").toUpperCase()}`;
};

const findTrialBalanceAmount = (tb, accountName, side = "DR") => {
    if (!tb || typeof tb !== "object") return null;

    const wanted = String(accountName).trim().toLowerCase();
    const sections = [
        tb.BankAccounts,
        tb.bankAccounts,
        tb.Assets,
        tb.assets,
        tb.Liabilities,
        tb.liabilities,
        tb.Equity,
        tb.equity,
        tb.Income,
        tb.income,
        tb.Expenses,
        tb.expenses,
    ];

    const row = sections
        .filter(Array.isArray)
        .flat()
        .find((item) => String(item?.accountName ?? "").trim().toLowerCase() === wanted);

    if (!row) return null;

    const amount = Number(row.amount ?? 0);
    if (!Number.isFinite(amount)) return null;

    const transactionType = String(row.transactionType ?? "").trim().toUpperCase();
    if (side === "CR") return transactionType === "DR" ? null : amount;
    return transactionType === "CR" ? null : amount;
};

const findTrialBalanceAmountByAliases = (tb, accountNames, side = "DR") => {
    for (const accountName of accountNames) {
        const amount = findTrialBalanceAmount(tb, accountName, side);
        if (amount !== null) return amount;
    }

    return null;
};

const P11Table = memo(function P11Table({ data, tb, endDateVal }) {
    const end = endDateVal ? dayjs(endDateVal) : null;
    const year = end?.isValid() ? end.format("YYYY") : "2025";
    const asAtDate = end?.isValid()
        ? `${end.date()}${formatEquityDate(end).replace(/^\d+(st|nd|rd|th)\s/i, "$1 ").toUpperCase().replace(/\s\d{4}$/, "")}`
        : "31ST MARCH";

    const numberOfShares = Number(data?.numberOfShares ?? 0) || 0;
    const cashInHand = findTrialBalanceAmountByAliases(tb, ["Cash In Hand", "Cash"], "DR");
    const shareCapital = findTrialBalanceAmountByAliases(
        tb,
        ["Share capital", "Share Capital", "Stated Capital"],
        "CR"
    );
    const payables = [
        {
            label: "EPF",
            amount: findTrialBalanceAmountByAliases(tb, ["EPF"], "CR"),
        },
        {
            label: "ETF",
            amount: findTrialBalanceAmountByAliases(tb, ["ETF"], "CR"),
        },
        {
            label: "Accountancy Fee",
            amount: findTrialBalanceAmountByAliases(tb, ["Accountancy Fee", "Accountany Fee"], "CR"),
        },
        {
            label: "Audit Fee",
            amount: findTrialBalanceAmountByAliases(tb, ["Audit Fee"], "CR"),
        },
    ];
    const payablesTotal = payables.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

    const hasValue = (value) =>
        value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
    const renderAmount = (value, { red = false, top = false, bottom = false, number = false } = {}) => (
        <td
            className={[
                "w-28 border border-gray-300 px-2 py-1.5 text-right tabular-nums text-gray-950",
                red ? "bg-red-600 text-black" : "",
                top ? "border-t-2 border-t-black" : "",
                bottom ? "border-b-2 border-b-black" : "",
                number ? "" : "",
            ].join(" ")}
        >
            {hasValue(value) ? (number ? formatNumber(value) : formatCurrency(value)) : "-"}
        </td>
    );

    const LabelCell = ({ children, strong = false, indent = false }) => (
        <td
            className={[
                "border border-gray-300 px-2 py-1.5 text-left text-gray-950",
                strong ? "font-semibold" : "",
                indent ? "pl-4" : "",
            ].join(" ")}
            colSpan={8}
        >
            {children}
        </td>
    );

    const NoteCell = ({ children, strong = false }) => (
        <td
            className={[
                "w-10 border border-gray-300 px-2 py-1.5 text-center text-gray-950",
                strong ? "font-semibold" : "",
            ].join(" ")}
        >
            {children}
        </td>
    );

    const BlankRow = ({ height = "py-3" } = {}) => (
        <tr>
            <td className={`border border-gray-300 ${height}`} colSpan={10} />
        </tr>
    );

    return (
        <div className="w-full overflow-x-auto rounded-lg border bg-white">
            <table className="min-w-[790px] border-collapse text-sm">
                <tbody>
                    <tr>
                        <LabelCell strong>N K R S LANKA CAPITAL (PRIVATE) LIMITED</LabelCell>
                        <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold text-gray-950">
                            Page 11
                        </td>
                    </tr>
                    <tr>
                        <LabelCell strong>NOTES TO THE FINANCIAL STATEMENTS</LabelCell>
                        <td className="border border-gray-300 px-2 py-1.5" />
                    </tr>
                    <tr>
                        <LabelCell strong>AS AT {asAtDate}</LabelCell>
                        <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold text-gray-950">
                            {year}
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1.5" colSpan={9} />
                        <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold text-gray-950">
                            Rs
                        </td>
                    </tr>
                    <BlankRow />

                    <tr>
                        <NoteCell strong>9</NoteCell>
                        <LabelCell strong>Cash &amp; Cash Equivalent</LabelCell>
                        <td className="border border-gray-300 px-2 py-1.5" />
                    </tr>
                    <tr>
                        <NoteCell />
                        <LabelCell indent>Cash In Hand</LabelCell>
                        {renderAmount(cashInHand)}
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1.5" colSpan={9} />
                        {renderAmount(cashInHand, { top: true, bottom: true })}
                    </tr>
                    <BlankRow />

                    <tr>
                        <NoteCell strong>10</NoteCell>
                        <LabelCell strong>Stated Capital</LabelCell>
                        <td className="border border-gray-300 px-2 py-1.5" />
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1.5" colSpan={9} />
                        <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold text-gray-950">
                            Nos.
                        </td>
                    </tr>
                    <tr>
                        <NoteCell />
                        <LabelCell indent>Number of Shares - Ordinary Shares</LabelCell>
                        {renderAmount(numberOfShares, { red: true, number: true })}
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1.5" colSpan={9} />
                        {renderAmount(numberOfShares, { top: true, bottom: true, number: true })}
                    </tr>
                    <BlankRow height="py-5" />
                    <tr>
                        <td className="border border-gray-300 px-2 py-1.5" colSpan={9} />
                        <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold text-gray-950">
                            Rs.
                        </td>
                    </tr>
                    <tr>
                        <NoteCell />
                        <LabelCell indent>Value - Ordinary Shares</LabelCell>
                        {renderAmount(shareCapital)}
                    </tr>
                    <tr>
                        <td className="border border-gray-300 px-2 py-1.5" colSpan={9} />
                        {renderAmount(shareCapital, { top: true, bottom: true })}
                    </tr>
                    <BlankRow />

                    <tr>
                        <NoteCell strong>11</NoteCell>
                        <LabelCell strong>Trade Creditors &amp; Other Payable</LabelCell>
                        <td className="border border-gray-300 px-2 py-1.5" />
                    </tr>
                    {payables.map((row) => (
                        <tr key={row.label}>
                            <NoteCell />
                            <LabelCell indent>{row.label}</LabelCell>
                            {renderAmount(row.amount)}
                        </tr>
                    ))}
                    <tr>
                        <td className="border border-gray-300 px-2 py-1.5" colSpan={9} />
                        {renderAmount(payablesTotal, { top: true, bottom: true })}
                    </tr>
                </tbody>
            </table>
        </div>
    );
});

const CashFlowTable = memo(function CashFlowTable({ data, tb, endDateVal }) {
    const cf = data || {};
    const end = endDateVal ? dayjs(endDateVal) : null;
    const year = end?.isValid() ? end.format("YYYY") : "2025";
    const periodEnd = formatCashFlowDate(endDateVal);
    const openingCashBalance = cf.openingCashBalance;
    const cashInHandAmount = cf.cashInHandAmount;
    const incomeTaxPaid = findTrialBalanceAmount(tb, "Income Tax", "DR");

    const renderAmount = (value, { red = false, strong = false, borderTop = false, borderBottom = false } = {}) => {
        const number = Number(value);
        const hasValue = value !== null && value !== undefined && value !== "" && Number.isFinite(number);
        const display = hasValue ? formatCurrency(Math.abs(number)) : "-";
        const bracketed = hasValue && number < 0 ? `(${display})` : display;

        return (
            <td
                className={[
                    "w-36 border border-gray-200 px-2 py-1.5 text-right tabular-nums text-gray-900",
                    red ? "bg-white text-black" : "",
                    strong ? "font-semibold" : "",
                    borderTop ? "border-t-gray-900" : "",
                    borderBottom ? "border-b-gray-900" : "",
                ].join(" ")}
            >
                {bracketed}
            </td>
        );
    };

    const LabelCell = ({ children, strong = false, indent = false }) => (
        <td
            className={[
                "border border-gray-200 px-2 py-1.5 text-left text-gray-900",
                strong ? "font-semibold" : "",
                indent ? "pl-8" : "",
            ].join(" ")}
            colSpan={indent ? 4 : 5}
        >
            {children}
        </td>
    );

    const SpacerRow = () => (
        <tr>
            <td className="border border-gray-200 px-2 py-2" colSpan={6} />
        </tr>
    );

    return (
        <div className="w-full overflow-x-auto rounded-lg border bg-white">
            <table className="min-w-[980px] border-collapse text-sm">
                <tbody>
                    <tr>
                        <LabelCell strong>N K R S LANKA CAPITAL (PRIVATE) LIMITED</LabelCell>
                        <td className="border border-gray-200 px-2 py-1.5 text-center font-semibold text-gray-900">
                            Page 5
                        </td>
                    </tr>
                    <tr>
                        <LabelCell strong>STATEMENT OF CASH FLOWS</LabelCell>
                        <td className="border border-gray-200 px-2 py-1.5" />
                    </tr>
                    <tr>
                        <LabelCell strong>FOR THE YEAR PERIOD {periodEnd}</LabelCell>
                        <td className="border border-gray-200 px-2 py-1.5 text-center font-semibold text-gray-900">
                            {year}
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-200 px-2 py-1.5" colSpan={5} />
                        <td className="border border-gray-200 px-2 py-1.5 text-center font-semibold text-gray-900">
                            Rs.
                        </td>
                    </tr>

                    <SpacerRow />
                    <tr>
                        <LabelCell strong>Cash flow from Operating Activities</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell>Net Profit before Taxation</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell>Adjustments For:</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell indent>Depreciation</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell strong>Operating Profit Before Working Capital Changes</LabelCell>
                        {renderAmount(null, { strong: true })}
                    </tr>

                    <SpacerRow />
                    <tr>
                        <LabelCell indent>(Increase)/Decrease in Receivables</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell indent>Increase/(Decrease) in Trade Creditors & Other Payable</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell indent>Increase/(Decrease) in Director's Current Account</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell strong>Cash Generated from Operations</LabelCell>
                        {renderAmount(null, { strong: true })}
                    </tr>

                    <SpacerRow />
                    <tr>
                        <LabelCell indent>Income Tax Paid</LabelCell>
                        {renderAmount(incomeTaxPaid)}
                    </tr>
                    <tr>
                        <td className="border border-gray-200 px-2 py-1.5" colSpan={5} />
                        {renderAmount(incomeTaxPaid, { borderTop: true })}
                    </tr>
                    <tr>
                        <LabelCell strong>Net Cash Flows from Operating Activities</LabelCell>
                        {renderAmount(null, { strong: true })}
                    </tr>

                    <SpacerRow />
                    <tr>
                        <LabelCell strong>Cash Flow from Investing Activities</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell indent>Property, Plant and Equipment</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell strong>Net Cash Flow from/(Used in) Investing Activities</LabelCell>
                        {renderAmount(null, { strong: true })}
                    </tr>

                    <SpacerRow />
                    <tr>
                        <LabelCell strong>Cash flow from Financing Activities</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell indent>Shares Issued</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell strong>Net Cash Used in Financing Activities</LabelCell>
                        {renderAmount(null, { strong: true })}
                    </tr>
                    <tr>
                        <LabelCell strong>Net increase/ (Decrease) in Cash & Cash Equivalents</LabelCell>
                        {renderAmount(null, { strong: true })}
                    </tr>
                    <tr>
                        <LabelCell indent>Cash & Cash Equivalents at the Beginning of the Period</LabelCell>
                        {renderAmount(openingCashBalance, { red: true })}
                    </tr>
                    <tr>
                        <LabelCell indent>Cash & Cash Equivalents at the End of the Period</LabelCell>
                        {renderAmount(null, { borderBottom: true })}
                    </tr>

                    <SpacerRow />
                    <tr>
                        <LabelCell strong>At the Beginning</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell indent>Cash in Hand</LabelCell>
                        {renderAmount(cashInHandAmount, { red: true })}
                    </tr>
                    <tr>
                        <td className="border border-gray-200 px-2 py-1.5" colSpan={5} />
                        {renderAmount(cashInHandAmount, { borderTop: true, borderBottom: true })}
                    </tr>

                    <SpacerRow />
                    <tr>
                        <LabelCell strong>At the End</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <LabelCell indent>Cash in Hand</LabelCell>
                        {renderAmount(null)}
                    </tr>
                    <tr>
                        <td className="border border-gray-200 px-2 py-1.5" colSpan={5} />
                        {renderAmount(null, { borderTop: true })}
                    </tr>
                </tbody>
            </table>
        </div>
    );
});

// Generic Table (for other report types)
const GenericTable = memo(function GenericTable({ data, title }) {
    const rows = Array.isArray(data) ? data : [];

    if (rows.length === 0) {
        return (
            <div className="rounded-lg border border-dashed bg-gray-50 p-4 text-sm text-gray-600">
                No data available
            </div>
        );
    }

    const allKeys = Array.from(
        rows.reduce((set, row) => {
            Object.keys(row || {}).forEach((k) => set.add(k));
            return set;
        }, new Set())
    );

    const columns = allKeys.map((key) => ({
        key,
        label: humanTitle(key),
        align: typeof rows[0]?.[key] === "number" ? "right" : "left",
        render: (row) => {
            const val = row?.[key];
            if (val === null || val === undefined) return "-";
            if (typeof val === "number") return formatCurrency(val);
            if (typeof val === "boolean") return val ? "Yes" : "No";
            return String(val);
        },
    }));

    return (
        <TableWrapper title={title}>
            <TableHeader columns={columns} />
            <tbody className="bg-gray-500">
                {rows.map((row, idx) => (
                    <TableRow key={idx} row={row} columns={columns} rowIndex={idx} />
                ))}
            </tbody>
        </TableWrapper>
    );
});

const ReportTables = memo(function ReportTables({ data, end, reportType }) {
    const sortedSections = useMemo(() => {
        if (!data) return [];

        if (Array.isArray(data)) {
            return [{ key: "report", value: data, type: "generic" }];
        }

        if (typeof data !== "object") {
            return [{ key: "report", value: { value: data }, type: "generic" }];
        }

        const preferredOrder = [
            "ppe",
            "working",
            ...(reportType === "p11" ? [] : ["tb", "trialBalance"]),
            "incometax",
            "incomeTax",
            "p10",
            "p09",
            "p11",
            "pl",
            "profitLoss",
            "bs",
            "balanceSheet",
            "ce",
            "equityChanges",
            "cf",
            "cashFlow",
            "statement",
        ];

        const entries = Object.entries(data);

        const preferred = preferredOrder
            .filter((k) => Object.prototype.hasOwnProperty.call(data, k))
            .map((k) => [k, data[k]]);

        const rest = entries.filter(([k]) => !preferredOrder.includes(k));

        return [...preferred, ...rest].map(([key, value]) => {
            let type = "generic";
            if (key === "ppe") type = "ppe";
            if (key === "working") type = "working";
            return { key, value, type };
        });
    }, [data, reportType]);

    const renderSection = useCallback((section) => {
        const { key, value, type } = section;

        if (key === "ppe" || type === "ppe") {
            return <PPETable data={value} />;
        }

        if (key === "working" || type === "working") {
            return <WorkingTable data={value} />;
        }

        if (key === "tb" || key === "trialBalance") {
            return <TBTable data={value} endDateVal={end} />;
        }

        if (key === "ce" || key === "equityChanges") {
            return <CETable data={value} tb={data?.tb || data?.trialBalance} endDateVal={end} />;
        }

        if (key === "cf" || key === "cashFlow") {
            return <CashFlowTable data={value} tb={data?.tb || data?.trialBalance} endDateVal={end} />;
        }

        if (key === "p11") {
            return <P11Table data={value} tb={data?.tb || data?.trialBalance} endDateVal={end} />;
        }

        // Handle nested objects for other types
        if (value && typeof value === "object" && !Array.isArray(value)) {
            // Check if it has array properties
            const arrayProps = Object.entries(value).filter(([, v]) =>
                Array.isArray(v)
            );

            if (arrayProps.length > 0) {
                return (
                    <div className="space-y-4">
                        {arrayProps.map(([propKey, propValue]) => (
                            <GenericTable
                                key={propKey}
                                data={propValue}
                                title={humanTitle(propKey)}
                            />
                        ))}
                        {/* Handle non-array props */}
                        {Object.entries(value)
                            .filter(([, v]) => !Array.isArray(v))
                            .map(([propKey, propValue]) => (
                                <div key={propKey} className="rounded-lg border bg-white p-4">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {humanTitle(propKey)}:
                                    </span>{" "}
                                    <span className="text-sm text-gray-700">
                                        {typeof propValue === "number"
                                            ? formatCurrency(propValue)
                                            : String(propValue)}
                                    </span>
                                </div>
                            ))}
                    </div>
                );
            }
        }

        return <GenericTable data={value} title={humanTitle(key)} />;
    }, [data, end]);

    if (!data) return null;

    if (Array.isArray(data)) {
        return reportType === "ppe" ? (
            <PPETable data={data} />
        ) : (
            <GenericTable data={data} title={humanTitle(reportType)} />
        );
    }

    return (
        <div className="space-y-6">
            {sortedSections.map((section) => (
                <section key={section.key} className="space-y-2">
                    {section.key !== "ppe" && section.key !== "working" && (
                        <h3 className="text-base font-semibold text-gray-900">
                            {humanTitle(section.key)}
                        </h3>
                    )}
                    {renderSection(section)}
                </section>
            ))}
        </div>
    );
});

export default ReportTables;
export { humanTitle, formatCurrency, formatNumber, formatDate };
