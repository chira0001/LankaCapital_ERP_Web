import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReceptionistView = () => {
    const empId = 1 || localStorage.getItem("empId");

    const [searchCustomer, setSearchCustomer] = useState('');
    const [existCustomer, setExistCustomer] = useState(null);
    const [isEmployee, setIsEmployee] = useState(false);

    const [isEdit, setIsEdit] = useState(false);

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

    const loanDetails = [
        {
            fileNumber: "D001",
            createdAt: "20/05/2025",
            loanAmount: "100000",
            interestRate: "5",
            noOfInstallments: "60"
        },
        {
            fileNumber: "D001",
            createdAt: "20/05/2025",
            loanAmount: "100000",
            interestRate: "5",
            noOfInstallments: "60"
        },
        {
            fileNumber: "D001",
            createdAt: "20/05/2025",
            loanAmount: "100000",
            interestRate: "5",
            noOfInstallments: "60"
        },
        {
            fileNumber: "D001",
            createdAt: "20/05/2025",
            loanAmount: "100000",
            interestRate: "5",
            noOfInstallments: "60"
        }
    ];

    const calculateInterest = (amount, rate, installments) => {
        return ((amount * rate) / 100.0)
    }

    return (
        <div>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className='flex justify-between'>
                <h1 className='mb-8 text-2xl font-bold text-center md:text-left'>View Customer</h1>
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
            <div className='w-full flex justify-end gap-4 mt-6'>
                <button className='bg-black text-white px-6 py-2 rounded-lg w-full md:w-fit hover:bg-gray-800 transition-colors' onClick={() => setIsEdit(prev => !prev)}>
                    {isEdit
                        ?
                        "cancel"
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" >
                            <path d="M5 21h14c1.1 0 2-.9 2-2v-7h-2v7H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2"></path>
                            <path d="M7 13v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l9-9a.996.996 0 0 0 0-1.41l-3-3a.996.996 0 0 0-1.41 0l-9.01 8.99A1 1 0 0 0 7 13m10-7.59L18.59 7 17.5 8.09 15.91 6.5zm-8 8 5.5-5.5 1.59 1.59-5.5 5.5H9z"></path>
                        </svg>}
                </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex flex-col'>
                    <span className='mb-1 text-sm font-medium'>Customer NIC</span>
                    <input type="text" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                </div>
                <div className='flex flex-col'>
                    <span className='mb-1 text-sm font-medium'>Buisness Name</span>
                    <input type="email" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                </div>
                <div className='flex flex-col'>
                    <span className='mb-1 text-sm font-medium'>Business Address</span>
                    <input type="text" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                </div>
                <div className='flex flex-col'>
                    <span className='mb-1 text-sm font-medium'>Business Email</span>
                    <input type="text" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                </div>

                <div className='flex flex-col'>
                    <span className='mb-1 text-sm font-medium'>Contact Number</span>
                    <input type="text" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                </div>
            </div>
            <div className='mt-4 flex flex-col gap-4'>
                <div className='w-1/2 flex justify-between items-center gap-4 self-end'>
                    <span className='text-sm font-medium whitespace-nowrap'>Search File Number</span>
                    <input
                        type="text"
                        value={searchCustomer}
                        className='border border-gray-400 rounded-lg px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-black'
                        placeholder="File Number"
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
                <div className='border border-red-400 p-1 flex flex-col gap-2 max-h-150 overflow-scroll overflow-x-hidden'>
                    {loanDetails.map((loanDetail, key) => {
                        return (
                            <div key={key} className='flex flex-col border border-gray-400 rounded-md p-4 shadow-md'>
                                <span>File Number : {`${loanDetail.fileNumber}`}</span>
                                <span>Created At : {`${loanDetail.createdAt}`}</span>
                                <span>Loan Amount : Rs. {parseFloat(loanDetail.loanAmount).toLocaleString()}</span>
                                <span>Interest Rate : {`${loanDetail.interestRate}`}%</span>
                                <span>Number of Installments : {`${loanDetail.noOfInstallments}`}</span>
                                <span>Interst Amount : Rs. {`${calculateInterest(loanDetail.loanAmount, loanDetail.interestRate)}`}</span>
                                <span>
                                    Total Loan : Rs. {
                                        (calculateInterest(
                                            loanDetail?.loanAmount || 0,
                                            loanDetail?.interestRate || 0
                                        ) + (parseFloat(loanDetail?.loanAmount) || 0)).toLocaleString()
                                    }
                                </span>
                                <span>Installment Amount : Rs. {
                                    (calculateInterest(
                                        loanDetail?.loanAmount || 0,
                                        loanDetail?.interestRate || 0
                                    ) + (parseFloat(loanDetail?.loanAmount) || 0) / parseFloat(loanDetail?.noOfInstallments) || 1).toLocaleString()
                                }</span>

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default ReceptionistView