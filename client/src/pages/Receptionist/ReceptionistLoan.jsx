import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAPI from '../../api/axiosAPI'

const ReceptionistLoan = () => {

    const empId = 3 || localStorage.getItem("empId");


    const [searchCustomer, setSearchCustomer] = useState('');
    const [existCustomer, setExistCustomer] = useState(null);
    const [isEmployee, setIsEmployee] = useState(false);
    const [displayInstallments, setDisplayInstallments] = useState([]);

    const [nic, setNic] = useState();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [address, setAddress] = useState();
    const [phoneNumber, setPhoneNumber] = useState();

    const handleCustomerChange = (e) => {
        setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
    };

    const [customerForm, setCustomerForm] = useState({
        nic: '',
        name: '',
        email: '',
        address: '',
        phoneNumber: ''
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
        employeeId: empId
    });

    const checkCustomerExists = async () => {
        // Add validation for empty search
        if (!searchCustomer.trim()) {
            toast.error('Please enter a customer NIC');
            return;
        }

        try {
            const response = await axiosAPI.get(`/customers/${searchCustomer}`);
            console.log(response);

            if (response.status === 200) {
                setExistCustomer(response.data);
                setLoanForm(prev => ({
                    ...prev,
                    customerId: response.data.nic,
                    // Clear customer details fields when existing customer is found
                    name: '',
                    email: '',
                    address: '',
                    phoneNumber: ''
                }));
                setIsEmployee(false);
                toast.success('Customer found!');
            }
        } catch (e) {
            console.log(e);
            // Handle 404 or customer not found
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
                phoneNumber: ''
            });
        };
const submitCustomer = async (e) => {
        e.preventDefault();
        console.log('Customer Data:', customerForm);
        try {
            const response = await axiosAPI.post('/customers', customerForm);
            if (response.status == 201) {
                alert('Customer added successfully')
            } else {
                alert('Customer not added successfully!');
                console.log(response.data)
            }
        } catch (e) {
            console.log(e);
        }
    };
    const handleLoanSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!loanForm.customerId) {
            toast.error('Please search and select a customer first');
            return;
        }

        if (isEmployee) {
            // Validate customer details are filled
            if (!loanForm.name || !loanForm.email || !loanForm.address || !loanForm.phoneNumber) {
                toast.error('Please fill in all customer details');
                return;
            }
        }

        try {
            const response = await axiosAPI.post('/loans', loanForm);
            console.log("299 : ", response)
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

    const clearLoanForm = () => {
        setLoanForm({
            fileNumber: '',
            loanAmount: '',
            interestRate: '',
            documentCharge: '',
            numberOfInstallments: '',
            // customerId: '',
            name: '',
            email: '',
            address: '',
            phoneNumber: '',
            employeeId: empId
        });
        setSearchCustomer('');
        setExistCustomer(null);
        setIsEmployee(false);
    };
    const fetchInstallments = async () => {
        try {
            const response = await axiosAPI.get('/installments');
            setDisplayInstallments(response.data);
        } catch (e) {
            console.log(e);
            toast.error('Failed to fetch installment options');
        }
    };


    useEffect(() => {
        // fetchEmployees();
        fetchInstallments();
    }, [])
    return (
        <div>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className='flex justify-between items-start mb-8'>
                <h1 className='text-2xl font-bold text-center md:text-left'>Create New Loan</h1>
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
                    <table className='w-full border border-gray-300 bg-white'>
                        <thead>
                            <tr className='bg-gradient-to-r from-zinc-500 to-zinc-600 text-white'>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>File Number</th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>Created At</th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>Amount</th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>Interest</th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>Installments</th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>Installment Amount</th>
                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>Entered By (Emp. Id)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {existCustomer.loans.map((loan, key) => (
                                <tr key={loan.fileNumber} className={`${key % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                                    <td className='border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700'>
                                        {loan.fileNumber}
                                    </td>
                                    <td className='border border-gray-300 px-3 py-2 font-medium'>
                                        {new Date(loan.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600'>
                                        Rs. {parseFloat(loan.amount).toLocaleString()}
                                    </td>
                                    <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600'>
                                        {loan.interestRate}%
                                    </td>
                                    <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600'>
                                        {loan.noOfInstallments}
                                    </td>
                                    <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600'>
                                        Rs. {((parseFloat(loan.amount) * loan.interestRate) / 100.0).toLocaleString()}
                                    </td>
                                    <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600'>
                                        {loan.employeeId}
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
                        <input
                            type="number"
                            name="interestRate"
                            value={loanForm.interestRate}
                            onChange={handleLoanChange}
                            className='border border-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-black'
                            placeholder="12.5"
                            min="0"
                            max="100"
                            step="0.1"
                            required
                        />
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
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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