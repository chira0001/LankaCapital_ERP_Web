import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import Sidebar from '@/component/Sidebar.jsx';
//import pb from '@/lib/pocketbaseClient.js';
import { Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/component/ui/input';

const formatLKR = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);

const PortfolioOverviewPage = () => {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [summary, setSummary] = useState({
    totalValue: 0,
    activeCount: 0,
    convertedCount: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('amount');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [loans, searchTerm, sortField, sortOrder]);

  const fetchLoans = async () => {
    try {

        //  HARDCODED DATA
    const loansData = [
      {
        id: "LN001",
        amount: 50000,
        interest_rate: 12,
        status: "Active",
        due_date: "2026-05-20",
        expand: {
          borrower_id: { name: "Kamal Perera" }
        }
      },
      {
        id: "LN002",
        amount: 75000,
        interest_rate: 10,
        status: "Overdue",
        due_date: "2026-04-10",
        expand: {
          borrower_id: { name: "Nimal Silva" }
        }
      },
      {
        id: "LN003",
        amount: 30000,
        interest_rate: 15,
        status: "Converted",
        due_date: "2026-03-01",
        expand: {
          borrower_id: { name: "Sunil Fernando" }
        }
      }
    ];


{/*
    // Replace with actual API call
      const loansData = await pb.collection('loans').getFullList({
        expand: 'borrower_id',
        $autoCancel: false
      });
*/}

        // Mock data for testing
      setLoans(loansData);

      const totalValue = loansData.reduce((sum, loan) => sum + loan.amount, 0);
      const activeCount = loansData.filter(l => l.status === 'Active').length;
      const convertedCount = loansData.filter(l => l.status === 'Converted').length;

      setSummary({ totalValue, activeCount, convertedCount });
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...loans];

    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.expand?.borrower_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'borrower_id') {
        aVal = a.expand?.borrower_id?.name || '';
        bVal = b.expand?.borrower_id?.name || '';
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredLoans(filtered);
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-gray-200 text-black border-gray-300',
      Overdue: 'bg-red-100 text-red-700 border-red-200',
      Converted: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return styles[status] || styles.Active;
  };

  if (loading) {
    return (
      <div className="flex">
        {/* <Sidebar /> */}
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Portfolio Overview - LendPro</title>
        <meta name="description" content="View and manage your complete loan portfolio with detailed insights." />
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">
       {/* <Sidebar />*/}
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Portfolio Overview</h1>
              <p className="text-gray-600">Complete view of your loan portfolio</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Portfolio Value</p>
                <p className="text-3xl font-bold text-black">{formatLKR(summary.totalValue)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Active Loans</p>
                <p className="text-3xl font-bold text-black">{summary.activeCount}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Converted Loans</p>
                <p className="text-3xl font-bold text-gray-600">{summary.convertedCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by borrower name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 bg-gray-50 border-gray-300 text-black"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Loan ID</th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-bold text-black cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleSort('borrower_id')}
                      >
                        <div className="flex items-center gap-2">
                          Borrower Name
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-bold text-black cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleSort('amount')}
                      >
                        <div className="flex items-center gap-2">
                          Amount
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Interest Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Status</th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-bold text-black cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleSort('due_date')}
                      >
                        <div className="flex items-center gap-2">
                          Due Date
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-gray-600">{loan.id.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-black">
                            {loan.expand?.borrower_id?.name || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-black">{formatLKR(loan.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{loan.interest_rate}%</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(loan.status)}`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {new Date(loan.due_date).toLocaleDateString()}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLoans.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No loans found</p>
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

export default PortfolioOverviewPage;