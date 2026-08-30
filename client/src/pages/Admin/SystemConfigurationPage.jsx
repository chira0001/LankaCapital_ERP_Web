import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import axiosAPI from "@/api/axiosAPI";
import { ToastContainer } from "react-toastify";

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
      console.error("Failed to fetch configs:", error);
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
      setIsEdit(false);
      toast.success("Salary Information updated successfully");
    } catch (error) {
      toast.error("Failed to update configuration");
    } finally {
      setSaveLoading(false);
    }
  };

  const groupedData = useMemo(() => {
    return salaryCondition.reduce((acc, item) => {
      const condition = item.salaryCondition.conditionName;
      const role = item.role.roleName;

      if (!acc[condition]) acc[condition] = {};
      acc[condition][role] = item.value;

      return acc;
    }, {});
  }, [salaryCondition]);

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
      (item) =>
        item.salaryCondition.conditionName === condition &&
        item.role.roleName === role
    );

    if (index !== -1) {
      updated[index].value = parseFloat(value);
      setSalaryCondition(updated);
    }
  };

  const LoadingTableSkeleton = () => (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            Loading Salary Configuration
          </p>
          <p className="text-xs text-gray-500">
            Please wait while we fetch the latest data...
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
      </div>

      <div className="mt-6 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full rounded bg-gray-50 border border-gray-100 animate-pulse"
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-8">
        <div className="mx-auto max-w-[1400px]">
          {/* Page Header (always visible) */}
          <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 sm:text-xs">
                Settings
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                System Configuration
              </h1>
              <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                Configure salary meta data per role.
              </p>
            </div>

            {/* Actions (kept same functionality) */}
            <div className="flex items-center gap-2">
              {isEdit ? (
                <>
                  <button
                    onClick={() => {
                      setIsEdit(false);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition
                      ${
                        saveLoading
                          ? "bg-gray-900 opacity-60 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                  >
                    {saveLoading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEdit(true)}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Content Card */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Section header */}
            <div className="flex flex-col gap-2 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                  Salary Information
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Update condition values for each role.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                    isEdit
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  {isEdit ? "Edit mode" : "View mode"}
                </span>
              </div>
            </div>

            {/* Table/Card content (loading only hides this section) */}
            {loading ? (
              <LoadingTableSkeleton />
            ) : (
              <div className="p-4 sm:p-6">
                {/* ========== Mobile View (Cards) ========== */}
                <div className="md:hidden space-y-3">
                  {Object.keys(groupedData).map((condition) => (
                    <div
                      key={condition}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCondition(condition)}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Salary condition values per role
                        </p>
                      </div>

                      <div className="space-y-2">
                        {roles.map((role) => (
                          <div
                            key={role}
                            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                          >
                            <span className="text-xs font-semibold text-gray-700">
                              {role}
                            </span>

                            <input
                              type="number"
                              disabled={!isEdit}
                              value={groupedData[condition][role] || ""}
                              className={`w-28 rounded-lg border border-gray-200 bg-white px-2 py-1 text-right text-sm outline-none transition
                                ${
                                  isEdit
                                    ? "text-gray-900 focus:ring-2 focus:ring-gray-200"
                                    : "text-gray-400"
                                }`}
                              onChange={(e) =>
                                updateValue(condition, role, e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ========== Desktop/Tablet View (Table) ========== */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-[720px] w-full border-collapse">
                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="border border-gray-200 px-4 py-3 text-left">
                            Salary Condition
                          </th>
                          {roles.map((role) => (
                            <th
                              key={role}
                              className="border border-gray-200 px-4 py-3 text-center"
                            >
                              {role}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="text-sm">
                        {Object.keys(groupedData).map((condition) => (
                          <tr key={condition} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-900">
                              {formatCondition(condition)}
                            </td>

                            {roles.map((role) => (
                              <td
                                key={role}
                                className="border border-gray-200 px-4 py-3 text-center"
                              >
                                <input
                                  type="number"
                                  disabled={!isEdit}
                                  value={groupedData[condition][role] || ""}
                                  className={`w-28 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-sm outline-none transition
                                    ${
                                      isEdit
                                        ? "text-gray-900 focus:ring-2 focus:ring-gray-200"
                                        : "text-gray-400"
                                    }`}
                                  onChange={(e) =>
                                    updateValue(condition, role, e.target.value)
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Empty state */}
                {Object.keys(groupedData).length === 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      No salary configuration found
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      There is no configuration data available to display.
                    </p>
                  </div>
                )}

                {/* Note */}
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-600">
                    Tip: Values are stored per role and salary condition. Use{" "}
                    <span className="font-semibold text-gray-800">Edit</span> to
                    change values and{" "}
                    <span className="font-semibold text-gray-800">Save Changes</span>{" "}
                    to persist.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SystemConfigurationPage;