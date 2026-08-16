import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from "sonner";
import axiosAPI from '@/api/axiosAPI';

const roles = ["ADMIN", "RECEPTIONIST", "FO"];

const SystemConfigurationPage = () => {
  const [loading, setLoading] = useState(true);
  const [salaryCondition, setSalaryCondition] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchSalaryCondition();
  }, []);

  const fetchSalaryCondition = async () => {
    try {
      setLoading(true);
      const res = await axiosAPI.get("admin/salary-meta-data");
      setSalaryCondition(res.data);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const res = await axiosAPI.put("admin/salary-meta-data", salaryCondition);
      setSalaryCondition(res.data);
      setSaveLoading(false);
      setIsEdit(false);
      toast.success("Salary Information updated successfully");
    } catch (error) {
      toast.error("Failed to update configuration");
    }
  };

  const groupedData = salaryCondition.reduce((acc, item) => {
    const condition = item.salaryCondition.conditionName;
    const role = item.role.roleName;

    if (!acc[condition]) acc[condition] = {};
    acc[condition][role] = item.value;

    return acc;
  }, {});

  const formatCondition = (text) => {
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .replace(/\bOt\b/g, "OT")
      .trim();
  };

  const updateValue = (condition, role, value) => {
    const updated = [...salaryCondition];
    const index = updated.findIndex(
      item =>
        item.salaryCondition.conditionName === condition &&
        item.role.roleName === role
    );

    if (index !== -1) {
      updated[index].value = parseFloat(value);
      setSalaryCondition(updated);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Loading System Configurations
              </p>
              <p className="text-xs text-gray-500">
                Please wait while we fetch the latest data...
              </p>
            </div>
          </div>

          {/* simple skeleton */}
          <div className="mt-6 space-y-3">
            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse mt-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>System Configuration - LendPro</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 p-3 sm:p-4 lg:p-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
          System Configuration
        </h1>

        <div className="bg-white rounded-lg overflow-hidden p-3 sm:p-4 shadow-md">
          <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-4 sm:mb-6">
            Salary Information
          </h3>

          {/* ========== Mobile View (Cards) ========== */}
          <div className="md:hidden space-y-3">
            {Object.keys(groupedData).map((condition) => (
              <div
                key={condition}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="mb-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {formatCondition(condition)}
                  </p>
                  <p className="text-[11px] text-slate-500">Salary Condition</p>
                </div>

                <div className="space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role}
                      className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2"
                    >
                      <span className="text-xs font-medium text-slate-700">
                        {role}
                      </span>

                      <input
                        type="number"
                        disabled={!isEdit}
                        value={groupedData[condition][role] || ""}
                        className={`w-28 rounded border bg-white px-2 py-1 text-right text-sm ${
                          isEdit ? "text-gray-800" : "text-gray-400"
                        }`}
                        onChange={(e) => updateValue(condition, role, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ========== Desktop/Tablet View (Table) ========== */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full border border-slate-200">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left border">Salary Condition</th>
                    {roles.map(role => (
                      <th key={role} className="px-4 py-3 text-center border">
                        {role}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {Object.keys(groupedData).map(condition => (
                    <tr key={condition} className="hover:bg-slate-50">
                      <td className="px-4 py-3 border font-medium">
                        {formatCondition(condition)}
                      </td>

                      {roles.map(role => (
                        <td key={role} className="px-4 py-3 border text-center">
                          <input
                            type="number"
                            disabled={!isEdit}
                            value={groupedData[condition][role] || ""}
                            className={`w-24 border rounded px-2 py-1 text-center ${
                              isEdit ? "text-gray-800" : "text-gray-400"
                            }`}
                            onChange={(e) => updateValue(condition, role, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions (unchanged functionality) */}
          {isEdit ? (
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  // fetchSalaryCondition(); // reload original data
                  setIsEdit(false);
                }}
                className="bg-gray-200 text-black-700 px-5 sm:px-6 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saveLoading}
                className={`text-white px-5 sm:px-6 py-2 rounded transition
                  ${
                    saveLoading
                      ? "bg-blue-800 cursor-not-allowed opacity-70 pointer-events-none"
                      : "bg-blue-500 hover:bg-blue-800"
                  }`}
              >
                {saveLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsEdit(true)}
                className="bg-gray-700 text-white px-5 sm:px-6 py-2 rounded hover:bg-gray-800"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SystemConfigurationPage;