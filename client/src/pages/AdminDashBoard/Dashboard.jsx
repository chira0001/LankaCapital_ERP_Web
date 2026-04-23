import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import Sidebar from '@/component/AdminSideBar/AdminSidebar.jsx';
//import pb from '@/lib/pocketbaseClient.js';
import { DollarSign, TrendingUp, AlertCircle, Briefcase } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatLKR = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);

const DashboardPage = () => {
  const [metrics, setMetrics] = useState({
    totalActiveLoans: 0,
    totalOutstanding: 0,
    monthlyCollection: 0,
    monthlyProfit: 0
  });
  const [monthlyIncome, setMonthlyIncome] = useState([]);
  const [loanDistribution, setLoanDistribution] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

{/*
  const fetchDashboardData = async () => {
    try {
      const loans = await pb.collection('loans').getFullList({ $autoCancel: false });
      
      const activeLoans = loans.filter(l => l.status === 'Active');
      const totalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const transactions = await pb.collection('transactions').getFullList({
        filter: `payment_date >= "${currentMonth}-01" && status = "Paid"`,
        $autoCancel: false
      });
      
      const monthlyCollection = transactions.reduce((sum, t) => sum + t.amount, 0);
      const monthlyProfit = transactions
        .filter(t => t.transaction_type === 'Interest')
        .reduce((sum, t) => sum + t.amount, 0);

      setMetrics({
        totalActiveLoans: activeLoans.length,
        totalOutstanding,
        monthlyCollection,
        monthlyProfit
      });

      const incomeData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        
        const monthTransactions = await pb.collection('transactions').getFullList({
          filter: `payment_date >= "${monthStr}-01" && payment_date < "${monthStr}-31" && transaction_type = "Interest" && status = "Paid"`,
          $autoCancel: false
        });
        
        const income = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
        incomeData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          income: income
        });
      }
      setMonthlyIncome(incomeData);

      const statusCounts = {
        Active: loans.filter(l => l.status === 'Active').length,
        Overdue: loans.filter(l => l.status === 'Overdue').length,
        Converted: loans.filter(l => l.status === 'Converted').length
      };

      setLoanDistribution([
        { name: 'Active', value: statusCounts.Active, color: '#000000' },
        { name: 'Overdue', value: statusCounts.Overdue, color: '#ef4444' },
        { name: 'Converted', value: statusCounts.Converted, color: '#9ca3af' }
      ]);

      const pendingApps = await pb.collection('applications').getFullList({
        filter: 'status = "Pending"',
        $autoCancel: false
      });

      const today = new Date().toISOString().split('T')[0];
      const overdueLoans = loans.filter(l => l.due_date < today && l.status === 'Active');

      const alertsList = [];
      if (pendingApps.length > 0) {
        alertsList.push({
          type: 'warning',
          message: `${pendingApps.length} loan application${pendingApps.length > 1 ? 's' : ''} pending approval`
        });
      }
      if (overdueLoans.length > 0) {
        alertsList.push({
          type: 'danger',
          message: `${overdueLoans.length} loan${overdueLoans.length > 1 ? 's' : ''} overdue - immediate action required`
        });
      }
      setAlerts(alertsList);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };*/}

  // REPLACE ENTIRE FUNCTION
const fetchDashboardData = async () => {
  try {
    // HARD CODED DATA
    setMetrics({
      totalActiveLoans: 12,
      totalOutstanding: 450000,
      monthlyCollection: 120000,
      monthlyProfit: 35000
    });

    setMonthlyIncome([
      { month: 'Jan', income: 20000 },
      { month: 'Feb', income: 25000 },
      { month: 'Mar', income: 30000 },
      { month: 'Apr', income: 28000 },
      { month: 'May', income: 35000 },
      { month: 'Jun', income: 40000 },
    ]);

    setLoanDistribution([
      { name: 'Active', value: 8, color: '#070e59' },
      { name: 'Overdue', value: 3, color: '#ef4444' },
      { name: 'Converted', value: 1, color: '#9ca3af' }
    ]);

    setAlerts([
      { type: 'warning', message: '2 loan applications pending approval' },
      { type: 'danger', message: '3 loans overdue - immediate action required' }
    ]);

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};



//////

  if (loading) {
    return (
      <div className="flex">
       {/*<Sidebar />*/}
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Executive Dashboard - LendPro</title>
        <meta name="description" content="View key metrics, loan performance, and financial insights for your money lending business." />
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">
        {/*<Sidebar />*/}
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Executive Dashboard</h1>
              <p className="text-gray-600">Overview of your lending operations and key metrics</p>
            </div>

            {alerts.length > 0 && (
              <div className="mb-8 space-y-3">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      alert.type === 'danger'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      alert.type === 'danger' ? 'text-red-600' : 'text-gray-800'
                    }`} />
                    <p className={`font-medium ${
                      alert.type === 'danger' ? 'text-red-800' : 'text-gray-800'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-black" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Active Loans</p>
                <p className="text-3xl font-bold text-black">{metrics.totalActiveLoans}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-black" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Outstanding</p>
                <p className="text-3xl font-bold text-black">{formatLKR(metrics.totalOutstanding)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-black" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Monthly Collection</p>
                <p className="text-3xl font-bold text-black">{formatLKR(metrics.monthlyCollection)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-black" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Monthly Profit</p>
                <p className="text-3xl font-bold text-black">{formatLKR(metrics.monthlyProfit)}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-black mb-6">Monthly Income Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyIncome}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#4b5563" />
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
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#000000" 
                      strokeWidth={3}
                      dot={{ fill: '#000000', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-black mb-6">Loan Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={loanDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {loanDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;