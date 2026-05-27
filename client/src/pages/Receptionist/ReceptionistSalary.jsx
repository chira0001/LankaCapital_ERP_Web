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

            const response = await axiosAPI.post('/recep/employees/salary', payload);
            toast.success('Salaries submitted successfully!');
            clearAllSalaries();
        } catch (error) {
            console.error('Error submitting salaries:', error);
            toast.error('Failed to submit salaries: ' + (error.response?.data?.message || error.message));
        }
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
    const fetchEmployees = async () => {
        try {
            const response = await axiosAPI.get('/recep/employees');
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
        <div className="min-h-screen bg-gray-50 p-3 flex flex-col rounded-2xl items-start">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xl shadow">
                    Rs.
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Monthly Salary Processing
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()} Payroll
                    </p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 px-5 py-4 mb-6">
                <p className="text-gray-500 text-xs">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                    {employees?.length || 0}
                </p>
            </div>

            {/* Salary Table Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-auto">

                <div className="overflow-x-auto">
                    <table className="table-auto  whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-900 text-white text-center text-lg">
                                <th className="px-4 py-3">Id</th>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3 text-center">Working <br /> Days</th>
                                <th className="px-4 py-3 text-center">OT</th>
                                <th className="px-4 py-3 text-center">Unpaid</th>
                                <th className="px-4 py-3 text-center">Loans</th>
                                <th className="px-4 py-3 text-center">Advance</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {employees.map((employee, index) => (
                                <tr key={employee.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-gray-500">
                                        {index + 1}
                                    </td>

                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {employee.firstName} {employee.lastName}
                                    </td>

                                    <td className="px-4 py-3 text-gray-500">
                                        {employee.role.roleName === "FO"
                                            ? "Field Officer"
                                            : toSentenceCase(employee.role.roleName)}
                                    </td>

                                    {/* Working Days */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="text"
                                            min="0"
                                            max="31"
                                            value={employeeSalaries[employee.id]?.workingDays || 0}
                                            onChange={(e) =>
                                                handleSalaryChange(employee.id, 'workingDays', e.target.value)
                                            }
                                            className="w-15 px-2 py-1 border border-gray-300 rounded-md text-center focus:ring-1 focus:ring-gray-800 focus:outline-none"
                                        />
                                    </td>

                                    {/* OT Hours */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={employeeSalaries[employee.id]?.otHours || 0}
                                            onChange={(e) =>
                                                handleSalaryChange(employee.id, 'otHours', e.target.value)
                                            }
                                            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:ring-1 focus:ring-gray-800 focus:outline-none"
                                        />
                                    </td>

                                    {/* Unpaid Leaves */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={employeeSalaries[employee.id]?.unpaidLeaves || 0}
                                            onChange={(e) =>
                                                handleSalaryChange(employee.id, 'unpaidLeaves', e.target.value)
                                            }
                                            className="w-20 px-2 py-1 border border-red-300 bg-red-50 text-red-700 rounded-md text-center focus:ring-1 focus:ring-red-500 focus:outline-none"
                                        />
                                    </td>

                                    {/* Loans */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={employeeSalaries[employee.id]?.loans || 0}
                                            onChange={(e) =>
                                                handleSalaryChange(employee.id, 'loans', e.target.value)
                                            }
                                            className="w-24 px-2 py-1 border border-red-300 bg-red-50 text-red-700 rounded-md text-right focus:ring-1 focus:ring-red-500 focus:outline-none"
                                        />
                                    </td>

                                    {/* Salary Advance */}
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={employeeSalaries[employee.id]?.salaryAdvance || 0}
                                            onChange={(e) =>
                                                handleSalaryChange(employee.id, 'salaryAdvance', e.target.value)
                                            }
                                            className="w-24 px-2 py-1 border border-red-300 bg-red-50 text-red-700 rounded-md text-right focus:ring-1 focus:ring-red-500 focus:outline-none"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {employees.length > 0 && (
                    <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <button
                            onClick={clearAllSalaries}
                            className="px-5 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm"
                        >
                            Clear All
                        </button>

                        <button
                            onClick={submitSalaries}
                            className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 transition text-sm"
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