import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: "",
    accountStatus: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==============================
  // GET PROFILE
  // ==============================
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get(
        "http://localhost:8080/api/v1/admin/profile",
        config
      );

      setProfile(res.data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ==============================
  // HANDLE INPUT CHANGE
  // ==============================
  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // ==============================
  // SAVE PROFILE
  // ==============================
  const handleSave = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(
        "http://localhost:8080/api/v1/admin/profile",
        profile,
        config
      );

      setEditMode(false);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // LOADING STATE
  // ==============================
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl md:text-5xl font-bold text-black">
          Admin Profile
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your personal information and security
        </p>
      </div>

      {/* PERSONAL INFO */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Personal Information</h2>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-yellow-500 px-5 py-2 rounded-lg font-semibold"
            >
              Edit
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-black text-white rounded-lg"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <Label>First Name</Label>
            <Input
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div>
            <Label>Last Name</Label>
            <Input
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              name="email"
              value={profile.email}
              disabled
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div>
            <Label>Role</Label>
            <Input
              name="role"
              value={profile.role}
              disabled
            />
          </div>

          <div>
            <Label>Account Status</Label>
            <Input
              name="accountStatus"
              value={profile.accountStatus}
              disabled
            />
          </div>

        </div>
      </div>

      {/* ADDRESS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-bold mb-4">Address</h2>

        <Label>Full Address</Label>
        <Input
          name="address"
          value={profile.address || ""}
          onChange={handleChange}
          disabled={!editMode}
        />
      </div>

      {/* SECURITY */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-bold mb-4">Security</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500">Password</p>
            <p className="font-semibold">••••••••••</p>
          </div>

          <button className="bg-black text-white px-5 py-2 rounded-lg">
            Change Password
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminProfile;