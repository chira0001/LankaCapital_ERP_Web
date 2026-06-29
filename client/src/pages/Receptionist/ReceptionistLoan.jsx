import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAPI from '../../api/axiosAPI'

const ReceptionistLoan = () => {

    const [searchCustomer, setSearchCustomer] = useState('');
    const [existCustomer, setExistCustomer] = useState(null);
    const [isEmployee, setIsEmployee] = useState(false);                                 //------
    const [displayInstallments, setDisplayInstallments] = useState([]);
    const [displayInterestRates, setDisplayInterestRates] = useState([]);

    const [nic, setNic] = useState();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [address, setAddress] = useState();
    const [phoneNumber, setPhoneNumber] = useState();
    const [bank, setBank] = useState();
    const [bankAccount, setBankAccount] = useState();

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
        documentCharge: '',
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
            documentCharge: '',
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
            if (!loanForm.name || !loanForm.email || !loanForm.address || !loanForm.phoneNumber) {
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

    const fetchInstallments = async () => {
        try {
            const response = await axiosAPI.get('/recep/installments');
            setDisplayInstallments(response.data);
        } catch (e) {
            console.log(e);
            toast.error('Failed to fetch installment options');
        }
    };
    const fetchInterestRates = async () => {
        try {
            const response = await axiosAPI.get('/recep/interestRates');
            setDisplayInterestRates(response.data);
        } catch (e) {
            console.log(e);
            toast.error('Failed to fetch interest rates');
        }
    }


    useEffect(() => {
        fetchInterestRates();
        fetchInstallments();
    }, [])
    return (
        <div>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className='flex justify-between items-start mb-8'>
                <h1 className='text-4xl font-bold text-center md:text-left'>Create New Loan</h1>
                <div className='w-1/2 flex justify-between items-center gap-4'>
                    <span className='text-sm font-medium whitespace-nowrap'>Search Customer</span>
                    <input
                        type="text"
                        value={searchCustomer}
                        className='border border-gray-400 rounded-lg px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-black'
                        placeholder="Enter NIC"
                        onChange={(e) => setSearchCustomer(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && checkCustomerExists()}
                    />
                    <button
                        onClick={checkCustomerExists}
                        className='bg-black text-white px-6 py-2 rounded-lg whitespace-nowrap hover:bg-gray-800 transition-colors'
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Existing Customer Loans Table */}
            {existCustomer && existCustomer.loans?.length > 0 && (
                <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
                    <h2 className='text-lg font-semibold mb-3'>{`${existCustomer.name}'s loan details`}</h2>
                    <table className='table-auto border border-gray-300 bg-white'>
                        <thead>
                            <tr className='bg-gradient-to-r from-zinc-500 to-zinc-600 text-white'>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold whitespace-nowrap'>
                                    File Number
                                </th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold whitespace-nowrap'>
                                    Created At
                                </th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold whitespace-nowrap'>
                                    Amount
                                </th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold whitespace-nowrap'>
                                    Interest
                                </th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold whitespace-nowrap'>
                                    Installments
                                </th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold whitespace-nowrap'>
                                    Installment<br />Amount
                                </th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold whitespace-nowrap'>
                                    Entered By <br /> (Emp. Id)
                                </th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold whitespace-nowrap'>
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {existCustomer.loans.map((loan, key) => (
                                <tr
                                    key={loan.fileNumber}
                                    className={`${key % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                        } hover:bg-blue-50 transition-colors`}
                                >
                                    <td className='border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap'>
                                        {loan.fileNumber}
                                    </td>

                                    <td className='border border-gray-300 px-3 py-2 font-medium whitespace-nowrap'>
                                        {new Date(loan.createdAt).toLocaleDateString('en-GB')}
                                    </td>

                                    <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600 whitespace-nowrap'>
                                        Rs. {parseFloat(loan.amount).toLocaleString()}
                                    </td>

                                    <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600 whitespace-nowrap'>
                                        {loan.interestRate}%
                                    </td>

                                    <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600 whitespace-nowrap'>
                                        {loan.noOfInstallments}
                                    </td>

                                    <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600 whitespace-nowrap'>
                                        Rs. {((parseFloat(loan.amount) * loan.interestRate) / 100.0).toLocaleString()}
                                    </td>

                                    <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600 whitespace-nowrap'>
                                        {loan.employeeId}
                                    </td>

                                    <td
                                        className={`border border-gray-300 px-3 py-2 text-sm font-semibold whitespace-nowrap
                                            ${loan.status === "PENDING"
                                                ? "text-yellow-600"
                                                : loan.status === "REJECTED"
                                                    ? "text-red-600"
                                                    : loan.status === "APPROVED"
                                                        ? "text-green-600"
                                                        : "text-gray-600"
                                            }`}
                                    >
                                        {loan.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <form onSubmit={handleLoanSubmit}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                    <div className='flex flex-col'>
                        <span className='mb-1 text-sm font-medium'>
                            Customer ID <span className='text-red-500'>*</span>
                        </span>
                        <input
                            type="text"
                            name="customerId"
                            value={loanForm.customerId}
                            onChange={handleLoanChange}
                            className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black bg-gray-50'
                            placeholder="Customer NIC"
                            readOnly
                            required
                        />
                    </div>
                    <div className='flex flex-col'>
                        <span className='mb-1 text-sm font-medium'>
                            File Number <span className='text-red-500'>*</span>
                        </span>
                        <input
                            type="text"
                            name="fileNumber"
                            value={loanForm.fileNumber}
                            onChange={handleLoanChange}
                            className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black'
                            placeholder="D001"
                            required
                        />
                    </div>

                    <div className='flex flex-col'>
                        <span className='mb-1 text-sm font-medium'>
                            Loan Amount (LKR) <span className='text-red-500'>*</span>
                        </span>
                        <input
                            type="number"
                            name="loanAmount"
                            value={loanForm.loanAmount}
                            onChange={handleLoanChange}
                            className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black'
                            placeholder="Enter loan amount"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className='flex flex-col'>
                        <span className='mb-1 text-sm font-medium'>
                            Interest Rate (%) <span className='text-red-500'>*</span>
                        </span>
                        <select
                            name="interestRate"
                            value={loanForm.interestRate}
                            onChange={handleLoanChange}
                            className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black'
                            required
                        >
                            <option value="">Select Interest Rate</option>
                            {displayInterestRates?.map((displayInterestRate) => (
                                <option key={displayInterestRate.id} value={displayInterestRate.id}>
                                    {displayInterestRate.rate}%
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='flex flex-col'>
                        <span className='mb-1 text-sm font-medium'>
                            Document Charges <span className='text-red-500'>*</span>
                        </span>
                        <input
                            type="number"
                            name="documentCharge"
                            value={loanForm.documentCharge}
                            onChange={handleLoanChange}
                            className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black'
                            placeholder="100"
                            min="0"
                            step="1"
                            required
                        />
                    </div>
                    <div className='flex flex-col'>
                        <span className='mb-1 text-sm font-medium'>
                            Number of Installments <span className='text-red-500'>*</span>
                        </span>
                        <select
                            name="numberOfInstallments"
                            value={loanForm.numberOfInstallments}
                            onChange={handleLoanChange}
                            className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black'
                            required
                        >
                            <option value="">Select Installments</option>
                            {displayInstallments?.map((displayInstallment) => (
                                <option key={displayInstallment.id} value={displayInstallment.id}>
                                    {displayInstallment.value} installments
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* New Customer Details Section */}
                {isEmployee && (
                    <div className='mt-4 p-6 rounded-2xl shadow-lg bg-gray-50 border border-gray-300'>
                        <h3 className='text-lg font-semibold mb-4 text-yellow-800'>
                            New Customer Details
                        </h3>
                        <div className='relative grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>
                                    Customer Name <span className='text-red-500'>*</span>
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    value={loanForm.name}
                                    onChange={handleLoanChange}
                                    className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black bg-white'
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>
                                    Customer Email <span className='text-red-500'>*</span>
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={loanForm.email}
                                    onChange={handleLoanChange}
                                    className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black bg-white'
                                    placeholder="customer@example.com"
                                    required
                                />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>
                                    Customer Address <span className='text-red-500'>*</span>
                                </span>
                                <input
                                    type="text"
                                    name="address"
                                    value={loanForm.address}
                                    onChange={handleLoanChange}
                                    className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black bg-white'
                                    placeholder="Enter customer address"
                                    required
                                />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>
                                    Customer Phone Number <span className='text-red-500'>*</span>
                                </span>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={loanForm.phoneNumber}
                                    onChange={handleLoanChange}
                                    className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black bg-white'
                                    placeholder="07XXXXXXXX"
                                    pattern="[0-9]{10}"
                                    required
                                />
                            </div>
                            <hr />
                            <hr />
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>
                                    Bank Account Number (Optional)
                                </span>
                                <input
                                    type="text"
                                    name="bankAccount"
                                    value={loanForm.bankAccount}
                                    onChange={handleLoanChange}
                                    className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black bg-white'
                                    placeholder="Enter bank account number"
                                    required
                                />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>
                                    Bank Name (Optional)
                                </span>
                                <input
                                    type="text"
                                    name="bank"
                                    value={loanForm.bank}
                                    onChange={handleLoanChange}
                                    className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black bg-white'
                                    placeholder="Enter bank name"
                                    required
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
                        className='bg-black text-white px-6 py-2 rounded-lg w-full md:w-fit hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
                        disabled={!loanForm.customerId}
                    >
                        Create Loan
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ReceptionistLoan