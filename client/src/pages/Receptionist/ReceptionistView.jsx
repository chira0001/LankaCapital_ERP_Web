import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAPI from '../../api/axiosAPI'

const ReceptionistView = () => {
    const rowsPerPage = 5;

    const [currentPage, setCurrentPage] = useState(1);


    const [searchCustomer, setSearchCustomer] = useState('');
    const [searchFileNumber, setSearchFileNumber] = useState('');
    const [existCustomer, setExistCustomer] = useState(null);
    const [isEmployee, setIsEmployee] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [infoDetails, setInfoDetails] = useState([]);
    const [highlightTimeout, setHighlightTimeout] = useState(null);

    const [loanDetails, setLoanDetails] = useState([]);
    const [showLoanModal, setShowLoanModal] = useState(false);

    const [infoForm, setInfoForm] = useState({
        businessName: '',
        businessAddress: '',
        businessEmail: '',
        contactNumber: '',
        bank: '',
        bankAccount: '',
        customerId: null // Add this to track customer ID
    });

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (highlightTimeout) {
                clearTimeout(highlightTimeout);
            }
        };
    }, [highlightTimeout]);

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setInfoForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const checkFileNumberExists = () => {
        if (!searchFileNumber.trim()) {
            toast.error('Please enter a file number');
            return;
        }

        const foundLoan = infoDetails.find(
            loan => loan.fileNumber.toLowerCase() === searchFileNumber.toLowerCase()
        );

        if (foundLoan) {
            toast.success('Loan file found!');
            const element = document.getElementById(`loan-${foundLoan.fileNumber}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('highlight-loan');

                // Clear previous timeout
                if (highlightTimeout) {
                    clearTimeout(highlightTimeout);
                }

                // Set new timeout
                const timeout = setTimeout(() => {
                    element.classList.remove('highlight-loan');
                }, 2000);
                setHighlightTimeout(timeout);
            }
        } else {
            toast.error('File number not found');
        }
    };

    const saveCustomer = async () => {
        // Validation
        if (!infoForm.businessName.trim()) {
            toast.error('Business name is required');
            return;
        }

        if (!infoForm.contactNumber.trim()) {
            toast.error('Contact number is required');
            return;
        }

        // Email validation (if provided)
        if (infoForm.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(infoForm.businessEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            const payload = {
                nic: infoForm.customerId || existCustomer?.customerId,
                name: infoForm.businessName,
                email: infoForm.businessEmail || '',
                address: infoForm.businessAddress || '',
                phoneNumber: infoForm.contactNumber,
                bank: infoForm.bank || '',
                bankAccount: infoForm.bankAccount || '',
            };

            console.log("Updating customer:", payload);
            console.log("104 : ", infoForm.customerId || existCustomer?.customerId)
            const response = await axiosAPI.put("/recep/customers", payload, {
                params: {
                    customerId: infoForm.customerId || existCustomer?.customerId
                }
            });
            console.log("110 : ", response)
            if (response.status === 200) {
                toast.success("Customer successfully updated");

                // Update form with response data
                setInfoForm(prev => ({
                    ...prev,
                    businessName: response.data.name || prev.businessName,
                    businessAddress: response.data.address || prev.businessAddress,
                    businessEmail: response.data.email || prev.businessEmail,
                    contactNumber: response.data.phoneNumber || prev.contactNumber,
                    customerId: response.data.customerId || prev.customerId,
                    bank: response.data.bank || prev.bank,
                    bankAccount: response.data.bankAccount || prev.bankAccount,
                }));

                // Update existCustomer state
                setExistCustomer(prev => ({
                    ...prev,
                    ...response.data
                }));

                setIsEdit(false);
            }
        } catch (error) {
            console.error("Error updating customer:", error);

            if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Invalid customer data');
            } else if (error.response?.status === 404) {
                toast.error('Customer not found');
            } else {
                toast.error('Failed to update customer. Please try again.');
            }
        }
    };

    const handleCancelEdit = () => {
        // Restore original data
        if (existCustomer) {
            setInfoForm({
                businessName: existCustomer.businessName || '',
                businessAddress: existCustomer.businessAddress || '',
                businessEmail: existCustomer.businessEmail || '',
                contactNumber: existCustomer.contactNumber || '',
                customerId: existCustomer.customerId || null,
                bank: existCustomer.bank || '',
                bankAccount: existCustomer.bankAccount || ''
            });
        }
        setIsEdit(false);
    };

    const checkCustomerExists = async () => {
        if (!searchCustomer.trim()) {
            toast.error('Please enter a customer NIC');
            return;
        }

        // NIC validation (basic)
        if (searchCustomer.trim().length < 9) {
            toast.error('Please enter a valid NIC');
            return;
        }

        try {
            const response = await axiosAPI.get(`/recep/customers/loans/${searchCustomer}`);

            if (response.status === 200) {
                setExistCustomer(response.data);
                setInfoForm({
                    businessName: response.data.businessName || '',
                    businessAddress: response.data.businessAddress || '',
                    businessEmail: response.data.businessEmail || '',
                    contactNumber: response.data.contactNumber || '',
                    customerId: response.data.customerNIC || null,
                    bank: response.data.bank || '',
                    bankAccount: response.data.bankAccount || ''
                });
                setInfoDetails(response.data.loans || []);
                setIsEmployee(false);
                setIsEdit(false); // Reset edit mode
                toast.success('Customer found!');
            }
        } catch (error) {
            console.error("Error checking customer:", error);

            if (error.response?.status === 404) {
                setExistCustomer(null);
                setIsEmployee(true);
                setInfoForm({
                    businessName: '',
                    businessAddress: '',
                    businessEmail: '',
                    contactNumber: '',
                    bank: '',
                    bankAccount: '',
                    customerId: searchCustomer
                });
                setInfoDetails([]);
                toast.info('Customer not found.');
            } else if (error.response?.status === 400) {
                setExistCustomer(null);
                setIsEmployee(false);
                toast.error('Please enter a valid NIC.');
            } else {
                toast.error('Error checking customer. Please try again.');
            }
        }
    };

    const calculateInterest = (amount, rate) => {
        const principal = parseFloat(amount) || 0;
        const rateValue = parseFloat(rate) || 0;
        return (principal * rateValue) / 100;
    };

    const calculateInstallment = (amount, rate, installments) => {
        const principal = parseFloat(amount) || 0;
        const interest = calculateInterest(amount, rate);
        const totalAmount = principal + interest;
        const numInstallments = parseFloat(installments) || 1;
        return totalAmount / numInstallments;
    };

    const formatCurrency = (value) => {
        return parseFloat(value || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const viewLoanDetails = async (fileNumber) => {
        try {
            const response = await axiosAPI.get(`/recep/loan/collection/${fileNumber}`);
            setLoanDetails(response.data);
            setShowLoanModal(true);
        } catch (error) {
            if (error.response?.status === 404) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to load loan details");
            }
        }
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = loanDetails.slice(indexOfFirstRow, indexOfLastRow);

    const totalPages = Math.ceil(loanDetails.length / rowsPerPage);

    return (
        <div className="p-3">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header Section */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        View Customer
                    </h1>
                    <p className="text-gray-600">
                        Access and review customer information
                    </p>
                </div>
                <div className='w-fit flex flex-col sm:flex-row sm:items-center gap-2'>
                    <span className='text-sm font-medium whitespace-nowrap text-gray-700'>Search Customer</span>
                    <input
                        type="text"
                        value={searchCustomer}
                        className='border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder="Enter NIC"
                        onChange={(e) => setSearchCustomer(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && checkCustomerExists()}
                    />
                    <button
                        onClick={checkCustomerExists}
                        className='bg-blue-600 text-white px-6 py-2 rounded-lg whitespace-nowrap hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed'
                        disabled={!searchCustomer.trim()}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Edit Button */}
            {existCustomer && (
                <div className='w-full flex justify-end gap-4 mb-6'>
                    {isEdit ? (
                        <div className='flex gap-2'>
                            <button
                                onClick={handleCancelEdit}
                                className='bg-gray-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-md'
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                                Cancel
                            </button>
                            <button
                                onClick={saveCustomer}
                                className='bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors shadow-md'
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                Save
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEdit(true)}
                            className='bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors shadow-md'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 21h14c1.1 0 2-.9 2-2v-7h-2v7H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2"></path>
                                <path d="M7 13v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l9-9a.996.996 0 0 0 0-1.41l-3-3a.996.996 0 0 0-1.41 0l-9.01 8.99A1 1 0 0 0 7 13m10-7.59L18.59 7 17.5 8.09 15.91 6.5zm-8 8 5.5-5.5 1.59 1.59-5.5 5.5H9z"></path>
                            </svg>
                            Edit
                        </button>
                    )}
                </div>
            )}

            {/* Customer Information Form */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">

                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Customer Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">
                            Customer NIC <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="customerNic"
                            value={infoForm.customerId || existCustomer?.customerId}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                           bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">
                            Business Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="businessName"
                            value={infoForm.businessName}
                            onChange={handleInfoChange}
                            readOnly={!isEdit}
                            required
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent transition-all
                    ${isEdit
                                    ? "bg-white"
                                    : "bg-gray-100 text-gray-600 cursor-not-allowed"
                                }`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">
                            Business Address
                        </label>
                        <input
                            type="text"
                            name="businessAddress"
                            value={infoForm.businessAddress}
                            onChange={handleInfoChange}
                            readOnly={!isEdit}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent transition-all
                    ${isEdit
                                    ? "bg-white"
                                    : "bg-gray-100 text-gray-600 cursor-not-allowed"
                                }`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">
                            Business Email
                        </label>
                        <input
                            type="email"
                            name="businessEmail"
                            value={infoForm.businessEmail}
                            onChange={handleInfoChange}
                            readOnly={!isEdit}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent transition-all
                    ${isEdit
                                    ? "bg-white"
                                    : "bg-gray-100 text-gray-600 cursor-not-allowed"
                                }`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">
                            Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="contactNumber"
                            value={infoForm.contactNumber}
                            onChange={handleInfoChange}
                            readOnly={!isEdit}
                            required
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent transition-all
                    ${isEdit
                                    ? "bg-white"
                                    : "bg-gray-100 text-gray-600 cursor-not-allowed"
                                }`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">
                            Bank Name
                        </label>
                        <input
                            type="text"
                            name="bank"
                            value={infoForm.bank}
                            onChange={handleInfoChange}
                            readOnly={!isEdit}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent transition-all
                    ${isEdit
                                    ? "bg-white"
                                    : "bg-gray-100 text-gray-600 cursor-not-allowed"
                                }`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">
                            Bank Account Number
                        </label>
                        <input
                            type="text"
                            name="bankAccount"
                            value={infoForm.bankAccount}
                            onChange={handleInfoChange}
                            readOnly={!isEdit}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent transition-all
                    ${isEdit
                                    ? "bg-white"
                                    : "bg-gray-100 text-gray-600 cursor-not-allowed"
                                }`}
                        />
                    </div>

                </div>
            </div>

            {/* Loan Information Section */}
            {existCustomer && (
                <div className='bg-white rounded-xl shadow-lg p-6'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                        <h2 className='text-xl font-semibold text-gray-800 border-b pb-2'>Loan Information</h2>
                        <div className='w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2'>
                            <span className='text-sm font-medium whitespace-nowrap text-gray-700'>Search File Number</span>
                            <input
                                type="text"
                                value={searchFileNumber}
                                className='border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                placeholder="File Number"
                                onChange={(e) => setSearchFileNumber(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && checkFileNumberExists()}
                            />
                            <button
                                onClick={checkFileNumberExists}
                                className='bg-blue-600 text-white px-6 py-2 rounded-lg whitespace-nowrap hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed'
                                disabled={!searchFileNumber.trim()}
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {infoDetails.length > 0 ? (
                        <div className='flex flex-col gap-4 max-h-96 overflow-y-auto pr-2'>
                            {infoDetails.map((infoDetail, key) => {
                                const interestAmount = calculateInterest(infoDetail.amount, infoDetail.interestRate);
                                const totalLoan = parseFloat(infoDetail.amount || 0) + interestAmount;
                                const installmentAmount = calculateInstallment(
                                    infoDetail.amount,
                                    infoDetail.interestRate,
                                    infoDetail.noOfInstallments
                                );

                                return (
                                    <div
                                        key={key}
                                        id={`loan-${infoDetail.fileNumber}`}
                                        className='border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-gray-50 to-white loan-card'
                                        onClick={() => viewLoanDetails(infoDetail.fileNumber)}
                                    >
                                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-gray-500 font-medium uppercase'>File Number</span>
                                                <span className='text-base font-semibold text-gray-800'>{infoDetail.fileNumber}</span>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-gray-500 font-medium uppercase'>Created At</span>
                                                <span className='text-base font-semibold text-gray-800'>
                                                    {new Date(infoDetail.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-gray-500 font-medium uppercase'>Loan Amount</span>
                                                <span className='text-base font-semibold text-blue-600'>
                                                    Rs. {formatCurrency(infoDetail.amount)}
                                                </span>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-gray-500 font-medium uppercase'>Interest Rate</span>
                                                <span className='text-base font-semibold text-gray-800'>{infoDetail.interestRate}%</span>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-gray-500 font-medium uppercase'>No. of Installments</span>
                                                <span className='text-base font-semibold text-gray-800'>{infoDetail.noOfInstallments}</span>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-gray-500 font-medium uppercase'>Installment Amount</span>
                                                <span className='text-lg font-bold text-purple-600'>
                                                    Rs. {formatCurrency(installmentAmount)}
                                                </span>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-gray-500 font-medium uppercase'>Interest Amount</span>
                                                <span className='text-base font-semibold text-orange-600'>
                                                    Rs. {formatCurrency(interestAmount)}
                                                </span>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-gray-500 font-medium uppercase'>Total Loan</span>
                                                <span className='text-base font-semibold text-green-600'>
                                                    Rs. {formatCurrency(totalLoan)}
                                                </span>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-gray-500 font-medium uppercase'>Status</span>
                                                <span className={`text-base font-semibold 
                                                    ${infoDetail.status === "PENDING"
                                                        ? "text-yellow-600"
                                                        : infoDetail.status === "REJECTED"
                                                            ? "text-red-600"
                                                            : infoDetail.status === "APPROVED"
                                                                ? "text-green-600"
                                                                : "text-gray-600"
                                                    }
                                                    `}>
                                                    {infoDetail.status}
                                                </span>
                                            </div>
                                            {infoDetail.rejectionNote ?
                                                <div className='flex flex-col col-span-4 border border-gray-300 p-3 rounded-lg'>
                                                    <span className='text-xs text-gray-500 font-medium uppercase'>Rejection Note</span>
                                                    <span className='text-md text-red-500'>
                                                        {infoDetail.rejectionNote}
                                                    </span>
                                                </div> :
                                                ""
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className='text-center py-12 text-gray-500'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className='text-lg font-medium'>No loan records found</p>
                        </div>
                    )}

                    {showLoanModal && (
                        <div className="fixed h-full inset-0 backdrop-blur-xs flex items-center justify-center z-50 border border-white/30 rounded-2xl shadow-2xl">
                            {/* <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative"> */}
                            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">

                                {/* Close */}
                                <button
                                    onClick={() => setShowLoanModal(false)}
                                    className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg"
                                >
                                    ✕
                                </button>

                                <h2 className="text-xl font-bold mb-4">Loan Payment Details</h2>

                                <div className="max-h-150 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    {currentRows.map((value) => (
                                        <div
                                            key={value.id}
                                            className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            {/* Header Section */}
                                            <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
                                                        <span className="text-xl font-bold text-gray-700">
                                                            {value.installmentNumber}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                            Installment
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-600">
                                                            Payment #{value.installmentNumber}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Badge/Status indicator (optional) */}
                                                <div className="px-3 py-1 bg-green-50 rounded-full">
                                                    <span className="text-xs font-semibold text-green-600">Paid</span>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Amount - Emphasized */}
                                                <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100">
                                                    <div className="flex items-baseline gap-2">
                                                        <div className="flex-1">
                                                            <p className="text-xs font-medium text-gray-500 mb-1">
                                                                Amount Paid
                                                            </p>
                                                            <p className="text-2xl font-bold text-gray-800">
                                                                Rs. {formatCurrency(value.paidAmount)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Date & Time */}
                                                <div className="flex items-start gap-2">
                                                    <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 mb-1">
                                                            Payment Date & Time
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-700">
                                                            {new Date(value.paidAt).toLocaleDateString('en-US', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {new Date(value.paidAt).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Entered By */}
                                                <div className="flex items-start gap-2">
                                                    <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 mb-1">
                                                            Processed By
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-700">
                                                            {value.employeeId}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">

                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition 
                ${currentPage === 1
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                Previous
                                            </button>

                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: totalPages }, (_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentPage(index + 1)}
                                                        className={`flex items-center justify-center w-9 h-9 text-sm rounded-lg transition
                                                            ${currentPage === index + 1
                                                                ? "bg-gray-800 text-white"
                                                                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                                            }`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() =>
                                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                                }
                                                disabled={currentPage === totalPages}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition 
                ${currentPage === totalPages
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                Next
                                            </button>

                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* <style jsx>{`
                .highlight-loan {
                    animation: highlight 2s ease-in-out;
                }

                @keyframes highlight {
                    0%, 100% {
                        background: linear-gradient(to right, rgb(249 250 251), white);
                    }
                    50% {
                        background: linear-gradient(to right, rgb(254 249 195), rgb(254 240 138));
                        transform: scale(1.02);
                    }
                }

                .loan-card {
                    transition: all 0.3s ease;
                }
            `}</style> */}
        </div>
    );
};

export default ReceptionistView;