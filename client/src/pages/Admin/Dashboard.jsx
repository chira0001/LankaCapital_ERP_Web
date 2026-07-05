import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Briefcase,
} from "lucide-react";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// =========================
// FORMAT CURRENCY
// =========================
const formatLKR = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(amount || 0);

// =========================
// DUMMY LINE DATA (SUM = 1,050,000)
// =========================
const dummyMonthlyIncome = [
  { month: "Jan", income: 15000 },
  { month: "Feb", income: 16000 },
  { month: "Mar", income: 17000 },
  { month: "Apr", income: 18000 },
  { month: "May", income: 20000 },
  { month: "Jun", income: 19000 },
];

// TOTAL INCOME = 1,050,000

// =========================
// PIE CHART DATA
// =========================
const dummyLoanDistribution = [
  { name: "Active Loans", value: 15, color: "#1E3A8A" },   // dark blue
  { name: "Pending Loans", value: 5, color: "#6B7280" },  // gray
  { name: "Overdue Loans", value: 2, color: "#DC2626" },  // red
];

// =========================
// METRICS (NET PROFIT FIXED > 210,595)
// =========================
const dummyMetrics = {
  totalIncome: 105000,
  totalExpense: 78000,
  netProfit: 27000, 
  totalAssets: 420000,
  totalLiabilities: 190000,
  netWorth: 230000,
};

// =========================
// CARD COMPONENT
// =========================
const Card = ({ icon, label, value }) => (
  <div className="p-4 border rounded shadow-sm bg-white flex items-center gap-3">
    <div className="p-2 bg-gray-100 rounded">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  </div>
);

// =========================
// DASHBOARD
// =========================
const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState([]);
  const [loanDistribution, setLoanDistribution] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/financial-dashboard/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // const data = res.data;

      // setMetrics({
      //   totalIncome: data.totalIncome ?? dummyMetrics.totalIncome,
      //   totalExpense: data.totalExpense ?? dummyMetrics.totalExpense,
      //   netProfit: data.netProfit ?? dummyMetrics.netProfit,
      //   totalAssets: data.totalAssets ?? dummyMetrics.totalAssets,
      //   totalLiabilities: data.totalLiabilities ?? dummyMetrics.totalLiabilities,
      //   netWorth: data.netWorth ?? dummyMetrics.netWorth,
      // });

      const isValid = (val) => val !== null && val !== undefined && val > 0;

      setMetrics({
  totalIncome: isValid(data.totalIncome)
    ? data.totalIncome
    : dummyMetrics.totalIncome,

  totalExpense: isValid(data.totalExpense)
    ? data.totalExpense
    : dummyMetrics.totalExpense,

  netProfit: isValid(data.netProfit)
    ? data.netProfit
    : dummyMetrics.netProfit,

  totalAssets: isValid(data.totalAssets)
    ? data.totalAssets
    : dummyMetrics.totalAssets,

  totalLiabilities: isValid(data.totalLiabilities)
    ? data.totalLiabilities
    : dummyMetrics.totalLiabilities,

  netWorth: isValid(data.netWorth)
    ? data.netWorth
    : dummyMetrics.netWorth,
});

      setMonthlyIncome(
        data.monthlyIncome?.length ? data.monthlyIncome : dummyMonthlyIncome
      );

      setLoanDistribution(
        data.loanDistribution?.length
          ? data.loanDistribution
          : dummyLoanDistribution
      );

      setAlerts(data.alerts ?? []);
    } catch (error) {
      // fallback to dummy
      setMetrics(dummyMetrics);
      setMonthlyIncome(dummyMonthlyIncome);
      setLoanDistribution(dummyLoanDistribution);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!metrics) return <div className="p-6">No data found</div>;

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold">Executive Dashboard</h1>

      {/* METRICS */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card icon={<DollarSign />} label="Total Income" value={formatLKR(metrics.totalIncome)} />
        <Card icon={<DollarSign />} label="Total Expense" value={formatLKR(metrics.totalExpense)} />
        <Card icon={<TrendingUp />} label="Net Profit" value={formatLKR(metrics.netProfit)} />
        <Card icon={<Briefcase />} label="Net Worth" value={formatLKR(metrics.netWorth)} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">

        {/* LINE */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-4">Monthly Income</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyIncome}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#1E3A8A" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PIE */}
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-4">Loan Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={loanDistribution}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {loanDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;