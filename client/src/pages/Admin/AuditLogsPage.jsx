import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import pb from '@/lib/pocketbaseClient.js';
import { Shield, Filter } from 'lucide-react';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/select';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    actionType: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  /* FETCH LOGS */
  const fetchLogs = async () => {
    try {

      /* HARD CODE DATA*/
      const data = [
        {
          id: "1",
          timestamp: "2026-04-18T10:30:00",
          action: "User logged in",
          action_type: "Login",
          entity_type: "User",
          ip_address: "192.168.1.1",
          expand: {
            user_id: {
              name: "Admin User",
              email: "admin@gmail.com"
            }
          }
        },
        {
          id: "2",
          timestamp: "2026-04-18T11:00:00",
          action: "Loan approved",
          action_type: "Approval",
          entity_type: "Loan",
          ip_address: "192.168.1.2",
          expand: {
            user_id: {
              name: "Manager",
              email: "manager@gmail.com"
            }
          }
        },
        {
          id: "3",
          timestamp: "2026-04-18T12:15:00",
          action: "Customer updated",
          action_type: "Modification",
          entity_type: "Customer",
          ip_address: "192.168.1.3",
          expand: {
            user_id: {
              name: "Officer",
              email: "officer@gmail.com"
            }
          }
        }
      ];

      setLogs(data);

      /*DATABASE VERSION */
      /*
      const data = await pb.collection('audit_logs').getFullList({
        expand: 'user_id',
        sort: '-timestamp',
        $autoCancel: false
      });

      setLogs(data);
      */

    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  /*APPLY FILTERS*/
  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filters.endDate);
    }

    if (filters.actionType !== 'all') {
      filtered = filtered.filter(log => log.action_type === filters.actionType);
    }

    setFilteredLogs(filtered);
  };

  /* BADGE COLORS*/
  const getActionTypeBadge = (type) => {
    const styles = {
      Login: 'bg-blue-100 text-blue-700 border-blue-200',
      Approval: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Modification: 'bg-amber-100 text-amber-700 border-amber-200',
      Report: 'bg-purple-100 text-purple-700 border-purple-200',
      Other: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return styles[type] || styles.Other;
  };

  /*LOADING SCREEN*/
  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  /*UI*/
  return (
    <>
      <Helmet>
        <title>Audit Logs - LendPro</title>
        <meta name="description" content="View system audit trail and user activity logs." />
      </Helmet>

      <div className="flex min-h-screen bg-slate-50">
        <div className="flex-1 overflow-auto">
          <div className="p-8">

            {/* HEADER */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Logs</h1>
              <p className="text-slate-600">Complete audit trail of system activities</p>
            </div>

            {/* FILTERS */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-900">Filters</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <Label className="text-slate-700 mb-2 block">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="bg-slate-50 border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <Label className="text-slate-700 mb-2 block">End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="bg-slate-50 border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <Label className="text-slate-700 mb-2 block">Action Type</Label>
                  <Select
                    value={filters.actionType}
                    onValueChange={(val) => setFilters({ ...filters, actionType: val })}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Login">Login</SelectItem>
                      <SelectItem value="Approval">Approval</SelectItem>
                      <SelectItem value="Modification">Modification</SelectItem>
                      <SelectItem value="Report">Report</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">

                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Timestamp</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">User</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Action</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Entity</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">IP Address</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">

                        <td className="px-6 py-4">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-400" />
                          {log.expand?.user_id?.name || log.expand?.user_id?.email || 'System'}
                        </td>

                        <td className="px-6 py-4">{log.action}</td>

                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs border ${getActionTypeBadge(log.action_type)}`}>
                            {log.action_type}
                          </span>
                        </td>

                        <td className="px-6 py-4">{log.entity_type}</td>

                        <td className="px-6 py-4 font-mono">{log.ip_address}</td>

                      </tr>
                    ))}
                  </tbody>

                </table>

                {filteredLogs.length === 0 && (
                  <div className="text-center py-10 text-slate-500">
                    No audit logs found
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

export default AuditLogsPage;