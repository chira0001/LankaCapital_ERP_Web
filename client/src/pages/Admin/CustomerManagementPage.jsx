import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
//import pb from '@/lib/pocketbaseClient.js';
import { Search, User, Phone, Mail, MapPin } from 'lucide-react';
import { Input } from '@/component/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/component/ui/dialog';

const formatLKR = (amount) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);

const CustomerManagementPage = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [borrowerLoans, setBorrowerLoans] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [borrowers, searchTerm]);

  const fetchBorrowers = async () => {
    try {
      const data = await pb.collection('borrowers').getFullList({
        sort: '-created_date',
        $autoCancel: false
      });
      setBorrowers(data);
    } catch (error) {
      console.error('Failed to fetch borrowers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...borrowers];

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone?.includes(searchTerm)
      );
    }

    setFilteredBorrowers(filtered);
  };

  const viewBorrowerDetails = async (borrower) => {
    setSelectedBorrower(borrower);
    
    try {
      const loans = await pb.collection('loans').getFullList({
        filter: `borrower_id = "${borrower.id}"`,
        $autoCancel: false
      });
      setBorrowerLoans(loans);
    } catch (error) {
      console.error('Failed to fetch borrower loans:', error);
      setBorrowerLoans([]);
    }
    
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="flex">
       
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customer Management - LendPro</title>
        <meta name="description" content="Manage borrower information and view loan history." />
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">
       
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">Customer Management</h1>
              <p className="text-gray-600">Manage borrower information and loan history</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 bg-gray-50 border-gray-300 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBorrowers.map((borrower) => (
                <div
                  key={borrower.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => viewBorrowerDetails(borrower)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black">{borrower.name}</h3>
                      <p className="text-sm text-gray-500">ID: {borrower.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {borrower.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{borrower.email}</span>
                      </div>
                    )}
                    {borrower.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{borrower.phone}</span>
                      </div>
                    )}
                    {borrower.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{borrower.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredBorrowers.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No customers found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          
          {selectedBorrower && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-black">{selectedBorrower.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-black">{selectedBorrower.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-black">{selectedBorrower.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aadhar Number</p>
                  <p className="font-medium text-black">{selectedBorrower.aadhar_number || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-medium text-black">{selectedBorrower.address || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-black mb-3">Loan History</h4>
                {borrowerLoans.length > 0 ? (
                  <div className="space-y-2">
                    {borrowerLoans.map((loan) => (
                      <div key={loan.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-black">{formatLKR(loan.amount)}</p>
                            <p className="text-sm text-gray-600">
                              {loan.interest_rate}% • {loan.duration_months} months
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            loan.status === 'Active'
                              ? 'bg-gray-200 text-black border-gray-300'
                              : loan.status === 'Overdue'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            {loan.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No loan history</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerManagementPage;