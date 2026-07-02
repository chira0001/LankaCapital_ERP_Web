import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import pb from '@/lib/pocketbaseClient.js';
import { Wallet, Download, Calendar } from 'lucide-react';
import { Button } from '@/component/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

const formatLKR = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);

const PettyCashPage = () => {
  const [pettyCashData, setPettyCashData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPettyCash();
  }, []);

  const fetchPettyCash = async () => {
    try {
        {/*
      const data = await pb.collection('petty_cash').getFullList({
        expand: 'field_officer_id',
        sort: '-date',
        $autoCancel: false
      });

      */}

      //  HARD CODED DATA
    const data = [
      {
        id: "1",
        date: "2026-04-18",
        amount_collected: 15000,
        cash_balance: 5000,
        fieldOfficer: {
          employee_id: "FO001",
          name: "Kasun Perera",
          email: "kasun@gmail.com"
        }
      },
      {
        id: "2",
        date: "2026-04-17",
        amount_collected: 20000,
        cash_balance: 8000,
        fieldOfficer: {
          employee_id: "FO002",
          name: "Nimal Silva",
          email: "nimal@gmail.com"
        }
      },
      {
        id: "3",
        date: "2026-04-16",
        amount_collected: 12000,
        cash_balance: 3000,
        fieldOfficer: {
          employee_id: "FO003",
          name: "Amila Fernando",
          email: "amila@gmail.com"
        }
      }
    ];
    //

     // NORMALIZATION LOGIC (IN CASE OF NESTED EXPAND ISSUES)
      const normalizedData = data.map(item => ({
        ...item,
        fieldOfficer: item.fieldOfficer ?? item.expand?.field_officer_id ?? {}
      }));

      // USE NORMALIZED DATA
      setPettyCashData(normalizedData);

      //setPettyCashData(data);

      // Process chart data (group by date)
      const groupedByDate = data.reduce((acc, curr) => {
        const dateStr = new Date(curr.date).toLocaleDateString();
        if (!acc[dateStr]) {
          acc[dateStr] = { date: dateStr, collected: 0 };
        }
        acc[dateStr].collected += curr.amount_collected;
        return acc;
      }, {});

      setChartData(Object.values(groupedByDate).slice(0, 14).reverse()); // Last 14 days
    } catch (error) {
      console.error('Failed to fetch petty cash:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = pettyCashData.map(item => ({
      'Date': new Date(item.date).toLocaleDateString(),
      'Field Officer Name': item.fieldOfficer?.name || item.fieldOfficer?.email || 'N/A',
      'Amount Collected (LKR)': item.amount_collected,
      'Cash Balance (LKR)': item.cash_balance || 0,
      'Notes': item.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Petty Cash");
    XLSX.writeFile(wb, `Petty_Cash_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex">
       
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading petty cash data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Petty Cash - LendPro</title>
        <meta name="description" content="Manage and track daily petty cash collections." />
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">
        
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Petty Cash Management</h1>
                <p className="text-gray-600">Track daily cash collections by field officers</p>
              </div>
              <Button
                onClick={handleExportExcel}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-bold text-black mb-6">Daily Cash Collection Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#4b5563" />
                  <YAxis stroke="#4b5563" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => formatLKR(value)}
                  />
                  <Legend />
                  <Bar dataKey="collected" fill="#000000" name="Amount Collected" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold text-black">Field Officer Cash Collections</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Employee ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Field Officer Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Total Collected (LKR)</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Cash Balance (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pettyCashData.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        {/*NORMALIZED FIELD */}
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-gray-600">
                            {record.fieldOfficer?.employee_id || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-black">
                            {record.fieldOfficer?.name || record.fieldOfficer?.email || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-black">{formatLKR(record.amount_collected)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{formatLKR(record.cash_balance || 0)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pettyCashData.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No petty cash records found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PettyCashPage;