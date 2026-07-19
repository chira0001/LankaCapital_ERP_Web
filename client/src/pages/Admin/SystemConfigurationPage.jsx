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

    if (!acc[condition]) {
      acc[condition] = {};
    }

    acc[condition][role] = item.value;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>System Configuration - LendPro</title>
      </Helmet>

      <div className="p-8 bg-slate-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">System Configuration</h1>

        <div className="bg-white rounded-lg overflow-hidden p-3 shadow-md">
          <h3 className="text-xl font-bold text-gray-600 mb-6">Salary Information</h3>
          <table className="min-w-full border border-slate-200">
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
                    {condition}
                  </td>

                  {roles.map(role => (
                    <td key={role} className="px-4 py-3 border text-center">
                      <input
                        type="number"
                        disabled={!isEdit}
                        value={groupedData[condition][role] || ""}
                        className={`w-24 border rounded px-2 py-1 text-center ${isEdit ? "text-gray-800" : "text-gray-400"}`}
                        onChange={(e) => {
                          const updated = [...salaryCondition];
                          const index = updated.findIndex(
                            item =>
                              item.salaryCondition.conditionName === condition &&
                              item.role.roleName === role
                          );

                          if (index !== -1) {
                            updated[index].value = parseFloat(e.target.value);
                            setSalaryCondition(updated);
                          }
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {
            isEdit ?
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    // fetchSalaryCondition(); // reload original data
                    setIsEdit(false);
                  }}
                  className="bg-gray-200 text-black-700 px-6 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className={`text-white px-6 py-2 rounded transition
    ${saveLoading
                      ? "bg-blue-800 cursor-not-allowed opacity-70 pointer-events-none"
                      : "bg-blue-500 hover:bg-blue-800"
                    }`}
                >
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
              :
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsEdit(true)}
                  className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800"
                >
                  Edit
                </button>
              </div>
          }
        </div>
      </div>
    </>
  );
};

export default SystemConfigurationPage;