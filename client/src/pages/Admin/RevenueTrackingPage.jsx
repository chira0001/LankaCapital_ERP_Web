import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import pb from '@/lib/pocketbaseClient.js';
import { DollarSign, Calendar, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';

const formatLKR = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);

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

  useEffect(() => {
    fetchRevenueData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [installments, filters]);

  const fetchRevenueData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      // Today's collection
      const todayTrans = await pb.collection('transactions').getFullList({
        filter: `payment_date >= "${today} 00:00:00" && status = "Paid"`,
        $autoCancel: false
      });
      const todayTotal = todayTrans.reduce((sum, t) => sum + t.amount, 0);
      setTodayCollection(todayTotal);

      // Weekly collection
      const weekTrans = await pb.collection('transactions').getFullList({
        filter: `payment_date >= "${weekAgoStr} 00:00:00" && status = "Paid"`,
        $autoCancel: false
      });
      const weekTotal = weekTrans.reduce((sum, t) => sum + t.amount, 0);
      setWeeklyCollection(weekTotal);

      // Fetch all installments
      const allInstallments = await pb.collection('transactions').getFullList({
        expand: 'borrower_id,loan_id,field_officer_id',
        sort: '-payment_date',
        $autoCancel: false
      });
      setInstallments(allInstallments);

    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...installments];

    if (filters.startDate) {
      filtered = filtered.filter(inst => inst.payment_date && inst.payment_date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(inst => inst.payment_date && inst.payment_date <= filters.endDate + 'T23:59:59');
    }

    setFilteredInstallments(filtered);
  };

  if (loading) {
    return (
      <div className="flex">
       {/* <Sidebar /> */}
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading revenue data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Revenue Tracking - LendPro</title>
        <meta name="description" content="Track daily and weekly revenue collections and installment status." />
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">
       {/* <Sidebar />*/}
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Revenue Tracking</h1>
              <p className="text-gray-600">Monitor daily collections and installment payments</p>
            </div>

            {/* Collection Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-black" />
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Today's Collection</p>
                <p className="text-3xl font-bold text-black">{formatLKR(todayCollection)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-black" />
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Weekly Collection</p>
                <p className="text-3xl font-bold text-black">{formatLKR(weeklyCollection)}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-black">Filter Transactions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                <div>
                  <Label className="text-gray-700 mb-2 block">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="bg-gray-50 border-gray-300 text-black"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 mb-2 block">End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="bg-gray-50 border-gray-300 text-black"
                  />
                </div>
              </div>
            </div>

            {/* Installments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-black">Transaction History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Loan ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Borrower Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Amount (LKR)</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Field Officer Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Collection Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInstallments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-gray-600">{inst.loan_id.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-black">
                            {inst.expand?.borrower_id?.name || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-black">{formatLKR(inst.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">
                            {inst.expand?.field_officer_id?.name || inst.expand?.field_officer_id?.email || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {inst.payment_date ? new Date(inst.payment_date).toLocaleDateString() : '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {inst.status === 'Paid' ? (
                            <div className="flex items-center gap-2 text-black">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Paid</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600">
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Unpaid</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredInstallments.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No transaction data available</p>
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

export default RevenueTrackingPage;