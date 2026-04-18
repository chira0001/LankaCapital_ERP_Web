import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import pb from '@/lib/pocketbaseClient.js';
import { Target, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatLKR = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);

const PerformanceTargetsPage = () => {
  const [currentTarget, setCurrentTarget] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [collectorPerformance, setCollectorPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTargetData();
  }, []);

  const fetchTargetData = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      //HARD CODED DATA 
        const targets = [
        {
          id: "1",
          monthly_target: 500000,
          collected_amount: 320000,
          target_month: "2026-04"
        }
      ];

      const users = [
        { id: "u1", name: "Kasun Perera", email: "kasun@gmail.com" },
        { id: "u2", name: "Nimal Silva", email: "nimal@gmail.com" },
        { id: "u3", name: "Amila Fernando", email: "amila@gmail.com" }
      ];


     /* DB CONNECTION*/
      /*const users = await pb.collection('users').getFullList({
        filter: 'role = "Field Officer"',
        $autoCancel: false
      }); 
      
      const targets = await pb.collection('targets').getFullList({
        filter: `target_month >= "${currentMonth}-01"`,
        sort: '-target_month',
        $autoCancel: false
      });

      ///

      const targets = await pb.collection('targets').getFullList({
        filter: `target_month >= "${currentMonth}-01"`,
        sort: '-target_month'
      });

      const users = await pb.collection('users').getFullList({
        filter: 'role = "Field Officer"'
      });
      ///
      */
      if (targets.length > 0) {
        setCurrentTarget(targets[0]);
      }


      const monthData = [];

        for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        monthData.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            target: Math.floor(Math.random() * 500000 + 200000),
            actual: Math.floor(Math.random() * 400000 + 100000)
        });
        }

setMonthlyData(monthData);

      //AFTER DB CONNECTION, REPLACE WITH REAL DATA
    /*
      const monthData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        
        const monthTargets = await pb.collection('targets').getFullList({
          filter: `target_month >= "${monthStr}-01" && target_month < "${monthStr}-31"`,
          $autoCancel: false
        });

        const target = monthTargets.reduce((sum, t) => sum + (t.monthly_target || 0), 0);
        const collected = monthTargets.reduce((sum, t) => sum + (t.collected_amount || 0), 0);

        monthData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          target: target,
          actual: collected
        });
      }
      setMonthlyData(monthData);

      */
//DB CONNECTION
      /*const users = await pb.collection('users').getFullList({
        filter: 'role = "Field Officer"',
        $autoCancel: false
      });
      

      const performance = await Promise.all(users.map(async (user) => {
        const userTargets = await pb.collection('targets').getFullList({
          filter: `user_id = "${user.id}" && target_month >= "${currentMonth}-01"`,
          $autoCancel: false
        });

        const target = userTargets.reduce((sum, t) => sum + (t.monthly_target || 0), 0);
        const collected = userTargets.reduce((sum, t) => sum + (t.collected_amount || 0), 0);
        const achievement = target > 0 ? (collected / target) * 100 : 0;
*/
        const performance = users.map(user => {
        const target = Math.floor(Math.random() * 300000 + 100000);
        const collected = Math.floor(Math.random() * 300000);
        const achievement = target > 0 ? (collected / target) * 100 : 0;


        return {
          name: user.name || user.email,
          target,
          collected,
          achievement
        };
      });

      setCollectorPerformance(performance);

    } catch (error) {
      console.error('Failed to fetch target data:', error);
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
            <p className="text-gray-600 font-medium">Loading targets...</p>
          </div>
        </div>
      </div>
    );
  }

  const achievement = currentTarget && currentTarget.monthly_target > 0
    ? (currentTarget.collected_amount / currentTarget.monthly_target) * 100
    : 0;

  return (
    <>
      <Helmet>
        <title>Performance & Targets </title>
        <meta name="description" content="Track performance targets and collector achievements." />
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">
        
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Performance & Targets</h1>
              <p className="text-gray-600">Monitor targets and team performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-black" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Monthly Target</p>
                <p className="text-3xl font-bold text-black">
                  {formatLKR(currentTarget?.monthly_target || 0)}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-black" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Collected So Far</p>
                <p className="text-3xl font-bold text-black">
                  {formatLKR(currentTarget?.collected_amount || 0)}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-black" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Achievement</p>
                <p className="text-3xl font-bold text-black">{achievement.toFixed(1)}%</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-bold text-black mb-6">Target vs Actual (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
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
                  <Bar dataKey="target" fill="#9ca3af" name="Target" />
                  <Bar dataKey="actual" fill="#000000" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-black">Collector Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Target</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Collected</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Achievement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {collectorPerformance.map((collector, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-black">{collector.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{formatLKR(collector.target)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-black">{formatLKR(collector.collected)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            collector.achievement >= 100
                              ? 'bg-black text-white border-black'
                              : collector.achievement >= 75
                              ? 'bg-gray-200 text-gray-800 border-gray-300'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {collector.achievement.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {collectorPerformance.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No collector data available</p>
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

export default PerformanceTargetsPage;