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
            "tb",
            "trialBalance",
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
    }, [data]);

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
