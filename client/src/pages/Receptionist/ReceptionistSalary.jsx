import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAPI from '../../api/axiosAPI'


const ReceptionistSalary = () => {

    const [employees, setEmployees] = useState([]);
    const [employeeSalaries, setEmployeeSalaries] = useState({});
    const [displayInstallments, setDisplayInstallments] = useState([]);
    const [salaryAdvance, setSalaryAdvance] = useState();

    const [isBulkSalary, setIsBulkSalary] = useState();
    const [workingDays, setWorkingDays] = useState();
    const [otHours, setOtHours] = useState();
    const [unpaidLeaves, setUnpaidLeaves] = useState();
    const [loans, setLoans] = useState();

    const [salaryData, setSalaryData] = useState({
        employeeId: "",
        workingDays: "",
        otHours: "",
        unpaidLeaves: "",
        loans: "",
        salaryAdvance: ""
    });
    const handleSalaryChange = (employeeId, field, value) => {
        setEmployeeSalaries(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [field]: parseFloat(value) || 0
            }
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
            toast.success('Salaries submitted successfully!');
            clearAllSalaries();
        } catch (error) {
            console.error('Error submitting salaries:', error);
            toast.error('Failed to submit salaries: ' + (error.response?.data?.message || error.message));
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
    const toSentenceCase = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

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

    useEffect(() => {
        fetchEmployees()
    }, [])
    return (
        <div>
            <ToastContainer position="top-right" autoClose={3000} />

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
                                            {employee.role.roleName === "fo" ? "Field Officer" : toSentenceCase(employee.role.roleName)}
                                        </td>

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
    )
}

export default ReceptionistSalary