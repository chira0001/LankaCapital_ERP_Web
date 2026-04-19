import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import pb from '@/lib/pocketbaseClient.js';
import { UserCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatLKR = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);

const FieldOfficerPerformancePage = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      // Fetch all field officers
      const officers = await pb.collection('users').getFullList({
        filter: 'role = "Field Officer"',
        $autoCancel: false
      });

      // Fetch all transactions
      const transactions = await pb.collection('transactions').getFullList({
        $autoCancel: false
      });

      const data = officers.map(officer => {
        const officerTrans = transactions.filter(t => t.field_officer_id === officer.id);
        const paidTrans = officerTrans.filter(t => t.status === 'Paid');
        
        const totalAssigned = officerTrans.length;
        const totalCollected = paidTrans.reduce((sum, t) => sum + t.amount, 0);
        const pendingAmount = officerTrans.filter(t => t.status !== 'Paid').reduce((sum, t) => sum + t.amount, 0);
        const collectionRate = totalAssigned > 0 ? (paidTrans.length / totalAssigned) * 100 : 0;
        
        // Find last collection date
        const dates = paidTrans.map(t => new Date(t.payment_date).getTime()).filter(d => !isNaN(d));
        const lastCollectionDate = dates.length > 0 ? new Date(Math.max(...dates)).toLocaleDateString() : 'N/A';

        return {
          id: officer.id,
          employee_id: officer.employee_id || 'N/A',
          name: officer.name || officer.email,
          totalAssigned,
          totalCollected,
          pendingAmount,
          collectionRate,
          lastCollectionDate
        };
      });

      setPerformanceData(data);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        
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
        <title>Field Officer Performance - LendPro</title>
        <meta name="description" content="Track and analyze field officer collection performance." />
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">
        
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Field Officer Performance</h1>
              <p className="text-gray-600">Analyze collection metrics and efficiency by officer</p>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-bold text-black mb-6">Collection Performance by Officer</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#4b5563" />
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
                  <Bar dataKey="totalCollected" fill="#000000" name="Total Collected Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold text-black">Officer Metrics</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Employee ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Total Assigned Loans</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Total Collected (LKR)</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Pending Amount (LKR)</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Collection Rate %</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Last Collection Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {performanceData.map((officer) => (
                      <tr key={officer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-gray-600">{officer.employee_id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-black">{officer.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{officer.totalAssigned}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-black">{formatLKR(officer.totalCollected)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{formatLKR(officer.pendingAmount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            officer.collectionRate >= 80 ? 'bg-gray-200 text-black border-gray-300' : 'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            {officer.collectionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{officer.lastCollectionDate}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {performanceData.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No field officer data available</p>
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

export default FieldOfficerPerformancePage;