import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import axiosAPI from '@/api/axiosAPI';
import { UserCheck } from 'lucide-react';

const formatLKR = (amount) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount || 0);

const FieldOfficerPerformancePage = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [dateParam, setDateParam] = useState({
    startDate: getToday(),
    endDate: getToday(),
  });

  useEffect(() => {
    fetchDailyCollectionDetails();
  }, []);

  const fetchDailyCollectionDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosAPI.get('/admin/dailyCollections', {
        params: {
          startDate: dateParam.startDate,
          endDate: dateParam.endDate,
        },
      });

      setPerformanceData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setPerformanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const groupedByOfficer = useMemo(() => {
    return performanceData.reduce((acc, item) => {
      const officerId = item?.enteredBy?.id || 'Unknown';

      if (!acc[officerId]) {
        acc[officerId] = {
          officerInfo: item?.enteredBy,
          records: [],
        };
      }

      acc[officerId].records.push(item);

      return acc;
    }, {});
  }, [performanceData]);

  return (
    <>
      <Helmet>
        <title>Field Officer Performance - LendPro</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">

          {/* Header */}
          <div>
            <h1 className="mb-2 text-2xl font-bold text-black sm:text-3xl">
              Field Officer Collections
            </h1>
            <p className="text-gray-600">
              View collection records grouped by Field Officer
            </p>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow sm:flex-row sm:items-end sm:gap-4 sm:p-4 lg:gap-6 lg:p-6">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateParam.startDate}
                onChange={(e) =>
                  setDateParam((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
                className="border rounded px-3 py-2 mt-1"
              />
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateParam.endDate}
                onChange={(e) =>
                  setDateParam((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
                className="border rounded px-3 py-2 mt-1"
              />
            </div>

            <button
              onClick={fetchDailyCollectionDetails}
              className="w-full rounded bg-black px-5 py-2 text-white sm:w-auto"
            >
              Search
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading collections...</p>
            </div>
          ) : Object.keys(groupedByOfficer).length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No collection data available
            </div>
          ) : (
            Object.entries(groupedByOfficer).map(([officerId, data]) => (
              <div
                key={officerId}
                className="bg-white rounded-xl shadow border overflow-hidden"
              >
                {/* Officer Header */}
                <div className="p-6 border-b bg-gray-50 flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-bold text-lg">
                      {data.officerInfo?.firstName} {data.officerInfo?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Officer ID: {officerId} | Email:{' '}
                      {data.officerInfo?.email}
                    </p>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-bold">
                          File Number
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold">
                          Installment No
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold">
                          Due Amount
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold">
                          Paid Amount
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold">
                          Paid At
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold">
                          Customer
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.records.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-3">
                            {record.loan?.fileNumber}
                          </td>
                          <td className="px-6 py-3">
                            {record.installmentNumber}
                          </td>
                          <td className={`px-6 py-3 ${record.dueAmount < 0 ? "text-red-400" : "text-gray-500"}`}>
                            {formatLKR(record.dueAmount)}
                          </td>
                          <td className="px-6 py-3 text-green-600 font-semibold">
                            {formatLKR(record.paidAmount)}
                          </td>
                          <td className="px-6 py-3">
                            {new Date(record.paidAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-3">
                            {record.loan?.customer?.name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default FieldOfficerPerformancePage;