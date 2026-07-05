import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { Textarea } from '@/component/ui/textarea';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/component/ui/select';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/component/ui/alert-dialog';

const useToast = () => {
  return (toast) => console.log("Toast:", toast);
};

const formatLKR = (amount) =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);

// Same explicit-token pattern as RevenueTrackingPage.jsx
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const BASE_URL = "http://localhost:8080/api/v1";

const LoanApplication = () => {
  const toast = useToast();
  const currentEmployeeId = 3;

  const [applicationData, setApplicationData] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");
  const [filters, setFilters] = useState({
    status: "ALL",
    search: "",
    loanId: "",
    minAmount: "",
    maxAmount: "",
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    const filtered = applyFilters(applicationData, filters);
    setFilteredApps(filtered);
  }, [filters, applicationData]);

  // FETCH LOANS FROM BACKEND
  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/loans`, getAuthConfig());
      const data = res.data;

      console.log("RAW API DATA:", data);

      setApplicationData(data);
      const filtered = applyFilters(data, filters);
      setFilteredApps(filtered);
    } catch (error) {
      console.error("Error fetching applications:", error);
      if (error.response?.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'Your session may have expired. Please log in again.',
          variant: 'destructive'
        });
      }
      setApplicationData([]);
      setFilteredApps([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data, filters) => {
    let filtered = [...data];

    if (filters.status !== "ALL") {
      filtered = filtered.filter(
        app => (app.status || "").toUpperCase() === filters.status
      );
    }

    if (filters.search) {
      filtered = filtered.filter(app =>
        (app.customerId ?? '')
          .toString()
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      );
    }

    if (filters.loanId) {
      filtered = filtered.filter(app =>
        app.fileNumber
          ?.toLowerCase()
          .includes(filters.loanId.toLowerCase())
      );
    }

    if (filters.minAmount) {
      filtered = filtered.filter(
        app => Number(app.amount) >= Number(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(
        app => Number(app.amount) <= Number(filters.maxAmount)
      );
    }

    return filtered;
  };

  const handleAction = (app, action) => {
    setSelectedApp(app);
    setActionType(action);
    setDecisionNote('');
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedApp) return;

    if (actionType === 'approve' && !decisionNote.trim()) {
      toast({
        title: 'Error',
        description: 'Decision note is required',
        variant: 'destructive'
      });
      return; // dialog stays open, nothing sent yet
    }

    try {
      setLoading(true);
      const config = getAuthConfig();

      if (actionType === 'approve') {
        await axios.put(`${BASE_URL}/admin/approve`, {
          fileNumber: selectedApp.fileNumber,
          employeeId: currentEmployeeId,
          decisionNote: decisionNote
        }, config);
      } else if (actionType === 'reject') {
        await axios.put(`${BASE_URL}/admin/reject`, {
          fileNumber: selectedApp.fileNumber,
          decisionNote: decisionNote,
          employeeId: currentEmployeeId
        }, config);
      } else if (actionType === 'reset') {
        await axios.put(`${BASE_URL}/admin/reset`, {
          fileNumber: selectedApp.fileNumber,
          employeeId: currentEmployeeId
        }, config);
      }

      const res = await axios.get(`${BASE_URL}/admin/loans`, config);
      setApplicationData(res.data);
      setFilteredApps(applyFilters(res.data, filters));

      toast({
        title: 'Success',
        description: `Application ${actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'reset'} successfully`
      });
    } catch (error) {
      console.error('Failed to update application:', error);
      const status = error.response?.status;
      toast({
        title: 'Error',
        description:
          status === 403
            ? 'Access denied — check your login session or permissions.'
            : 'Failed to update application',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setShowDialog(false);
      setSelectedApp(null);
      setActionType(null);
      setDecisionNote('');
    }
  };

  const getStatusBadge = (status) => {
    const normalized = (status ?? '').toUpperCase();
    const styles = {
      PENDING: 'bg-gray-100 text-gray-700 border-gray-200',
      APPROVED: 'bg-black text-white border-black',
      REJECTED: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[normalized] || styles.PENDING;
  };

  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-50 w-full overflow-x-hidde">
        <div className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Loan Applications</h1>
              <p className="text-gray-600">Review and approve pending loan applications</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-black">Filters</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger className="w-full bg-gray-50 border-gray-300 text-black">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Applicant NIC</Label>
                  <Input
                    placeholder="Search by NIC"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full bg-gray-50 border-gray-300 text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Loan ID</Label>
                  <Input
                    placeholder="Search by Loan ID"
                    value={filters.loanId}
                    onChange={(e) => setFilters({ ...filters, loanId: e.target.value })}
                    className="w-full bg-gray-50 border-gray-300 text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Min Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                    className="w-full bg-gray-50 border-gray-300 text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Max Amount</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                    className="w-full bg-gray-50 border-gray-300 text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({ status: "ALL", search: "", loanId: "", minAmount: "", maxAmount: "" })
                  }
                >
                  Reset Filters
                </Button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto scrollbar-hide">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Loan ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Applicant NIC</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Interest</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Employee Id</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApps.map((app) => (
                      <tr key={app.fileNumber} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-gray-600">{app.fileNumber?.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-black truncate max-w-[140px]">{app.customerId}</p>
                          <p className="text-sm text-gray-500">{app.customer?.contactNumber}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-black">{formatLKR(app.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{app.noOfInstallments ?? app.numberOfInstallments?.value}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{app.interestRate}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                            {(app.status || '').toUpperCase()}
                          </span>
                          {app.status?.toUpperCase() === 'APPROVED' && app.decisionNote && (
                            <p className="text-xs text-green-600 mt-1 max-w-[150px] truncate" title={app.decisionNote}>
                              {app.decisionNote}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{app.employeeId || '1'}</p>
                        </td>
                        <td className="px-6 py-4">
                          {(app.status || '').toUpperCase() === 'PENDING' ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAction(app, 'approve')}
                                className="bg-black hover:bg-gray-800 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAction(app, 'reject')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(app, 'reset')}
                              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                            >
                              Reset
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredApps.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No applications found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Application' : actionType === 'reject' ? 'Reject Application' : 'Reset Application'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} the loan application for {selectedApp?.customerId}?
              {actionType === 'approve' && ` Amount: ${formatLKR(selectedApp?.amount || 0)}`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {actionType === 'approve' && (
            <div className="my-4">
              <Label htmlFor="reason" className="mb-2 block text-black">Decision Note</Label>
              <Textarea
                id="reason"
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Please provide a reason for the decision..."
                className="w-full border-gray-300 text-black"
                rows={3}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={actionType === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-black hover:bg-gray-800 text-white'}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LoanApplication;