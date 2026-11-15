import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import axiosAPI from "@/api/axiosAPI";
import { ToastContainer } from "react-toastify";
import { Database, Download, LoaderCircle, RotateCcw } from "lucide-react";

const roles = ["ADMIN", "RECEPTIONIST", "FO"];

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

const SystemConfigurationPage = () => {
  const [loading, setLoading] = useState(true);
  const [salaryCondition, setSalaryCondition] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [deletedEmployeesLoading, setDeletedEmployeesLoading] = useState(true);
  const [restoringEmployeeId, setRestoringEmployeeId] = useState(null);

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const res = await axiosAPI.put("admin/salary-meta-data", salaryCondition);
      setSalaryCondition(res.data);
      setIsEdit(false);
      toast.success("Salary Information updated successfully");
    } catch {
      toast.error("Failed to update configuration");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDatabaseExport = async () => {
    try {
      setBackupLoading(true);
      const response = await axiosAPI.get("admin/database/export", {
        responseType: "blob",
      });
      const downloadUrl = URL.createObjectURL(response.data);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `LankaCapital-Database-Backup-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      toast.success("Database backup downloaded");
    } catch (error) {
      console.error("Database backup export failed:", error);
      toast.error("Database backup export failed");
    } finally {
      setBackupLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    axiosAPI
      .get("admin/salary-meta-data")
      .then((response) => {
        if (active) setSalaryCondition(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch configs:", error);
        toast.error("Failed to load configuration");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    axiosAPI
      .get("/admin/employees/deleted")
      .then((response) => {
        if (active) setDeletedEmployees(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch deleted employees:", error);
        toast.error("Failed to load deleted employees");
      })
      .finally(() => {
        if (active) setDeletedEmployeesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRestoreEmployee = async (employeeId) => {
    try {
      setRestoringEmployeeId(employeeId);
      await axiosAPI.put(`/admin/employees/${employeeId}/restore`);
      setDeletedEmployees((employees) =>
        employees.filter((employee) => employee.id !== employeeId)
      );
      toast.success("Employee restored successfully");
    } catch (error) {
      console.error("Failed to restore employee:", error);
      toast.error("Failed to restore employee");
    } finally {
      setRestoringEmployeeId(null);
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

          <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
              <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
                Deleted Employees
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Review deleted employee accounts and restore them when needed.
              </p>
            </div>

            {deletedEmployeesLoading ? (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500">
                <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
                Loading deleted employees...
              </div>
            ) : deletedEmployees.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-semibold text-gray-900">
                  No deleted employees
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Deleted employee accounts will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                  <thead className="bg-white text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="border-b border-gray-200 px-4 py-3 sm:px-6">Employee</th>
                      <th className="border-b border-gray-200 px-4 py-3">NIC</th>
                      <th className="border-b border-gray-200 px-4 py-3">Email</th>
                      <th className="border-b border-gray-200 px-4 py-3">Role</th>
                      <th className="border-b border-gray-200 px-4 py-3">Phone</th>
                      <th className="border-b border-gray-200 px-4 py-3 text-right sm:px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="border-b border-gray-100 px-4 py-3 font-medium text-gray-900 sm:px-6">
                          {employee.firstName} {employee.lastName}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-gray-600">
                          {employee.nic || "—"}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-gray-600">
                          {employee.email}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-gray-600">
                          {employee.role || "—"}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-gray-600">
                          {employee.phoneNumber || "—"}
                        </td>
                        <td className="border-b border-gray-100 px-4 py-3 text-right sm:px-6">
                          <button
                            type="button"
                            onClick={() => handleRestoreEmployee(employee.id)}
                            disabled={restoringEmployeeId !== null}
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {restoringEmployeeId === employee.id ? (
                              <LoaderCircle aria-hidden="true" className="animate-spin" size={14} />
                            ) : (
                              <RotateCcw aria-hidden="true" size={14} />
                            )}
                            {restoringEmployeeId === employee.id ? "Restoring..." : "Restore"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-start gap-3">
                <span className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-gray-700">
                  <Database aria-hidden="true" size={20} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
                    Database Backup
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    Export every database table to a separate worksheet in an Excel file.
                  </p>
                  <p className="mt-2 text-xs text-amber-700">
                    The backup contains all database records. Store it securely.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDatabaseExport}
                disabled={backupLoading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {backupLoading ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
                ) : (
                  <Download aria-hidden="true" size={16} />
                )}
                {backupLoading ? "Exporting..." : "Export Database"}
              </button>
            </div>
          </section>
          
        </div>
      </div>
    </>
  );
};

export default SystemConfigurationPage;