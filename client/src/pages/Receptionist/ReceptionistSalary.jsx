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
    // const handleSalaryChange = (employeeId, field, value) => {
    //     setEmployeeSalaries(prev => ({
    //         ...prev,
    //         [employeeId]: {
    //             ...prev[employeeId],
    //             [field]: value || 0
    //         }
    //     }));
    // };

    const handleSalaryChange = (employeeId, field, value) => {

        if (value === "") {
            setEmployeeSalaries(prev => ({
                ...prev,
                [employeeId]: {
                    ...prev[employeeId],
                    [field]: ""
                }
            }));
            return;
        }

        const regex = /^\d*\.?\d{0,2}$/;

        if (!regex.test(value)) {
            return;
        }

        if (!value.includes(".")) {
            value = value.replace(/^0+(?=\d)/, "");
        }

        setEmployeeSalaries(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [field]: value
            }
        }));
    };

    const submitSalaries = async (e) => {
        try {
            e.preventDefault();
            const payload = employees.map(employee => ({
                employeeId: employee.id,
                workingDays: parseFloat(employeeSalaries[employee.id]?.workingDays) || 0,
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
        <div className="min-h-full p-3">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Monthly Salary
                </h1>
                <p className="text-gray-600">
                    {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()} Payroll
                </p>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 w-fit">
                <p className="text-xs text-gray-500 font-medium">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                    {employees?.length || 0}
                </p>
            </div>

            {/* Salary Table Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                {/* Table Header Section */}
                <div className="py-6 px-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Employee Salary Details
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className='text-center'>
                            <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Emp Id</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Working <br /> Days</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">OT <br /> Hours</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Unpaid</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Loans</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Salary <br /> Advance</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 text-center">
                            {employees.map((employee, index) => (
                                <tr
                                    key={employee.id}
                                    className="hover:bg-blue-50 transition-colors"
                                >
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {index + 1}
                                    </td>

                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                        {employee.firstName} {employee.lastName}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {employee.role.roleName === "FO"
                                            ? "Field Officer"
                                            : toSentenceCase(employee.role.roleName)}
                                    </td>

                                    {/* Standardized Input Style */}
                                    {[
                                        { key: "workingDays", type: "number", min: 0, max: 31 },
                                        { key: "otHours", type: "number", step: "0.5", min: 0, max: 24 },
                                        { key: "unpaidLeaves", type: "number", step: "0.5", min: 0 },
                                        { key: "loans", type: "number", step: "0.01", min: 0 },
                                        { key: "salaryAdvance", type: "number", step: "0.01", min: 0 },
                                    ].map((field) => (
                                        <td key={field.key} className="px-6 py-4 text-center">
                                            <input
                                                type={field.type}
                                                step={field.step}
                                                min={field.min}
                                                max={field.max}
                                                value={employeeSalaries[employee.id]?.[field.key]}
                                                onChange={(e) =>
                                                    handleSalaryChange(employee.id, field.key, e.target.value)
                                                }
                                                placeholder="0"
                                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {employees.length > 0 && (
                    <div className="flex justify-end gap-4 items-center px-6 py-4 bg-gray-50 border-t">
                        <button
                            onClick={clearAllSalaries}
                            className="border border-gray-400 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Clear All
                        </button>

                        <button
                            onClick={submitSalaries}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                        >
                            Submit All Salaries
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReceptionistSalary