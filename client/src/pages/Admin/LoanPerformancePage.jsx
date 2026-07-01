import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import pb from '@/lib/pocketbaseClient.js';
import { TrendingDown, Clock, CheckCircle } from 'lucide-react';

const formatLKR = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);

const LoanPerformancePage = () => {
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [convertedCount, setConvertedCount] = useState(0);
  const [collectionEfficiency, setCollectionEfficiency] = useState(0);
  const [agingBreakdown, setAgingBreakdown] = useState({
    early: 0,
    medium: 0,
    late: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
        {/*
      const today = new Date().toISOString().split('T')[0];
      
      const loans = await pb.collection('loans').getFullList({
        expand: 'borrower_id',
        $autoCancel: false
      });
      */}

     //  HARD CODED SAMPLE DATA
    const loans = [
      {
        id: "1",
    amount: 50000,
    due_date: "2026-04-05", // overdue (very late)
    status: "Active",
    borrower: { name: "Kasun Perera", phone: "0712345678" }
  },
  {
    id: "2",
    amount: 75000,
    due_date: "2026-04-12", // overdue (mid)
    status: "Active",
    borrower: { name: "Nimal Silva", phone: "0771234567" }
  },
  {
    id: "3",
    amount: 30000,
    due_date: "2026-04-17", //  recently overdue / early
    status: "Active",
    borrower: { name: "Amila Fernando", phone: "0755555555" }
  },
  {
    id: "4",
    amount: 60000,
    due_date: "2026-04-25", // not overdue
    status: "Active",
    borrower: { name: "Saman Kumara", phone: "0759876543" }
  },
  {
    id: "5",
    amount: 90000,
    due_date: "2026-03-28", //  very overdue (late stage)
    status: "Active",
    borrower: { name: "Dilshan Perera", phone: "0770001111" }
  },
  {
    id: "6",
    amount: 120000,
    due_date: "2026-04-10",
    status: "Converted",
    updated: "2026-04-15",
    borrower: { name: "Kasun Raj", phone: "0711112222" }
  }
];

    const transactions = [
      { status: "Paid", payment_date: "2026-04-02" },
      { status: "Paid", payment_date: "2026-04-10" },
      { status: "Pending", payment_date: "2026-04-15" }
    ];

    const today = new Date("2026-04-18");


      //
      const overdue = loans.filter(loan => 
        loan.status === 'Active' && loan.due_date < today
      ).map(loan => {
        const dueDate = new Date(loan.due_date);
        const todayDate = new Date(today);
        const daysOverdue = Math.floor((todayDate - dueDate) / (1000 * 60 * 60 * 24));
        return { ...loan, daysOverdue };
      });

      setOverdueLoans(overdue);


      //const currentMonth = new Date().toISOString().slice(0, 7);
      //const converted = loans.filter(loan => 
      //  loan.status === 'Converted' && 
      //  loan.updated.startsWith(currentMonth)
      //);
      //setConvertedCount(converted.length);

      //const transactions = await pb.collection('transactions').getFullList({
      //  filter: `payment_date >= "${currentMonth}-01"`,
      //  $autoCancel: false
      //});

    const converted = loans.filter(l => l.status === "Converted");
    setConvertedCount(converted.length);
////
      const totalDue = transactions.length;
      const totalPaid = transactions.filter(t => t.status === 'Paid').length;
      const efficiency = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
      setCollectionEfficiency(efficiency);

      const early = overdue.filter(l => l.daysOverdue >= 1 && l.daysOverdue <= 7).length;
      const medium = overdue.filter(l => l.daysOverdue >= 8 && l.daysOverdue <= 15).length;
      const late = overdue.filter(l => l.daysOverdue > 15).length;

      setAgingBreakdown({ early, medium, late });

    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        {/* <Sidebar /> */}
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Loan Performance - LendPro</title>
        <meta name="description" content="Track loan performance, overdue accounts, and collection efficiency." />
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">
        {/* <Sidebar /> */}
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Loan Performance</h1>
              <p className="text-gray-600">Monitor loan health and collection metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Overdue Loans</p>
                <p className="text-3xl font-bold text-red-600">{overdueLoans.length}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Converted This Month</p>
                <p className="text-3xl font-bold text-black">{convertedCount}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-black" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Collection Efficiency</p>
                <p className="text-3xl font-bold text-black">{collectionEfficiency.toFixed(1)}%</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Overdue Amount</p>
                <p className="text-3xl font-bold text-black">
                  {formatLKR(overdueLoans.reduce((sum, l) => sum + l.amount, 0))}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-black mb-4">1-7 Days Late</h3>
                <p className="text-4xl font-bold text-gray-800 mb-2">{agingBreakdown.early}</p>
                <p className="text-sm text-gray-600">Early stage overdue</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-black mb-4">8-15 Days Late</h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">{agingBreakdown.medium}</p>
                <p className="text-sm text-gray-600">Requires attention</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-black mb-4">15+ Days Late</h3>
                <p className="text-4xl font-bold text-red-600 mb-2">{agingBreakdown.late}</p>
                <p className="text-sm text-gray-600">Critical - immediate action</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-black">Overdue Loans Tracking</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Borrower</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Due Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Days Overdue</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {overdueLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-black">
                            {loan.expand?.borrower_id?.name || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-black">{formatLKR(loan.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {new Date(loan.due_date).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            loan.daysOverdue <= 7 
                              ? 'bg-gray-100 text-gray-700 border-gray-200'
                              : loan.daysOverdue <= 15
                              ? 'bg-gray-200 text-gray-800 border-gray-300'
                              : 'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            {loan.daysOverdue} days
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{loan.expand?.borrower_id?.phone || 'N/A'}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {overdueLoans.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-black mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No overdue loans - excellent performance!</p>
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

export default LoanPerformancePage;