import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAPI from '../../api/axiosAPI'

const ReceptionistLoan = () => {

    const [searchCustomer, setSearchCustomer] = useState('');
    const [existCustomer, setExistCustomer] = useState(null);
    const [isEmployee, setIsEmployee] = useState(false);
    const [displayInstallments, setDisplayInstallments] = useState([]);
    const [displayInterestRates, setDisplayInterestRates] = useState([]);

    const [nic, setNic] = useState();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [address, setAddress] = useState();
    const [phoneNumber, setPhoneNumber] = useState();
    const [bank, setBank] = useState();
    const [bankAccount, setBankAccount] = useState();

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCustomerChange = (e) => {
        setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
    };

    const [customerForm, setCustomerForm] = useState({
        nic: '',
        name: '',
        email: '',
        address: '',
        phoneNumber: '',
        bank: '',
        bankAccount: ''
    });

    const [loanForm, setLoanForm] = useState({
        fileNumber: '',
        loanAmount: '',
        interestRate: '',
        documentCharge: '100',
        numberOfInstallments: '',
        customerId: '',
        name: '',
        email: '',
        address: '',
        phoneNumber: '',
        bank: '',
        bankAccount: ''
    });

    const clearLoanForm = () => {
        setLoanForm({
            fileNumber: '',
            loanAmount: '',
            interestRate: '',
            documentCharge: '100',
            numberOfInstallments: '',
            name: '',
            email: '',
            address: '',
            phoneNumber: '',
            bank: '',
            bankAccount: ''
        });
        setSearchCustomer('');
        setExistCustomer(null);
        setIsEmployee(false);
    };

    const checkCustomerExists = async () => {
        if (!searchCustomer.trim()) {
            toast.error('Please enter a customer NIC');
            return;
        }

        try {
            const response = await axiosAPI.get(`/recep/customers/${searchCustomer}`);
            if (response.status === 200) {
                setExistCustomer(response.data);
                setLoanForm(prev => ({
                    ...prev,
                    customerId: response.data.nic,
                    name: '',
                    email: '',
                    address: '',
                    phoneNumber: '',
                    bank: '',
                    bankAccount: ''
                }));
                setIsEmployee(false);
                toast.success('Customer found!');
            }
        } catch (e) {
            console.log(e);
            if (e.response?.status === 404) {
                setExistCustomer(null);
                setIsEmployee(true);
                setLoanForm(prev => ({
                    ...prev,
                    customerId: searchCustomer // Set the searched NIC as customerId
                }));
                toast.info('Customer not found. Please fill in customer details.');
            } else if (e.response?.status === 400) {
                setExistCustomer(null);
                setIsEmployee(false);
                toast.info('Please enter valid NIC.');
            }
            else {
                toast.error('Error checking customer. Please try again.');
            }
        }
    };
    const clearCustomerForm = () => {
        setCustomerForm({
            nic: '',
            name: '',
            email: '',
            address: '',
            phoneNumber: '',
            bank: '',
            bankAccount: ''
        });
    };

    const handleLoanSubmit = async (e) => {
        e.preventDefault();

        if (!loanForm.customerId) {
            toast.error('Please search and select a customer first');
            return;
        }

        if (isEmployee) {
            if (!loanForm.name || !loanForm.address || !loanForm.phoneNumber) {
                toast.error('Please fill in all customer details');
                return;
            }
        }



        try {
            const response = await axiosAPI.post('/recep/loans', loanForm);
            toast.success('Loan created successfully!');
            clearLoanForm();
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message;

                if (status === 409 && message) {
                    toast.error(message);
                } else {
                    toast.error(message || 'Something went wrong');
                }
            } else {
                toast.error('Failed to connect to server');
            }
        }
    };

    const handleLoanChange = (e) => {
        const { name, value } = e.target;
        setLoanForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // const fetchInstallments = async () => {
    //     try {
    //         const response = await axiosAPI.get('/recep/installments');
    //         setDisplayInstallments(response.data);
    //     } catch (e) {
    //         console.log(e);
    //         toast.error('Failed to fetch installment options');
    //     }
    // };
    // const fetchInterestRates = async () => {
    //     try {
    //         const response = await axiosAPI.get('/recep/interestRates');
    //         setDisplayInterestRates(response.data);
    //     } catch (e) {
    //         console.log(e);
    //         toast.error('Failed to fetch interest rates');
    //     }
    // }

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchCustomer.trim().length >= 3) {
                fetchSuggestions();
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [searchCustomer]);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const res = await axiosAPI.get(
                `/recep/customers/search?nic=${searchCustomer}`
            );
            setSuggestions(res.data);
            setShowSuggestions(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    // useEffect(() => {
    //     fetchInterestRates();
    //     fetchInstallments();
    // }, [])

    return (
        <div className='p-3'>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Create New Loan
                    </h1>
                    <p className="text-gray-600">
                        Create new loan accounts and track their progress
                    </p>
                </div>
                <div className='w-fit flex flex-col sm:flex-row sm:items-center gap-2'>
                    <div className='w-1/2 flex flex-col relative'>
                        <div className='flex justify-between items-center gap-4'>
                            <span className='text-sm font-medium whitespace-nowrap text-gray-700'>
                                Search Customer
                            </span>

                            <input
                                type="text"
                                value={searchCustomer}
                                className='border border-gray-300 rounded-lg px-4 py-2 flex-1 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent'
                                placeholder="Enter NIC"
                                onChange={(e) => setSearchCustomer(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            />

                            <button
                                onClick={async () => {
                                    setShowSuggestions(false);
                                    await checkCustomerExists();
                                }}
                                className='bg-blue-600 text-white px-6 py-2 rounded-lg 
                       whitespace-nowrap hover:bg-blue-700 
                       transition-colors shadow-md 
                       disabled:bg-gray-400 disabled:cursor-not-allowed'
                                disabled={!searchCustomer.trim()}
                            >
                                Search
                            </button>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && (
                            <div className="absolute top-full mt-2 w-full bg-white border 
                        border-gray-200 rounded-lg shadow-lg z-50 
                        max-h-60 overflow-y-auto">

                                {loading && (
                                    <div className="px-4 py-2 text-sm text-gray-500">
                                        Searching...
                                    </div>
                                )}

                                {!loading && suggestions.length === 0 && (
                                    <div className="px-4 py-2 text-sm text-gray-500">
                                        No customers found
                                    </div>
                                )}

                                {!loading && suggestions.map((nic, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            setSearchCustomer(nic);
                                            setShowSuggestions(false);
                                        }}
                                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors"
                                    >
                                        <div className="font-medium text-gray-800">
                                            {nic}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='shadow-2xl p-6 mt-6 rounded-2xl'>
                {/* Existing Customer Loans Table */}
                {existCustomer && existCustomer.loans?.length > 0 && (
                    <div className="mb-6 bg-white rounded-xl shadow-lg overflow-hidden">

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {`${existCustomer.name}'s loan details`}
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">

                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                            File <br /> Number
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                            Created <br /> At
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                            Interest
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                            Installments
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                            Installment <br /> Amount
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                            Entered By <br /> (Emp. Id)
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {existCustomer.loans.map((loan, key) => (
                                        <tr
                                            key={loan.fileNumber}
                                            className={`${key % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors text-center`}
                                        >
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap text-center">
                                                {loan.fileNumber}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {new Date(loan.createdAt).toLocaleDateString('en-GB')}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                Rs. {parseFloat(loan.amount).toLocaleString()}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {loan.interestRate}%
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {loan.noOfInstallments}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                Rs. {((parseFloat(loan.amount) * loan.interestRate) / 100.0).toLocaleString()}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {loan.employeeId}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
                                    ${loan.status === "PENDING"
                                                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                                            : loan.status === "REJECTED"
                                                                ? "bg-red-100 text-red-700 border-red-200"
                                                                : loan.status === "APPROVED"
                                                                    ? "bg-green-100 text-green-700 border-green-200"
                                                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                                        }`}
                                                >
                                                    {loan.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>
                )}

                <form onSubmit={handleLoanSubmit}>
                    {loanForm.customerId ?
                        <div className="mb-6 flex items-center gap-3">
                            <span className="text-md text-gray-500">Customer ID:</span>
                            <span className="px-3 py-1 bg-blue-600 text-white text-md font-medium rounded-md">
                                {loanForm.customerId}
                            </span>
                        </div>
                        :
                        ""
                    }
                    <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                        <div className='flex flex-col'>
                            <span className='mb-2 text-sm font-medium text-gray-700'>
                                File Number <span className='text-red-500'>*</span>
                            </span>
                            <input
                                type="text"
                                name="fileNumber"
                                value={loanForm.fileNumber}
                                onChange={handleLoanChange}
                                placeholder="D001"
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent transition-all'
                            />
                        </div>

                        <div className='flex flex-col'>
                            <span className='mb-2 text-sm font-medium text-gray-700'>
                                Loan Amount (LKR) <span className='text-red-500'>*</span>
                            </span>
                            <input
                                type="number"
                                name="loanAmount"
                                value={loanForm.loanAmount}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Allow empty (so user can delete)
                                    if (value === "") {
                                        setLoanForm(prev => ({ ...prev, loanAmount: "" }));
                                        return;
                                    }

                                    // Regex: numbers with optional 2 decimal places
                                    const regex = /^\d+(\.\d{0,2})?$/;

                                    if (regex.test(value)) {
                                        setLoanForm(prev => ({ ...prev, loanAmount: value }));
                                    }
                                }}
                                placeholder="Enter loan amount"
                                min="0"
                                step="0.01"
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    focus:border-transparent transition-all'
                            />
                        </div>

                        {/* <div className='flex flex-col'>
                            <span className='mb-2 text-sm font-medium text-gray-700'>
                                Interest Rate (%) <span className='text-red-500'>*</span>
                            </span>
                            <select
                                name="interestRate"
                                value={loanForm.interestRate}
                                onChange={handleLoanChange}
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent transition-all bg-white'
                            >
                                <option value="">Select Interest Rate</option>
                                {displayInterestRates?.map((displayInterestRate) => (
                                    <option key={displayInterestRate.id} value={displayInterestRate.id}>
                                        {displayInterestRate.rate}%
                                    </option>
                                ))}
                            </select>
                        </div> */}

                        <div className='flex flex-col'>
                            <span className='mb-2 text-sm font-medium text-gray-700'>
                                Interest Rate (%) <span className='text-red-500'>*</span>
                            </span>
                            <input
                                type="number"
                                name="interestRate"
                                value={loanForm.interestRate}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Allow empty (so user can delete)
                                    if (value === "") {
                                        setLoanForm(prev => ({ ...prev, interestRate: "" }));
                                        return;
                                    }

                                    // Regex: numbers with optional 2 decimal places
                                    const regex = /^\d+(\.\d{0,2})?$/;

                                    if (regex.test(value)) {
                                        setLoanForm(prev => ({ ...prev, interestRate: value }));
                                    }
                                }}
                                placeholder='%'
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent transition-all'
                            />
                        </div>

                        <div className='flex flex-col'>
                            <span className='mb-2 text-sm font-medium text-gray-700'>
                                Document Charges <span className='text-red-500'>*</span>
                            </span>
                            <input
                                type="number"
                                name="documentCharge"
                                value={loanForm.documentCharge}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Allow empty (so user can delete)
                                    if (value === "") {
                                        setLoanForm(prev => ({ ...prev, documentCharge: "" }));
                                        return;
                                    }

                                    // Regex: numbers with optional 2 decimal places
                                    const regex = /^\d+(\.\d{0,2})?$/;

                                    if (regex.test(value)) {
                                        setLoanForm(prev => ({ ...prev, documentCharge: value }));
                                    }
                                }}
                                placeholder="100"
                                min="0"
                                step="1"
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent transition-all'
                            />
                        </div>

                        <div className='flex flex-col'>
                            <span className='mb-2 text-sm font-medium text-gray-700'>
                                Number of Installments <span className='text-red-500'>*</span>
                            </span>
                            <input
                                type="number"
                                name="numberOfInstallments"
                                value={loanForm.numberOfInstallments}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Allow empty for backspace
                                    if (value === "") {
                                        setLoanForm(prev => ({ ...prev, numberOfInstallments: "" }));
                                        return;
                                    }

                                    // Allow only positive whole numbers
                                    const regex = /^[1-9]\d*$/;

                                    if (regex.test(value)) {
                                        setLoanForm(prev => ({
                                            ...prev,
                                            numberOfInstallments: value
                                        }));
                                    }
                                }}
                                min="1"
                                step="1"
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    focus:border-transparent transition-all'
                            />
                        </div>

                        {/* <div className='flex flex-col'>
                            <span className='mb-2 text-sm font-medium text-gray-700'>
                                Number of Installments <span className='text-red-500'>*</span>
                            </span>
                            <select
                                name="numberOfInstallments"
                                value={loanForm.numberOfInstallments}
                                onChange={handleLoanChange}
                                required
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent transition-all bg-white'
                            >
                                <option value="">Select Installments</option>
                                {displayInstallments?.map((displayInstallment) => (
                                    <option key={displayInstallment.id} value={displayInstallment.id}>
                                        {displayInstallment.value} installments
                                    </option>
                                ))}
                            </select>
                        </div> */}

                    </div>

                    {/* New Customer Details Section */}
                    {isEmployee && (
                        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                                New Customer Details
                            </h3>

                            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="flex flex-col">
                                    <span className="mb-2 text-sm font-medium text-gray-700">
                                        Customer Name <span className="text-red-500">*</span>
                                    </span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={loanForm.name}
                                        onChange={handleLoanChange}
                                        placeholder="Enter customer name"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <span className="mb-2 text-sm font-medium text-gray-700">
                                        Customer Email (Optional)
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={loanForm.email}
                                        onChange={handleLoanChange}
                                        placeholder="customer@example.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <span className="mb-2 text-sm font-medium text-gray-700">
                                        Customer Address <span className="text-red-500">*</span>
                                    </span>
                                    <input
                                        type="text"
                                        name="address"
                                        value={loanForm.address}
                                        onChange={handleLoanChange}
                                        placeholder="Enter customer address"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <span className="mb-2 text-sm font-medium text-gray-700">
                                        Customer Phone Number <span className="text-red-500">*</span>
                                    </span>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={loanForm.phoneNumber}
                                        onChange={handleLoanChange}
                                        placeholder="07XXXXXXXX"
                                        pattern="[0-9]{10}"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Divider */}
                                <div className="md:col-span-2 border-t border-gray-200 my-2"></div>

                                <div className="flex flex-col">
                                    <span className="mb-2 text-sm font-medium text-gray-700">
                                        Bank Account Number (Optional)
                                    </span>
                                    <input
                                        type="text"
                                        name="bankAccount"
                                        value={loanForm.bankAccount}
                                        onChange={handleLoanChange}
                                        placeholder="Enter bank account number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <span className="mb-2 text-sm font-medium text-gray-700">
                                        Bank Name (Optional)
                                    </span>
                                    <input
                                        type="text"
                                        name="bank"
                                        value={loanForm.bank}
                                        onChange={handleLoanChange}
                                        placeholder="Enter bank name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='w-full flex justify-end gap-4 mt-6'>
                        <button
                            type="button"
                            onClick={clearLoanForm}
                            className='border border-gray-400 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors'
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            className='bg-blue-600 text-white px-6 py-2 rounded-lg w-full md:w-fit hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
                            disabled={!loanForm.customerId}
                        >
                            Create Loan
                        </button>
                    </div>
                </form>
            </div>
        </div >
    )
}

export default ReceptionistLoan