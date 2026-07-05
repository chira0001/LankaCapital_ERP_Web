import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Calendar, Filter } from 'lucide-react';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';

const formatLKR = (amount) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
  }).format(amount || 0);

const RevenueTrackingPage = () => {
  const [todayCollection, setTodayCollection] = useState(0);
  const [weeklyCollection, setWeeklyCollection] = useState(0);

  const [installments, setInstallments] = useState([]);
  const [filteredInstallments, setFilteredInstallments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  // ===============================
  // FETCH DATA FROM BACKEND
  // ===============================
  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const summaryRes = await axios.get(
        "http://localhost:8080/api/v1/admin/revenue/summary",
        config
      );

      const tableRes = await axios.get(
        "http://localhost:8080/api/v1/admin/revenue/collections",
        config
      );

      setTodayCollection(summaryRes.data.today || 0);
      setWeeklyCollection(summaryRes.data.week || 0);

      setInstallments(tableRes.data);
      setFilteredInstallments(tableRes.data);

    } catch (error) {
      console.error("Revenue API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  // ===============================
  // FILTER LOGIC
  // ===============================
  useEffect(() => {
    applyFilters();
  }, [installments, filters]);

  const applyFilters = () => {
    let filtered = [...installments];

    if (filters.startDate) {
      filtered = filtered.filter(
        (inst) =>
          inst.paidAt &&
          new Date(inst.paidAt) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (inst) =>
          inst.paidAt &&
          new Date(inst.paidAt) <= new Date(filters.endDate + "T23:59:59")
      );
    }

    setFilteredInstallments(filtered);
  };

  // ===============================
  // RESET FILTERS (FIX ADDED)
  // ===============================
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: ''
    });

    setFilteredInstallments(installments);
  };

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return <div className="p-6">Loading revenue data...</div>;
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Revenue Tracking
          </h1>
          <p className="text-gray-600">
            Monitor daily collections and installment payments
          </p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between mb-4">
              <DollarSign className="w-6 h-6 text-black" />
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-600">Today's Collection</p>
            <p className="text-2xl font-bold text-black">
              {formatLKR(todayCollection)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between mb-4">
              <DollarSign className="w-6 h-6 text-black" />
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-600">Weekly Collection</p>
            <p className="text-2xl font-bold text-black">
              {formatLKR(weeklyCollection)}
            </p>
          </div>

        </div>

        {/* FILTERS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">

          <div className="flex items-center justify-between mb-4">

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold">Filter Transactions</h3>
            </div>

            {/* RESET BUTTON */}
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Reset
            </button>

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

          <div className="p-6 border-b">
            <h3 className="font-bold text-lg">
              Transaction History
            </h3>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">Loan ID</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Officer</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Installment</th>
                </tr>
              </thead>

              <tbody>
                {filteredInstallments.map((inst) => (
                  <tr key={inst.fileNumber} className="border-t">

                    <td className="px-6 py-4 font-mono text-sm">
                      {inst.fileNumber}
                    </td>

                    <td className="px-6 py-4">
                      {inst.customerName}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {formatLKR(inst.paidAmount)}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {inst.officerName}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {inst.paidAt
                        ? new Date(inst.paidAt).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {inst.installmentNumber}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

            {filteredInstallments.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No transactions found
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default RevenueTrackingPage;