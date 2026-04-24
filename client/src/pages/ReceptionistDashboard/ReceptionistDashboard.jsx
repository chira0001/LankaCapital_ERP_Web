import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReceptionistNavbar from '../../component/Navbar/ReceptionistNavbar'
import Footer from '../../component/Footer/Footer'
import HomeImg from '../../assets/Home.jpg'
import axiosAPI from '../../api/axiosAPI'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReceptionistDashboard = () => {

    const empId = 1 || localStorage.getItem("empId");

    const [panel, setPanel] = useState('loan');

    const [isBulkSalary, setIsBulkSalary] = useState();
    const [workingDays, setWorkingDays] = useState();
    const [otHours, setOtHours] = useState();
    const [unpaidLeaves, setUnpaidLeaves] = useState();
    const [loans, setLoans] = useState();
    const [salaryAdvance, setSalaryAdvance] = useState();

    const [employees, setEmployees] = useState([]);
    const [employeeSalaries, setEmployeeSalaries] = useState({});

    const [nic, setNic] = useState();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [address, setAddress] = useState();
    const [phoneNumber, setPhoneNumber] = useState();

    const [searchCustomer, setSearchCustomer] = useState('');
    const [existCustomer, setExistCustomer] = useState(null);
    const [isEmployee, setIsEmployee] = useState(false);

    const [displayInstallments, setDisplayInstallments] = useState([]);


    const [customerForm, setCustomerForm] = useState({
        nic: '',
        name: '',
        email: '',
        address: '',
        phoneNumber: ''
    });

    const [salaryData, setSalaryData] = useState({
        employeeId: "",
        workingDays: "",
        otHours: "",
        unpaidLeaves: "",
        loans: "",
        salaryAdvance: ""
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
        employeeId : empId
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

    const fetchInstallments = async () => {
        try {
            const response = await axiosAPI.get('/installments');
            setDisplayInstallments(response.data);
        } catch (e) {
            console.log(e);
            toast.error('Failed to fetch installment options');
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axiosAPI.get('/employees');
            setEmployees(response.data);

            const initialSalaries = {};
            response.data.forEach(emp => {
                initialSalaries[emp.id] = {
                    workingDays: 0,
                    otHours: 0,
                    unpaidLeaves: 0,
                    loans: 0,
                    salaryAdvance: 0
                };
            });
            setEmployeeSalaries(initialSalaries);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };



    const clearAllSalaries = () => {
        const clearedSalaries = {};
        employees.forEach(emp => {
            clearedSalaries[emp.id] = {
                workingDays: 0,
                otHours: 0,
                unpaidLeaves: 0,
                loans: 0,
                salaryAdvance: 0
            };
        });
        setEmployeeSalaries(clearedSalaries);
    };

    useEffect(() => {
        fetchEmployees();
        fetchInstallments();
    }, [])

    useEffect(() => {
        if (employees && employees.length > 0) {
            const initialSalaries = {};
            employees.forEach(emp => {
                initialSalaries[emp.id] = {
                    workingDays: 0,
                    otHours: 0,
                    unpaidLeaves: 0,
                    loans: 0,
                    salaryAdvance: 0
                };
            });
            setEmployeeSalaries(initialSalaries);
        }
    }, [employees]);

    const handleSalaryChange = (employeeId, field, value) => {
        setEmployeeSalaries(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [field]: parseFloat(value) || 0
            }
        }));
    };

    const panelNames = [
        {
            name: "Home",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.4 0 .77-.24.92-.62.15-.37.07-.8-.22-1.09l-8.99-9a.996.996 0 0 0-1.41 0l-9.01 9c-.29.29-.37.72-.22 1.09s.52.62.92.62Zm9-8.59 6 6V20H6v-9.59z"></path></svg>,
            css: `flex gap-3 items-center ${panel === 'home' ? "text-black" : "text-gray-400"}`,
            func: 'home'
        },
        {
            name: "Create Loan",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72M20 9v6h-7V9zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2z"></path><circle cx="16" cy="12" r="1.5"></circle></svg>,
            css: `flex gap-3 items-center ${panel === 'loan' ? "text-black" : "text-gray-400"}`,
            func: 'loan'
        },
        {
            name: "View Customer",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2 .82-2 2-2 2 .82 2 2M3 20h10c.55 0 1-.45 1-1v-1c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v1c0 .55.45 1 1 1m4-5h2c1.65 0 3 1.35 3 3H4c0-1.65 1.35-3 3-3m14-3.5c0-2-1.5-3.5-3.5-3.5S14 9.5 14 11.5s1.5 3.5 3.5 3.5c.62 0 1.18-.16 1.67-.42l2.12 2.12 1.41-1.41-2.12-2.12c.26-.49.42-1.05.42-1.67M17.5 13c-.88 0-1.5-.62-1.5-1.5s.62-1.5 1.5-1.5 1.5.62 1.5 1.5-.62 1.5-1.5 1.5"></path></svg>,
            css: `flex w-full gap-3 items-center ${panel === 'view' ? "text-black" : "text-gray-400"}`,
            func: 'view'
        },
        {
            name: "Add Salary",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m.89-9.4c1.44-.53 2.61-1.28 2.61-2.85 0-1.93-1.55-3.25-4-3.25-2.59 0-4 1.44-4 3.38h1.75c0-.84.57-1.63 2.25-1.63 1.5 0 2.25.66 2.25 1.5 0 .87-.66 1.47-2.53 2.22-1.88.72-3.22 1.59-3.22 3.44V15h1.75v-.5c0-1.16.97-1.84 2.72-2.53 1.84-.66 3.47-1.5 3.47-3.47 0-2.28-1.97-3.75-4.5-3.75-2.84 0-4.5 1.69-4.5 4h1.75c0-1.22.66-2.25 2.75-2.25 1.72 0 2.75.78 2.75 2 0 1.03-.81 1.62-2.61 2.19z"></path></svg>,
            css: `flex gap-3 items-center ${panel === 'salary' ? "text-black" : "text-gray-400"}`,
            func: 'salary'
        },
        {
            name: "Settings",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M22 12.5v-1h-1.03c-.04-.78-.18-1.54-.41-2.26l.95-.37-.36-.93-.95.37c-.38-.85-.89-1.62-1.5-2.3l.73-.73-.71-.71-.73.73c-.57-.51-1.2-.95-1.89-1.3l.42-.93-.91-.41-.42.94a8.9 8.9 0 0 0-2.69-.57V2h-1v1.03c-.78.04-1.54.18-2.26.41l-.37-.95-.93.36.37.95c-.85.38-1.62.89-2.3 1.5l-.73-.73-.71.71.73.73c-.51.57-.95 1.2-1.3 1.89l-.93-.42-.41.91.94.42a8.9 8.9 0 0 0-.57 2.69H2v1h1.03c.04.78.18 1.54.41 2.26l-.95.37.36.93.95-.37c.38.85.89 1.62 1.5 2.3l-.73.73.71.71.73-.73c.57.51 1.2.95 1.89 1.3l-.42.93.91.41.42-.94a8.9 8.9 0 0 0 2.69.57V22h1v-1.03c.78-.04 1.54-.18 2.26-.41l.37.95.93-.36-.37-.95c.85-.38 1.62-.89 2.3-1.5l.73.73.71-.71-.73-.73c.51-.57.95-1.2 1.3-1.89l.93.42.41-.91-.94-.42a8.9 8.9 0 0 0 .57-2.69zM12 5c3.1 0 5.72 2.02 6.65 4.81l-4.05.71c-.52-.91-1.48-1.53-2.6-1.53-.37 0-.72.08-1.05.2L8.31 6.05a6.9 6.9 0 0 1 3.68-1.06Zm1 7c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m-4.31 6.17a6.99 6.99 0 0 1-1.9-10.83l2.64 3.14c-.26.45-.42.96-.42 1.51 0 .93.43 1.75 1.1 2.3L8.7 18.15ZM12 19c-.49 0-.97-.05-1.43-.15l1.4-3.85H12a2.99 2.99 0 0 0 2.95-2.5l4.04-.71c0 .07.01.14.01.22 0 3.86-3.14 7-7 7Z"></path></svg>,
            css: `flex gap-3 w-full items-center ${panel === 'settings' ? "text-red-700" : "text-red-300"}`,
            func: 'settings'
        }
    ];

    // Handle Form Changes
    const handleCustomerChange = (e) => {
        setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
    };

    const handleLoanChange = (e) => {
        const { name, value } = e.target;
        setLoanForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const submitSalaries = async (e) => {
        try {
            e.preventDefault();
            const payload = employees.map(employee => ({
                employeeId: employee.id,
                workingDays: parseInt(employeeSalaries[employee.id]?.workingDays) || 0,
                otHours: parseFloat(employeeSalaries[employee.id]?.otHours) || 0,
                unpaidLeaves: parseFloat(employeeSalaries[employee.id]?.unpaidLeaves) || 0,
                loans: parseFloat(employeeSalaries[employee.id]?.loans) || 0,
                salaryAdvance: parseFloat(employeeSalaries[employee.id]?.salaryAdvance) || 0
            }));
            const response = await axiosAPI.post('/employees/salary', payload);
            alert('Salaries submitted successfully!');
            clearAllSalaries();
        } catch (error) {
            console.error('Error submitting salaries:', error);
            alert('Failed to submit salaries: ' + (error.response?.data?.message || error.message));
        }
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
            // Your loan submission logic here
            const response = await axiosAPI.post('/loans', loanForm);
            toast.success('Loan created successfully!');
            clearLoanForm();

        } catch (error) {
            console.error(error);
            toast.error('Failed to create loan. Please try again.');
        }
    };

    // Clear Forms
    const clearCustomerForm = () => {
        setCustomerForm({
            nic: '',
            name: '',
            email: '',
            address: '',
            phoneNumber: ''
        });
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
            employeeId : empId
        });
        setSearchCustomer('');
        setExistCustomer(null);
        setIsEmployee(false);
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            {/* <ReceptionistNavbar panelNames={panelNames} panel={panel} setPanel={setPanel} /> */}
            <div className='bg-gray-100 w-full text-black flex gap-8 h-fit md:min-h-dvh p-8'>
                <div className='bg-white md:w-[25%] p-8 rounded-2xl shadow-xl hidden md:flex md:flex-col gap-4'>
                    {panelNames.map((value, key) => (
                        <button key={key} className={value.css} onClick={() => setPanel(value.func)}>
                            {value.icon}
                            {value.name}
                        </button>
                    ))}
                </div>

                <div className={`${panel === 'settings' ? "bg-gray-100" : "bg-white shadow-xl"} w-full p-4 md:p-8 rounded-2xl`}>

                    {/* ADD SALARY PANEL */}
                    {panel === "salary" &&
                        <div>
                            <h1 className='mb-8 text-lg font-bold text-center md:text-left'>Bulk Employee Salary Entry</h1>

                            {/* Salary Entry Table */}
                            <div className='bg-white p-6 rounded-xl shadow'>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="font-bold text-sm">📝 Enter Salary Details</h2>
                                    <div className="text-sm text-gray-600">
                                        Total Employees: <strong>{employees?.length || 0}</strong>
                                    </div>
                                </div>

                                {!employees || employees.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📋</div>
                                        <p className="text-gray-500 text-lg">No employees to display</p>
                                    </div>
                                ) : (
                                    <div className='overflow-x-auto'>
                                        <table className='w-full border border-gray-300'>
                                            <thead>
                                                <tr className='bg-gradient-to-r from-zinc-500 to-zinc-600 text-white'>
                                                    <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>Employee ID</th>
                                                    <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>Employee Name</th>
                                                    <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>Designation</th>
                                                    <th className='border border-gray-300 px-3 py-3 text-center text-sm font-semibold bg-zinc-700'>Working Days</th>
                                                    <th className='border border-gray-300 px-3 py-3 text-center text-sm font-semibold bg-zinc-700'>OT Hours</th>
                                                    <th className='border border-gray-300 px-3 py-3 text-center text-sm font-semibold bg-red-700'>Unpaid Leaves</th>
                                                    <th className='border border-gray-300 px-3 py-3 text-center text-sm font-semibold bg-red-700'>Loans (LKR)</th>
                                                    <th className='border border-gray-300 px-3 py-3 text-center text-sm font-semibold bg-red-700'>Salary Advance (LKR)</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {employees.map((employee, i) => (
                                                    <tr key={employee.id} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                                                        <td className='border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700'>
                                                            {employee.id}
                                                        </td>

                                                        <td className='border border-gray-300 px-3 py-2 font-medium'>
                                                            {employee.firstName} {employee.lastName}
                                                        </td>

                                                        <td className='border border-gray-300 px-3 py-2 text-sm text-gray-600'>
                                                            {employee.role.roleName}
                                                        </td>

                                                        {/* ✅ Working Days */}
                                                        <td className='border border-gray-300 px-2 py-2'>
                                                            <input
                                                                type="number"
                                                                value={employeeSalaries[employee.id]?.workingDays || 0}
                                                                onChange={(e) => handleSalaryChange(employee.id, 'workingDays', e.target.value)}
                                                                min="0"
                                                                max="31"
                                                                className='w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center'
                                                            />
                                                        </td>

                                                        {/* ✅ OT Hours */}
                                                        <td className='border border-gray-300 px-2 py-2'>
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                value={employeeSalaries[employee.id]?.otHours || 0}
                                                                onChange={(e) => handleSalaryChange(employee.id, 'otHours', e.target.value)}
                                                                min="0"
                                                                className='w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center'
                                                                placeholder="0"
                                                            />
                                                        </td>

                                                        {/* ✅ Unpaid Leaves */}
                                                        <td className='border border-gray-300 px-2 py-2'>
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                value={employeeSalaries[employee.id]?.unpaidLeaves || 0}
                                                                onChange={(e) => handleSalaryChange(employee.id, 'unpaidLeaves', e.target.value)}
                                                                min="0"
                                                                className='w-full px-2 py-1.5 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-center bg-red-50'
                                                                placeholder="0"
                                                            />
                                                        </td>

                                                        {/* ✅ Loans */}
                                                        <td className='border border-gray-300 px-2 py-2'>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={employeeSalaries[employee.id]?.loans || 0}
                                                                onChange={(e) => handleSalaryChange(employee.id, 'loans', e.target.value)}
                                                                min="0"
                                                                className='w-full px-2 py-1.5 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-right bg-red-50'
                                                                placeholder="0.00"
                                                            />
                                                        </td>

                                                        {/* ✅ Salary Advance */}
                                                        <td className='border border-gray-300 px-2 py-2'>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={employeeSalaries[employee.id]?.salaryAdvance || 0}
                                                                onChange={(e) => handleSalaryChange(employee.id, 'salaryAdvance', e.target.value)}
                                                                min="0"
                                                                className='w-full px-2 py-1.5 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-right bg-red-50'
                                                                placeholder="0.00"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {employees && employees.length > 0 && (
                                    <div className='flex justify-end gap-4 mt-6'>
                                        <button
                                            onClick={clearAllSalaries}
                                            className='border border-gray-400 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors'
                                        >
                                            🗑️ Clear All
                                        </button>
                                        <button
                                            onClick={submitSalaries}
                                            className='bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold'
                                        >
                                            Submit All Salaries
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    }

                    {/* CREATE LOAN PANEL */}
                    {panel === "loan" && (
                        <div>
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
                                                <th className='border border-gray-300 px-3 py-3 text-left text-sm font-semibold'>Employee</th>
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
                                            placeholder="Enter loan file number"
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
                    )}

                    {/* VIEW CUSTOMER PANEL */}
                    {panel === 'view' && <div>
                        <h1 className='mb-8 text-2xl font-bold text-center md:text-left'>View Customer</h1>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>Business Name</span>
                                <input type="text" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>Business Registration</span>
                                <input type="text" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>Email Address</span>
                                <input type="email" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>Contact Number</span>
                                <input type="text" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>Loan Amount</span>
                                <input type="number" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>Business Address</span>
                                <input type="text" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>Interest Rate</span>
                                <input type="number" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='mb-1 text-sm font-medium'>Number of Installments</span>
                                <input type="number" className='border border-gray-400 rounded-lg px-3 py-2 w-full' />
                            </div>
                        </div>
                        <div className='w-full flex justify-end gap-4 mt-6'>
                            <button className='bg-black text-white px-6 py-2 rounded-lg w-full md:w-fit hover:bg-gray-800 transition-colors'>Update Customer</button>
                        </div>
                    </div>
                    }

                    {/* HOME PANEL */}
                    {panel === 'home' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold">Receptionist Dashboard</h1>
                                    <p className="text-gray-500">Manage customers, loans, and salary operations</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPanel('add')}
                                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        + Add Customer
                                    </button>

                                    <button
                                        onClick={() => setPanel('loan')}
                                        className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        Create Loan
                                    </button>
                                </div>
                            </div>

                            {/* STATS */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { title: "Total Customers", value: "1,240", color: "bg-blue-50" },
                                    { title: "Active Loans", value: "860", color: "bg-green-50" },
                                    { title: "Pending Requests", value: "12", color: "bg-yellow-50" },
                                    { title: "Completed Today", value: "24", color: "bg-purple-50" }
                                ].map((item, i) => (
                                    <div key={i} className={`${item.color} shadow-md rounded-xl p-4`}>
                                        <p className="text-gray-600 text-sm">{item.title}</p>
                                        <h2 className="text-2xl font-bold mt-1">{item.value}</h2>
                                    </div>
                                ))}
                            </div>

                            {/* QUICK ACTIONS */}
                            <div className="bg-white shadow-md rounded-xl p-6">
                                <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button
                                        onClick={() => setPanel('add')}
                                        className="border rounded-lg p-4 hover:bg-gray-100 transition-colors text-sm font-medium flex flex-col items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M22 11h-3V8h-2v3h-3v2h3v3h2v-3h3z"></path><path d="M4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4-4 1.72-4 4m6 0c0 1.18-.82 2-2 2s-2-.82-2-2 .82-2 2-2 2 .82 2 2"></path></svg>
                                        Register Customer
                                    </button>

                                    <button
                                        onClick={() => setPanel('loan')}
                                        className="border rounded-lg p-4 hover:bg-gray-100 transition-colors text-sm font-medium flex flex-col items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28"></path></svg>
                                        Create Loan
                                    </button>

                                    <button
                                        onClick={() => setPanel('salary')}
                                        className="border rounded-lg p-4 hover:bg-gray-100 transition-colors text-sm font-medium flex flex-col items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"></path></svg>
                                        Add Salary
                                    </button>

                                    <button
                                        onClick={() => setPanel('view')}
                                        className="border rounded-lg p-4 hover:bg-gray-100 transition-colors text-sm font-medium flex flex-col items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill={"currentColor"} viewBox={"0 0 24 24"}><path d="M21 11.5c0-2-1.5-3.5-3.5-3.5S14 9.5 14 11.5s1.5 3.5 3.5 3.5"></path></svg>
                                        Search Customer
                                    </button>
                                </div>
                            </div>

                            {/* RECENT ACTIVITY */}
                            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col gap-4">
                                <h2 className="font-semibold text-lg">Recent Customers</h2>

                                {[
                                    { name: "ABC Trading Ltd", date: "Registered today", status: "Active" },
                                    { name: "XYZ Enterprises", date: "Registered yesterday", status: "Pending" },
                                    { name: "Global Solutions", date: "2 days ago", status: "Active" }
                                ].map((item, index) => (
                                    <div key={index} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-400">{item.date}</p>
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            <span className={`text-xs px-3 py-1 rounded-full ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {item.status}
                                            </span>
                                            <button
                                                onClick={() => setPanel('view')}
                                                className="text-sm border px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}

                    {/* SETTINGS PANEL */}
                    {panel === 'settings' &&
                        <div className="flex flex-col gap-8">
                            <h1 className="text-2xl font-semibold">Settings</h1>

                            {/* PERSONAL INFORMATION */}
                            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">Personal Information</h2>
                                    <button className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                        Edit
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <span className="text-gray-400 text-sm">First Name</span>
                                        <p className="font-medium">Natashia</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm">Last Name</span>
                                        <p className="font-medium">Ferdman</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm">Date of Birth</span>
                                        <p className="font-medium">15 May 1998</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm">Email Address</span>
                                        <p className="font-medium">jhondoe@gmail.com</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm">Phone Number</span>
                                        <p className="font-medium">+94 12 123 4565</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm">User Role</span>
                                        <p className="font-medium">Receptionist</p>
                                    </div>
                                </div>
                            </div>

                            {/* ADDRESS */}
                            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">Address</h2>
                                    <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 transition-colors">
                                        Edit
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <span className="text-gray-400 text-sm">Street</span>
                                        <p className="font-medium">14/P, John St</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm">Town</span>
                                        <p className="font-medium">Kalutara</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm">Postal Code</span>
                                        <p className="font-medium">12000</p>
                                    </div>
                                </div>
                            </div>

                            {/* SECURITY */}
                            <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">Security</h2>
                                    <button className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                        Change Password
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <span className="text-gray-400 text-sm">Password</span>
                                        <p className="font-medium">••••••••••</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 text-sm">Last Updated</span>
                                        <p className="font-medium">2 months ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
            {/* <Footer /> */}
        </>
    )
}

export default ReceptionistDashboard