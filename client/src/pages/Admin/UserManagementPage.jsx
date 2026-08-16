import React, { useState, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/component/ui/button";
import { toast } from "sonner";
import axiosAPI from "@/api/axiosAPI";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [selectedEmployee, setSelecetedEmployee] = useState();
  const [editEmployee, setEditEmployee] = useState();

  const [showAddForm, setShowAddForm] = useState(false);

  const [newUser, setNewUser] = useState({
    nic: "",
    firstName: "",
    lastName: "",
    email: "",
    roleId: "",
    address: "",
    phoneNumber: "",
    basicSalary: ""
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosAPI.get("/admin/employees");
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axiosAPI.get("/admin/role");
      setRoles(res.data);
    } catch (error) {
      toast.error("Failed to load roles");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleCreateUser = async () => {
    try {
      // Basic validation (minimal, non-breaking)
      if (!newUser.nic || !newUser.firstName || !newUser.email || !newUser.roleId) {
        toast.error("Please fill required fields");
        return;
      }

      setCreating(true);

      const res = await axiosAPI.post("/admin/employee", newUser);

      toast.success("User created successfully");

      setUsers((prev) => [...prev, res.data]);
      setNewUser({
        nic: "",
        firstName: "",
        lastName: "",
        email: "",
        roleId: "",
        address: "",
        phoneNumber: "",
        basicSalary: ""
      });

      setShowAddForm(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Create failed");
    } finally {
      setCreating(false);
    }
  };

  const updateEmployee = async () => {
    try {
      await axiosAPI.put(`/admin/employees/${editEmployee.id}`, editEmployee);
      toast.success("User updated");
      setOpenEditModal(false);
      setOpenModal(false);
      fetchUsers();
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteUser = async (employeeId) => {
    try {
      setDeleting(true);

      await axiosAPI.post(`/admin/employees/delete/${employeeId}`);

      toast.success("User deleted successfully");

      setOpenModal(false);
      setSelecetedEmployee(null);

      // Optimistically update UI (no need to refetch immediately)
      setUsers((prev) => prev.filter((u) => u.id !== employeeId));
    } catch (e) {
      console.error(e);
      toast.error("User not deleted");
    } finally {
      setDeleting(false);
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
                Loading Users
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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800">
            User Management
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Manage employees, roles and details
          </p>
        </div>

        <Button
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow"
          onClick={() => setShowAddForm(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* ADD USER CARD */}
      {showAddForm && (
        <div className="mb-4 rounded-xl border bg-white p-3 shadow-sm sm:p-4 lg:p-6 lg:mb-8">
          <h2 className="text-base sm:text-lg font-medium mb-4 text-gray-700">
            Create New User
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {Object.keys(newUser).map((field) =>
              field !== "roleId" ? (
                <input
                  key={field}
                  placeholder={field}
                  value={newUser[field]}
                  onChange={(e) =>
                    setNewUser({ ...newUser, [field]: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <select
                  key={field}
                  value={newUser.roleId}
                  onChange={(e) =>
                    setNewUser({ ...newUser, roleId: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" hidden>
                    Select user role
                  </option>

                  {roles.map((r) => {
                    if (r.roleName === "CUSTOMER") return null;

                    return (
                      <option key={r.id} value={r.id}>
                        {r.roleName === "FO" ? "FIELD OFFICER" : r.roleName}
                      </option>
                    );
                  })}
                </select>
              )
            )}
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              className="border border-gray-400 w-full sm:w-auto"
              variant="ghost"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              onClick={handleCreateUser}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      )}

      {/* ===================== MOBILE USERS LIST (cards) ===================== */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => {
              setOpenModal(true);
              setSelecetedEmployee(user);
            }}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:bg-blue-50"
            role="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">NIC</p>
                <p className="text-sm font-medium text-gray-800 break-all">{user.nic}</p>

                <p className="mt-2 text-xs text-gray-500">Name</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>

                <p className="mt-2 text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-700 break-all">{user.email}</p>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== USERS TABLE (md+) ===================== */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">NIC</th>
                <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">Name</th>
                <th className="hidden px-3 py-3 text-left sm:table-cell sm:px-4 md:px-6 md:py-4">Email</th>
                <th className="px-3 py-3 text-left sm:px-4 md:px-6 md:py-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => {
                    setOpenModal(true);
                    setSelecetedEmployee(user);
                  }}
                  className="cursor-pointer border-t transition hover:bg-blue-50"
                >
                  <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{user.nic}</td>
                  <td className="px-3 py-3 font-medium text-gray-800 sm:px-4 md:px-6 md:py-4">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="hidden px-3 py-3 text-gray-600 sm:table-cell sm:px-4 md:px-6 md:py-4">
                    {user.email}
                  </td>
                  <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600">
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {openModal && selectedEmployee && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
          <div className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto animate-fadeIn rounded-xl bg-white p-4 shadow-2xl sm:p-6">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
              Employee Details
            </h2>

            <div className="grid gap-3 text-sm sm:gap-4 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
              <div>
                <p className="text-gray-500">Employee ID</p>
                <p className="font-medium text-gray-800">{selectedEmployee.id}</p>
              </div>

              <div>
                <p className="text-gray-500">NIC</p>
                <p className="font-medium text-gray-800">{selectedEmployee.nic}</p>
              </div>

              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium text-gray-800">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium text-gray-800 break-all">
                  {selectedEmployee.email}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Role</p>
                <p className="font-medium text-gray-800">
                  {selectedEmployee.role === "FO"
                    ? "Field Officer"
                    : selectedEmployee.role}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-800">
                  {selectedEmployee.phoneNumber}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Basic Salary</p>
                <p className="font-medium text-gray-900">
                  {selectedEmployee.basicSalary
                    ? `LKR ${Number(selectedEmployee.basicSalary).toLocaleString()}`
                    : "No basic salaray"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Account Status</p>
                <p className="font-medium text-gray-800">
                  {selectedEmployee.accountStatus}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-gray-500">Address</p>
                <p className="font-medium text-gray-800">
                  {selectedEmployee.address}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                onClick={() => {
                  setEditEmployee(selectedEmployee);
                  setOpenEditModal(true);
                }}
              >
                Edit
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                disabled={deleting}
                onClick={() => deleteUser(selectedEmployee.id)}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL (STACKED ABOVE) */}
      {openEditModal && editEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-4 sm:p-6 relative">
            <button
              onClick={() => setOpenEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
              Edit Employee
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Role</label>
                <select
                  value={editEmployee.role}
                  onChange={(e) =>
                    setEditEmployee({
                      ...editEmployee,
                      role: e.target.value,
                    })
                  }
                  className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {roles
                    .filter((role) => role.roleName !== "CUSTOMER")
                    .map((role) => (
                      <option key={role.id} value={role.roleName}>
                        {role.roleName === "FO"
                          ? "Field Officer".toUpperCase()
                          : role.roleName.toUpperCase()}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-500">Basic Salary</label>

                <input
                  type="text"
                  inputMode="decimal"
                  value={editEmployee.basicSalary ?? ""}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (
                      editEmployee.basicSalary === "0" &&
                      value.length === 2 &&
                      !value.includes(".")
                    ) {
                      value = value.substring(1);
                    }

                    const regex = /^(0|[1-9]\d*)(\.\d{0,2})?$/;

                    if (value === "" || regex.test(value)) {
                      setEditEmployee({
                        ...editEmployee,
                        basicSalary: value,
                      });
                    }
                  }}
                  placeholder="0.00"
                  className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setOpenEditModal(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                onClick={updateEmployee}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;