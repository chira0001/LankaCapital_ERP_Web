import React, { useState, useEffect } from 'react';

import { CheckCircle, XCircle, Filter } from 'lucide-react';
import { Button } from '@/component/ui/button';
import { Input } from '@/component/ui/input';
import { Label } from '@/component/ui/label';
import { Textarea } from '@/component/ui/textarea';
//import { useToast } from '@/hooks/use-toast';
//import { useAuth } from '@/contexts/AuthContext.jsx';

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

const formatLKR=(amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
const LoanApplication = () => {
    const toast = useToast();//temporary stub- replace with actual toast hook
    const currentEmployeeId = 3;
    const [applicationData, setApplicationData] = useState([]);
    const[filteredApps, setFilteredApps] = useState([]);
    const[loading, setLoading] = useState(true);
    const[selectedApp, setSelectedApp] = useState(null);
    const [actionType,setActionType] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [rejectionNote, setRejectionNote] = useState("");
    const[filters, setFilters] = useState({
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
  applyFilters();
}, [filters, applicationData]);

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

    // FETCH LOANS FROM BACKEND 
  const fetchApplications = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/loans');
      const data = await res.json();

      console.log("RAW API DATA:", data);

      if (!Array.isArray(data)) {
        console.error("Backend did not return an array:", data);

        setApplicationData([]);
        setFilteredApps([]);
        return;
      }


      const normalized = data.map(app => ({
        ...app,
       // status: (app.status ?? '').toUpperCase() // can use after backend fixed as prnding all
      // status: (app.status || 'PENDING').trim().toUpperCase()
      status: (app.status && app.status.trim() !== '' 
            ? app.status 
            : 'PENDING').toUpperCase()
      }));

      console.log("NORMALIZED DATA:", normalized);

      setApplicationData(normalized);
      setFilteredApps(normalized);

     // setApplicationData(data);
     // setFilteredApps(data); // IMPORTANT FIX
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };
 


  const applyFilters = () => {
    let filtered = [...applicationData];

    if (filters.status !== 'ALL') {
      filtered = filtered.filter(app =>
        (app.status || '').toUpperCase() === filters.status
      );
    }

    if (filters.search) {
      filtered = filtered.filter(app =>
        app.customer?.businessName
          ?.toLowerCase()
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
      filtered = filtered.filter(app =>
        Number(app.amount) >= Number(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(app =>
        Number(app.amount) <= Number(filters.maxAmount)
      );
    }

    setFilteredApps(filtered);
  };


  const handleAction = (app, action) => {
    console.log("SELECTED APP FULL OBJECT:", app);
    setSelectedApp(app);
    setActionType(action);
    setRejectionNote('');
    setShowDialog(true);
  };

const confirmAction = async () => {

  console.log("SELECTED APP:", selectedApp);
  console.log("FILE NUMBER:", selectedApp?.fileNumber);
  console.log("ACTION TYPE:", actionType);


  if (!selectedApp) {
    return;
  }

  if (actionType === 'reject' && !rejectionNote.trim()) {
    toast({
      title: 'Error',
      description: 'Rejection note is required',
      variant: 'destructive'
    });
    return;
  }

  try {
    let response;

    if (actionType === 'approve') {
        response = await fetch('http://localhost:8080/api/v1/admin/approve', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileNumber: selectedApp.fileNumber,
            employeeId: currentEmployeeId
          })
        });
      } 
      else if (actionType === 'reject') {
        response = await fetch('http://localhost:8080/api/v1/admin/reject', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileNumber: selectedApp.fileNumber,
            rejectionNote: rejectionNote,
            employeeId: currentEmployeeId
          })
        });
      } 
      else if (actionType === 'reset') {
        response = await fetch('http://localhost:8080/api/v1/admin/reset', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileNumber: selectedApp.fileNumber,
            employeeId: currentEmployeeId
          })
        });
      }

    if (!response.ok) {
      throw new Error('Failed to update application');
    }

    const updatedLoan = await response.json();
    console.log("UPDATED LOAN:", updatedLoan);


await fetchApplications();

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
    setRejectionNote('');
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

 /* const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-gray-100 text-gray-700 border-gray-200',
      APPROVED: 'bg-black text-white border-black',
      REJECTED: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[status] || styles.PENDING;
  };
*/
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
      

      <div className="flex min-h-screen bg-gray-50 w-full overflow-x-hidde">
        {/*  <Sidebar /> */}
        
        <div className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Loan Applications</h1>
              <p className="text-gray-600">Review and approve pending loan applications</p>
            </div>

                      {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-black">Filters</h3>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                {/* STATUS FILTER */}
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

                {/* CUSTOMER SEARCH */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Customer Name</Label>
                  <Input
                    placeholder="Search by name"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="w-full bg-gray-50 border-gray-300 text-black"
                  />
                </div>

                    {/* LOAN ID SEARCH */}
                  <div className="space-y-2">
                    <Label className="text-gray-700">Loan ID</Label>

                    <Input
                      placeholder="Search by Loan ID"
                      value={filters.loanId}
                      onChange={(e) =>
                        setFilters({ ...filters, loanId: e.target.value })
                      }
                      className="w-full bg-gray-50 border-gray-300 text-black"
                    />
                  </div>

                {/* MIN AMOUNT */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Min Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, minAmount: e.target.value })
                    }
                    className="w-full bg-gray-50 border-gray-300 text-black"
                  />
                </div>

                {/* MAX AMOUNT */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Max Amount</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={filters.maxAmount}
                    onChange={(e) =>
                      setFilters({ ...filters, maxAmount: e.target.value })
                    }
                    className="w-full bg-gray-50 border-gray-300 text-black"
                  />
                </div>

              </div>

              {/* Optional Reset Button */}
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      status: "ALL",
                      search: "",
                      loanId: "",
                      minAmount: "",
                      maxAmount: ""
                    })
                  }
                >
                  Reset Filters
                </Button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto scrollbar-hide" >
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Loan ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Applicant</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Interest</th>
                       
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Employee Id</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApps.map((app) => {
                      console.log("APP DATA:", app);
                      return (
                        <tr key={app.fileNumber} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-mono text-sm text-gray-600">{app.fileNumber.slice(0, 8)}</p>
                          </td>
                          <td className="px-6 py-4">
                          <p className="font-medium text-black truncate max-w-[140px]">{app.customer?.businessName}</p>
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
                          {app.status?.toUpperCase() === 'REJECTED' && app.rejectionNote && (
                            <p className="text-xs text-red-600 mt-1 max-w-[150px] truncate" title={app.rejectionNote}>
                              {app.rejectionNote}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {app.employeeId || '1'}
                          </p>
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
                      );
                    })}
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
              Are you sure you want to {actionType} the loan application for {selectedApp?.customer?.businessName}?
              {actionType === 'approve' && ` Amount: ${formatLKR(selectedApp?.amount || 0)}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {actionType === 'reject' && (
            <div className="my-4">
              <Label htmlFor="reason" className="mb-2 block text-black">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
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