import React, { useState, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/component/ui/button";
import { toast } from "sonner";
import axios from "axios";
import axiosAPI from "@/api/axiosAPI";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

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
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/employee`,
        newUser
      );

      toast.success("User created successfully");

      setNewUser({
        nic: "",
        firstName: "",
        lastName: "",
        email: "",
        roleId: "",
        address: "",
        phoneNumber: "",
      });

      setShowAddForm(false);
      fetchUsers();
    } catch (error) {
      toast.error("Create failed");
    }
  };

  const updateEmployee = async () => {
    try {
      await axiosAPI.put(
        `/admin/employees/${editEmployee.id}`,
        editEmployee
      );
      toast.success("User updated");
      setOpenEditModal(false);
      setOpenModal(false);
      fetchUsers();
    } catch {
      toast.error("Update failed");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-500">
        Loading users...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            User Management
          </h1>
          <p className="text-gray-500 text-sm">
            Manage employees, roles and details
          </p>
        </div>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white shadow"
          onClick={() => setShowAddForm(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* ADD USER CARD */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-medium mb-4 text-gray-700">
            Create New User
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {Object.keys(newUser).map((field) =>
              field !== "roleId" ? (
                <input
                  key={field}
                  placeholder={field}
                  value={newUser[field]}
                  onChange={(e) =>
                    setNewUser({ ...newUser, [field]: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <select
                  key={field}
                  value={newUser.roleId}
                  onChange={(e) =>
                    setNewUser({ ...newUser, roleId: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roleName}
                    </option>
                  ))}
                </select>
              )
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCreateUser}
            >
              Create User
            </Button>
          </div>
        </div>
      )}

      {/* USERS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">NIC</th>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Role</th>
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
                className="border-t hover:bg-blue-50 cursor-pointer transition"
              >
                <td className="px-6 py-4">{user.nic}</td>
                <td className="px-6 py-4 font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
      {openModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white w-[520px] rounded-xl shadow-2xl p-6 relative animate-fadeIn">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Employee Details
            </h2>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">

              <div>
                <p className="text-gray-500">Employee ID</p>
                <p className="font-medium text-gray-800">
                  {selectedEmployee.id}
                </p>
              </div>

              <div>
                <p className="text-gray-500">NIC</p>
                <p className="font-medium text-gray-800">
                  {selectedEmployee.nic}
                </p>
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

              <div className="col-span-2">
                <p className="text-gray-500">Address</p>
                <p className="font-medium text-gray-800">
                  {selectedEmployee.address}
                </p>
              </div>
            </div>

            <div className="mt-6 text-right">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setEditEmployee(selectedEmployee);
                  setOpenEditModal(true);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL (STACKED ABOVE) */}
      {openEditModal && editEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[520px] rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setOpenEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-semibold mb-6">
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
                <label className="text-sm text-gray-500">
                  Basic Salary
                </label>

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

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setOpenEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
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