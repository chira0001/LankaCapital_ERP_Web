import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
// import pb from '@/lib/pocketbaseClient.js'; 
import { UserPlus, Shield } from 'lucide-react';
import { Button } from '@/component/ui/button';
import { toast } from "sonner"; // SONNER TOAST

const UserManagementPage = () => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ADD USER + EDIT STATES 
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [newUser, setNewUser] = useState({
    employee_id: "",
    name: "",
    email: "",
    role: ""
  });

  const [editUser, setEditUser] = useState({});

  // ==========================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {

      const data = [
        {
          id: "u1",
          employee_id: "EMP001",
          name: "Kamal Perera",
          email: "kamal@gmail.com",
          role: "Director",
          account_status: "Active",
          created: "2026-04-18"
        },
        {
          id: "u2",
          employee_id: "EMP002",
          name: "Saman Silva",
          email: "saman@gmail.com",
          role: "Receptionist",
          account_status: "Inactive",
          created: "2026-04-17"
        },
        {
          id: "u3",
          employee_id: "EMP003",
          name: "Nimal Perera",
          email: "nimal@gmail.com",
          role: "Field Officer",
          account_status: "Active",
          created: "2026-04-16"
        }
      ];

      setUsers(data);

    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // ADD USER 
  const handleCreateUser = () => {
    if (!newUser.employee_id || !newUser.name || !newUser.email || !newUser.role) {
      toast.error("Fill all fields");
      return;
    }

    const created = {
      id: "u" + (users.length + 1),
      ...newUser,
      account_status: "Active",
      created: new Date().toISOString(),
      password: "1234567" // DEFAULT PASSWORD
    };

    setUsers([...users, created]);

    // DB (COMMENTED)
    /*
    pb.collection('users').create({
      ...newUser,
      password: "1234567"
    });
    */

    toast.success("User created with default password 1234567");

    setShowAddForm(false);
    setNewUser({ employee_id: "", name: "", email: "", role: "" });
  };

  // RESET PASSWORD 
  const handleResetPassword = (id) => {

    /*
    pb.collection('users').update(id, {
      password: "1234567"
    });
    */

    toast.success("Password reset to 1234567");
  };

  // EDIT USER 
  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditUser(user);
  };

  const handleSaveEdit = (id) => {

    setUsers(users.map(u =>
      u.id === id ? editUser : u
    ));

    /*
    pb.collection('users').update(id, editUser);
    */

    toast.success("User updated");
    setEditingUserId(null);
  };

  // ==========================================================

  const handleAddUser = () => setShowAddForm(true);

  const getRoleBadge = (role) => {
    const styles = {
      Director: 'bg-black text-white border-black',
      Receptionist: 'bg-gray-200 text-gray-800 border-gray-300',
      'Field Officer': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return styles[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusBadge = (status) => {
    return status === 'Active'
      ? 'bg-gray-200 text-black border-gray-300'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>User Management - LendPro</title>
      </Helmet>

      <div className="flex min-h-screen bg-gray-50">

        <div className="flex-1 overflow-auto">
          <div className="p-8">

            {/* HEADER */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">User Management</h1>
                <p className="text-gray-600">Manage system users and permissions</p>
              </div>

              <Button
                onClick={handleAddUser}
                className="bg-black text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* ADD USER FORM */}
            {showAddForm && (
            <div className="bg-white p-4 mb-4 border">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <input
                    className="border p-2"
                    placeholder="Employee ID"
                    value={newUser.employee_id}
                    onChange={(e) => setNewUser({ ...newUser, employee_id: e.target.value })}
                />

                <input
                    className="border p-2"
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />

                <input
                    className="border p-2"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />

                <input
                    className="border p-2"
                    placeholder="Role (any position allowed)"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                />

                </div>

                <div className="mt-4">
                <Button onClick={handleCreateUser}>
                    Create (PW: 1234567)
                </Button>
                </div>

            </div>
            )}
            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">

                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Employee ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">User</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-black">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>

                        <td className="px-6 py-4">{user.employee_id}</td>

                        <td className="px-6 py-4">
                          {editingUserId === user.id ? (
                            <input
                              value={editUser.name}
                              onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                            />
                          ) : user.name}
                        </td>

                        <td className="px-6 py-4">
                          {editingUserId === user.id ? (
                            <input
                              value={editUser.email}
                              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                            />
                          ) : user.email}
                        </td>

                        <td className="px-6 py-4">
                          {editingUserId === user.id ? (
                            <input
                              value={editUser.role}
                              onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                            />
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                              {user.role}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user.account_status)}`}>
                            {user.account_status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {new Date(user.created).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 flex gap-2">

                          <Button onClick={() => handleResetPassword(user.id)}>
                            Reset PW
                          </Button>

                          {editingUserId === user.id ? (
                            <Button onClick={() => handleSaveEdit(user.id)}>
                              Save
                            </Button>
                          ) : (
                            <Button onClick={() => handleEdit(user)}>
                              Edit
                            </Button>
                          )}

                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagementPage;