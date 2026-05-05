import React, { useState, useEffect } from 'react';
//import Sidebar from '@/components/AdminSidebar/AdminSidebar.jsx';
//import pb from '@/lib/pocketbaseClient.js';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { Textarea } from '@/component/ui/textarea';
//import { useToast } from '@/hooks/use-toast';
//import { useAuth } from '@/contexts/AuthContext.jsx';
//import Sidebar from '../../components/AdminSidebar/AdminSidebar.jsx';


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


// Temporary stub for toast-need to change after implementing the actual toast system
const useToast = () => {
  return (toast) => console.log("Toast:", toast);
};

const formatLKR=(amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
const LoanApplication = () => {
    const toast = useToast();//temporary stub- replace with actual toast hook
    const [applicationData, setApplicationData] = useState([]);
    const[filteredApps, setFilteredApps] = useState([]);
    const[loading, setLoading] = useState(true);
    const[selectedApp, setSelectedApp] = useState(null);
    const [actionType,setActionType] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const[filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        minAmount: "",
        maxAmount: "",
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    

    useEffect(() => {
        applyFilters();
    }, [applicationData, filters]);

    /*const fetchApplications = async () => {
        try {
         const apps =await pb.collection('loan_applications').getFullList({
            sort:'-request_date',
            $autoCancel: false
         });
         setApplications(apps);
        } catch (error) {
            console.error("Error fetching applications:", error);
        TransformStream({
            title: "Error",
            description :"Failed to load applications:",
            variant: "destructive"
        });
        } finally {
            setLoading(false);      

        }
    };

    */

    // ✅ FETCH FROM BACKEND (NO DUMMY DATA)
  const fetchApplications = async () => {
    try {
      const res = await fetch('http://localhost:8080/loans');
      const data = await res.json();

      setApplicationData(data);
      setFilteredApps(data); // IMPORTANT FIX
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };
  /*

    const fetchApplications = async () => {
      const apps = [
        {
          id: "1",
          applicant_name: "John Doe",
          phone: "0771234567",
          requested_amount: 50000,
          duration_months: 12,
          interest_rate: 5,
          risk_level: "Low",
          status: "Pending",
          request_date: "2026-03-17",
          rejection_reason: ""
        },
        {
          id: "2",
          applicant_name: "Jane Smith",
          phone: "0779876543",
          requested_amount: 100000,
          duration_months: 24,
          interest_rate: 7,
          risk_level: "High",
          status: "Approved",
          request_date: "2026-03-15",
          rejection_reason: ""
        }
      ];

      setApplicationData(apps);  // sets the table data
      setLoading(false);          // stop the loading spinner
    };
    */


     const applyFilters = () => {
    let filtered = [...applicationData];

    if (filters.startDate) {
      filtered = filtered.filter(app => app.request_date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(app => app.request_date <= filters.endDate);
    }
    if (filters.minAmount) {
      filtered = filtered.filter(app => app.requested_amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(app => app.requested_amount <= parseFloat(filters.maxAmount));
    }

    setFilteredApps(filtered);
  };

  const handleAction = (app, action) => {
    setSelectedApp(app);
    setActionType(action);
    setRejectionReason('');
    setShowDialog(true);
  };

const confirmAction = async () => {
  if (!selectedApp) {
    return;
  }

  if (actionType === 'reject' && !rejectionReason.trim()) {
    toast({
      title: 'Error',
      description: 'Rejection reason is required',
      variant: 'destructive'
    });
    return;
  }

  try {
    let response;

    if (actionType === 'approve') {
      response = await fetch('http://localhost:8080/loans/approve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileNumber: selectedApp.fileNumber
        })
      });
    } else {
      response = await fetch('http://localhost:8080/loans/reject', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileNumber: selectedApp.fileNumber,
          rejectionNote: rejectionReason
        })
      });
    }

    if (!response.ok) {
      throw new Error('Failed to update application');
    }

    const updatedLoan = await response.json();

    setApplicationData(prev =>
      prev.map(app =>
        app.fileNumber === selectedApp.fileNumber
          ? {
              ...app,
              status: updatedLoan.status,
              rejection_reason: updatedLoan.rejectionNote || ''
            }
          : app
      )
    );

    toast({
      title: 'Success',
      description: `Application ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Failed to update application:', error);
    toast({
      title: 'Error',
      description: 'Failed to update application',
      variant: 'destructive'
    });
  } finally {
    setShowDialog(false);
    setSelectedApp(null);
    setActionType(null);
    setRejectionReason('');
  }
};

  const getRiskBadge = (risk) => {
    const styles = {
      Low: 'bg-gray-100 text-gray-700 border-gray-200',
      Medium: 'bg-gray-200 text-gray-800 border-gray-300',
      High: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[risk] || styles.Medium;
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-gray-100 text-gray-700 border-gray-200',
      Approved: 'bg-black text-white border-black',
      Rejected: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[status] || styles.Pending;
  };

  if (loading) {
    return (
      <div className="flex">
      {/*  <Sidebar /> */}
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
      

      <div className="flex min-h-screen bg-gray-50">
        {/*  <Sidebar /> */}
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Loan Applications</h1>
              <p className="text-gray-600">Review and approve pending loan applications</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-black">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div>
                  <Label className="text-gray-700 mb-2 block">Min Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                    className="bg-gray-50 border-gray-300 text-black"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 mb-2 block">Max Amount</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                    className="bg-gray-50 border-gray-300 text-black"
                  />
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Loan ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Applicant</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Interest</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Risk</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Request Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApps.map((app) => (
                      <tr key={app.fileNumber} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-gray-600">{app.fileNumber.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-black">{app.applicant_name}</p>
                          <p className="text-sm text-gray-500">{app.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-black">{formatLKR(app.requested_amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{app.duration_months} months</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{app.interest_rate}%</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskBadge(app.risk_level)}`}>
                            {app.risk_level || 'Medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                          {app.status === 'Rejected' && app.rejection_reason && (
                            <p className="text-xs text-red-600 mt-1 max-w-[150px] truncate" title={app.rejection_reason}>
                              {app.rejection_reason}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {new Date(app.request_date).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {app.status === 'Pending' && (
                          //&& currentUser?.role === 'Director' && (
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} the loan application for {selectedApp?.applicant_name}?
              {actionType === 'approve' && ` Amount: ${formatLKR(selectedApp?.requested_amount || 0)}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {actionType === 'reject' && (
            <div className="my-4">
              <Label htmlFor="reason" className="mb-2 block text-black">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
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