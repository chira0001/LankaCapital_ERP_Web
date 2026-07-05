import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/component/ui/button';
import { toast } from "sonner";

const UserManagementPage = () => {

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [newUser, setNewUser] = useState({
    nic: "",
    firstName: "",
    lastName: "",
    email: "",
    roleId: "",
    address: "",
    phoneNumber: ""
  });

  const [editUser, setEditUser] = useState({});

  // ===============================
  // AUTH HEADER
  // ===============================
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // ===============================
  // FETCH USERS
  // ===============================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/employee`,
        getAuthConfig()
      );
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FETCH ROLES
  // ===============================
  const fetchRoles = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/role`,
        getAuthConfig()
      );
      setRoles(res.data);
    } catch (error) {
      toast.error("Failed to load roles");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // ===============================
  // CREATE USER
  // ===============================
  const handleCreateUser = async () => {
    try {

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/employee`,
        newUser,
        getAuthConfig()
      );

      toast.success("User created successfully");

      setNewUser({
        nic: "",
        firstName: "",
        lastName: "",
        email: "",
        roleId: "",
        address: "",
        phoneNumber: ""
      });

      setShowAddForm(false);
      fetchUsers();

    } catch (error) {
      toast.error("Create failed");
    }
  };

  // ===============================
  // DELETE USER
  // ===============================
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/admin/employee/${id}`,
        getAuthConfig()
      );

      toast.success("User deleted");
      fetchUsers();

    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // ===============================
  // START EDIT
  // ===============================
  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditUser(user);
  };

  // ===============================
  // SAVE EDIT
  // ===============================
  const handleSaveEdit = async (id) => {
    try {

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/admin/employee/${id}`,
        editUser,
        getAuthConfig()
      );

      toast.success("User updated");

      setEditingUserId(null);
      fetchUsers();

    } catch (error) {
      toast.error("Update failed");
    }
  };

  // ===============================
  // LOADING
  // ===============================
  if (loading) {
    return <div className="p-8">Loading users...</div>;
  }

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>

        <Button onClick={() => setShowAddForm(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <div className="grid grid-cols-2 gap-3 bg-white p-4 border mb-4">

          <input placeholder="NIC"
            value={newUser.nic}
            onChange={(e) => setNewUser({ ...newUser, nic: e.target.value })}
          />

          <input placeholder="First Name"
            value={newUser.firstName}
            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
          />

          <input placeholder="Last Name"
            value={newUser.lastName}
            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
          />

          <input placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />

          <input placeholder="Address"
            value={newUser.address}
            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
          />

          <input placeholder="Phone"
            value={newUser.phoneNumber}
            onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
          />

          <select
            value={newUser.roleId}
            onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
          >
            <option value="">Select Role</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                {r.roleName}
              </option>
            ))}
          </select>

          <Button onClick={handleCreateUser}>
            Create User
          </Button>

        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded">

        <table className="w-full">

          <thead className="bg-gray-100">
            <tr>
              <th>NIC</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">

                <td>{user.nic}</td>

                <td>
                  {editingUserId === user.id ? (
                    <input
                      value={editUser.firstName}
                      onChange={(e) =>
                        setEditUser({ ...editUser, firstName: e.target.value })
                      }
                    />
                  ) : (
                    `${user.firstName} ${user.lastName}`
                  )}
                </td>

                <td>
                  {editingUserId === user.id ? (
                    <input
                      value={editUser.email}
                      onChange={(e) =>
                        setEditUser({ ...editUser, email: e.target.value })
                      }
                    />
                  ) : (
                    user.email
                  )}
                </td>

                <td>{user.role}</td>

                <td className="flex gap-2">

                  {editingUserId === user.id ? (
                    <Button onClick={() => handleSaveEdit(user.id)}>
                      Save
                    </Button>
                  ) : (
                    <Button onClick={() => handleEdit(user)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
};

export default UserManagementPage; 