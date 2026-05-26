import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { File, Download, CalendarDays } from "lucide-react";
import { Button } from "@/component/ui/button";
import { Label } from "@/component/ui/label";
import DatePicker from "@/components/DatePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/ui/select";
import * as XLSX from "xlsx";

/* FORMAT CURRENCY */
const formatLKR = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(amount);

/*  HARD CODE DATA */
const dummyTransactions = [
  {
    loan_id: "LN001",
    borrower_name: "Kamal Perera",
    amount: 50000,
    interest_rate: 12,
    duration: 12,
    status: "Paid",
    officer: "Nimal",
    payment_date: "2026-04-10",
  },
  {
    loan_id: "LN002",
    borrower_name: "Saman Silva",
    amount: 75000,
    interest_rate: 10,
    duration: 10,
    status: "Pending",
    officer: "Kamal",
    payment_date: "2026-04-12",
  },
  {
    loan_id: "LN003",
    borrower_name: "Nimal Perera",
    amount: 100000,
    interest_rate: 15,
    duration: 18,
    status: "Paid",
    officer: "Sunil",
    payment_date: "2026-04-15",
  },
];

/*MAIN COMPONENT */
const FinancialReportsPage = () => {
  const [reportType, setReportType] = useState("collection");
    // DatePicker uses Date objects
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


  /* EDITABLE EXPORT DATA (ADMIN FEATURE)*/
  const [exportData, setExportData] = useState([]);

  /*FILTER + EXPORT */
  const handleGeneratePreview = () => {
    // If no dates selected → show all data
    if (!startDate || !endDate) {
        setExportData(dummyTransactions);
        return;
    }

    // Ensure correct date comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    // optional safety: set time range full day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Filter data
    const filtered = dummyTransactions.filter((t) => {
        const transactionDate = new Date(t.payment_date);

       const isAfterStart = startDate
            ? transactionDate >= new Date(startDate)
            : true;

        const isBeforeEnd = endDate
            ? transactionDate <= new Date(endDate)
            : true;

        return isAfterStart && isBeforeEnd;
    });
   //REPORT TYPE FILTER 
   /* if (reportType === "collection") {
        filtered = filtered.filter((t) => t.status === "Paid");
    }

    if (reportType === "income") {
        filtered = filtered.filter((t) => t.status === "Paid");
        // later add the profit calculation
    }*/


    //  Update table
    setExportData(filtered);
    };

  const handleEdit = (index, field, value) => {
    const updated = [...exportData];
    updated[index][field] = value;
    setExportData(updated);
  };

  const handleExportExcel = () => {
    if (exportData.length === 0) {
      alert("No data to export. Please generate preview first.");
      return;
    }

    const exportSheet = exportData.map((t) => ({
      "Loan ID": t.loan_id,
      "Borrower Name": t.borrower_name,
      Amount: t.amount,
      "Interest Rate": t.interest_rate,
      Duration: t.duration,
      Status: t.status,
      "Field Officer": t.officer,
      "Payment Date": t.payment_date,
    }));

    const ws = XLSX.utils.json_to_sheet(exportSheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");

    XLSX.writeFile(
      wb,
      `Financial_Report_${startDate || "all"}_to_${endDate || "all"}.xlsx`
    );
  };

  /*2. DATABASE VERSION
      WHEN CONNECT TO BACKEND*/

  /*
  const fetchFromDB = async () => {
    import pb from "@/lib/pocketbaseClient.js";

    const transactions = await pb.collection("transactions").getFullList({
      expand: "loan_id,borrower_id,field_officer_id",
    });

    setExportData(
      transactions.map(t => ({
        loan_id: t.loan_id,
        borrower_name: t.expand?.borrower_id?.name,
        amount: t.amount,
        interest_rate: t.expand?.loan_id?.interest_rate,
        duration: t.expand?.loan_id?.duration_months,
        status: t.status,
        officer: t.expand?.field_officer_id?.name,
        payment_date: t.payment_date
      }))
    );
  };
  */

  return (
    <>
      <Helmet>
        <title>Financial Reports</title>
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">
       

        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Financial Reports</h1>

          {/* FILTER SECTION*/}
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collection">Collection</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

         {/* START DATE (NOW USING DATEPICKER)*/}
              <div>
                <Label>Start Date</Label>
                <DatePicker date={startDate} setDate={setStartDate} />
              </div>

              {/*END DATE (NOW USING DATEPICKER)*/}
              <div>
                <Label>End Date</Label>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>

            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={handleGeneratePreview} className="bg-gray-800 text-white">
                Generate Preview
              </Button>

              <Button onClick={handleExportExcel} className="bg-black text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>

          {/* EDITABLE PREVIEW TABLE (ADMIN FEATURE) */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold mb-4">Preview & Edit (Admin Only)</h2>

            {exportData.length === 0 ? (
              <p className="text-gray-500">Click "Generate Preview" to load data</p>
            ) : (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th>Loan ID</th>
                    <th>Borrower</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Officer</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {exportData.map((row, i) => (
                    <tr key={i} className="text-center border-t">
                      <td>{row.loan_id}</td>

                      <td>
                        <input
                          value={row.borrower_name}
                          onChange={(e) =>
                            handleEdit(i, "borrower_name", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={row.amount}
                          onChange={(e) =>
                            handleEdit(i, "amount", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={row.status}
                          onChange={(e) =>
                            handleEdit(i, "status", e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <input
                          value={row.officer}
                          onChange={(e) =>
                            handleEdit(i, "officer", e.target.value)
                          }
                        />
                      </td>

                      <td>{row.payment_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancialReportsPage;