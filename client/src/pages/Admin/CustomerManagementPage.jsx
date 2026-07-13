import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, User, Trash2, Plus, Edit, Undo, DollarSign } from "lucide-react";
import { Input } from "@/component/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/component/ui/dialog";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/admin`;

// nic is the customer's unique identifier used everywhere in the backend
// (CustomerController uses @PathVariable Long nic on every customer endpoint).
const emptyCustomer = {
  nic: "",
  name: "",
  email: "",
  phoneNumber: "",
  address: "",
};

// Matches LoanCreateDto exactly:
// fileNumber, loanAmount, interestRate, documentCharge,
// numberOfInstallments, customerId, name, email, address,
// phoneNumber, bank, bankAccount
const emptyLoanForm = {
  fileNumber: "",
  loanAmount: "",
  interestRate: "",
  documentCharge: "",
  numberOfInstallments: "",
  customerId: "",
  name: "",
  email: "",
  address: "",
  phoneNumber: "",
  bank: "",
  bankAccount: "",
};

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyCustomer);

  // Add Loan modal state
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanForm, setLoanForm] = useState(emptyLoanForm);
  const [loanSaving, setLoanSaving] = useState(false);
  const [loanError, setLoanError] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 6;

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // ================= LOAD =================
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE}/customers`, authHeaders());

      setCustomers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to load customers:", err);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // ================= SEARCH =================
  useEffect(() => {
    const result = customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phoneNumber?.includes(search) ||
        String(c.nic ?? "").includes(search)
    );

    setFiltered(result);
    setPage(1);
  }, [search, customers]);

  // ================= CREATE / UPDATE CUSTOMER =================
  const saveCustomer = async () => {
    if (!form.nic || !form.name) {
      alert("NIC and Name are required.");
      return;
    }

    try {
      setSaving(true);

      if (editMode) {
        await axios.put(
          `${API_BASE}/customers/${form.nic}`,
          form,
          authHeaders()
        );
      } else {
        await axios.post(`${API_BASE}/customers`, form, authHeaders());
      }

      setShowForm(false);
      setForm(emptyCustomer);
      setEditMode(false);
      await loadCustomers();
    } catch (err) {
      console.error("Failed to save customer:", err);
      alert("Failed to save customer. Please check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE (soft delete) =================
  const deleteCustomer = async (nic) => {
    const ok = window.confirm("Are you sure you want to delete this customer?");
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE}/customers/${nic}`, authHeaders());
      await loadCustomers();
    } catch (err) {
      console.error("Failed to delete customer:", err);
      alert("Failed to delete customer.");
    }
  };

  // ================= UNDO DELETE =================
  const undoDelete = async (nic) => {
    try {
      await axios.put(
        `${API_BASE}/customers/${nic}/undo`,
        {},
        authHeaders()
      );
      await loadCustomers();
    } catch (err) {
      console.error("Failed to restore customer:", err);
      alert("Failed to restore customer.");
    }
  };

  // ================= EDIT CUSTOMER =================
  const openEdit = (customer) => {
    setForm(customer);
    setEditMode(true);
    setShowForm(true);
  };

  // ================= VIEW CUSTOMER =================
  const viewCustomer = async (customer) => {
    try {
      const res = await axios.get(
        `${API_BASE}/customers/${customer.nic}`,
        authHeaders()
      );
      setSelectedCustomer(res.data);
      setShowDialog(true);
    } catch (err) {
      console.error("Failed to load customer details:", err);
      setSelectedCustomer(customer);
      setShowDialog(true);
    }
  };

  // ================= ADD LOAN =================
  const openAddLoan = (customer) => {
    setLoanError("");
    setLoanForm({
      ...emptyLoanForm,
      customerId: customer.nic,
      name: customer.name || "",
      email: customer.email || "",
      address: customer.address || "",
      phoneNumber: customer.phoneNumber || "",
    });
    setShowLoanForm(true);
  };

  const saveLoan = async () => {
    if (
      !loanForm.fileNumber ||
      !loanForm.loanAmount ||
      !loanForm.interestRate ||
      !loanForm.numberOfInstallments
    ) {
      setLoanError(
        "File number, loan amount, interest rate, and number of installments are required."
      );
      return;
    }

    try {
      setLoanSaving(true);
      setLoanError("");

      const payload = {
        ...loanForm,
        loanAmount: Number(loanForm.loanAmount),
        interestRate: Number(loanForm.interestRate),
        documentCharge: loanForm.documentCharge
          ? Number(loanForm.documentCharge)
          : 0,
        numberOfInstallments: Number(loanForm.numberOfInstallments),
        customerId: Number(loanForm.customerId),
      };

      await axios.post(`${API_BASE}/loans`, payload, authHeaders());

      setShowLoanForm(false);
      setLoanForm(emptyLoanForm);

      // Refresh the currently open customer detail (if any) so the new
      // loan shows up immediately, and refresh the list in the background.
      if (selectedCustomer) {
        const res = await axios.get(
          `${API_BASE}/customers/${selectedCustomer.nic}`,
          authHeaders()
        );
        setSelectedCustomer(res.data);
      }
      await loadCustomers();
    } catch (err) {
      console.error("Failed to add loan:", err);
      const backendMessage =
        err.response?.data?.message || err.response?.data || "";
      setLoanError(
        `Failed to add loan. ${
          typeof backendMessage === "string" ? backendMessage : ""
        }`
      );
    } finally {
      setLoanSaving(false);
    }
  };

  // ================= PAGINATION =================
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  if (loading) {
    return <div className="p-6">Loading customers...</div>;
  }

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Customer Management</h1>

        <button
          onClick={() => {
            setForm(emptyCustomer);
            setEditMode(false);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* SEARCH */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CUSTOMER LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((c) => (
          <div key={c.nic} className="border p-4 rounded bg-white">

            <div onClick={() => viewCustomer(c)} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <User size={18} />
                <b>{c.name}</b>
              </div>

              <div className="text-sm text-gray-500">{c.email}</div>
              <div className="text-sm text-gray-500">{c.phoneNumber}</div>
              <div className="text-xs text-gray-400">NIC: {c.nic}</div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-3">

              <button onClick={() => openEdit(c)} title="Edit">
                <Edit size={16} />
              </button>

              <button
                onClick={() => deleteCustomer(c.nic)}
                className="text-red-500"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>

              <button
                onClick={() => undoDelete(c.nic)}
                className="text-green-600"
                title="Undo delete"
              >
                <Undo size={16} />
              </button>

              {/* Adding a loan is a fully separate action/endpoint from adding a
                  customer above — this never blocks or requires customer creation. */}
              <button onClick={() => openAddLoan(c)} title="Add loan" className="text-blue-600">
                <DollarSign size={16} />
              </button>

            </div>

          </div>
        ))}

        {paginated.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            No customers found
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border ${
                page === i + 1 ? "bg-black text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* CUSTOMER DETAILS + LOANS */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div>

              {/* CUSTOMER INFO */}
              <div className="mb-4">
                <p><b>NIC:</b> {selectedCustomer.nic}</p>
                <p><b>Name:</b> {selectedCustomer.name}</p>
                <p><b>Email:</b> {selectedCustomer.email}</p>
                <p><b>Phone:</b> {selectedCustomer.phoneNumber}</p>
                <p><b>Address:</b> {selectedCustomer.address}</p>
              </div>

              {/* LOANS */}
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Loans</h3>

                  <button
                    onClick={() => openAddLoan(selectedCustomer)}
                    className="flex items-center gap-1 bg-black text-white px-2 py-1 text-sm rounded"
                  >
                    <DollarSign size={14} /> Add Loan
                  </button>
                </div>

                {selectedCustomer.loans?.length > 0 ? (
                  selectedCustomer.loans.map((l) => (
                    <div key={l.fileNumber} className="border p-2 mt-2 rounded">
                      <p><b>{l.fileNumber}</b></p>
                      <p>Amount: {l.loanAmount ?? l.amount ?? "-"}</p>
                      {l.interestRate != null && (
                        <p>Interest rate: {l.interestRate}%</p>
                      )}
                      {l.numberOfInstallments != null && (
                        <p>Installments: {l.numberOfInstallments}</p>
                      )}
                      {l.status && <p>Status: {l.status}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No loans found</p>
                )}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD / EDIT CUSTOMER FORM */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogTitle>
            {editMode ? "Edit Customer" : "Add Customer"}
          </DialogTitle>

          <div className="space-y-2">

            <Input
              placeholder="NIC"
              value={form.nic}
              disabled={editMode}
              onChange={(e) => setForm({ ...form, nic: e.target.value })}
            />

            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <Input
              placeholder="Phone"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
            />

            <Input
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <button
              onClick={saveCustomer}
              disabled={saving}
              className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : editMode ? "Update" : "Create"}
            </button>

          </div>
        </DialogContent>
      </Dialog>

      {/* ADD LOAN FORM */}
      <Dialog open={showLoanForm} onOpenChange={setShowLoanForm}>
        <DialogContent>
          <DialogTitle>Add Loan</DialogTitle>

          <div className="space-y-2">

            <p className="text-sm text-gray-500">
              Customer: <b>{loanForm.name}</b> (NIC: {loanForm.customerId})
            </p>

            {loanError && (
              <div className="p-2 rounded bg-red-50 text-red-600 text-sm">
                {loanError}
              </div>
            )}

            <Input
              placeholder="File Number"
              value={loanForm.fileNumber}
              onChange={(e) =>
                setLoanForm({ ...loanForm, fileNumber: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Loan Amount"
              value={loanForm.loanAmount}
              onChange={(e) =>
                setLoanForm({ ...loanForm, loanAmount: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Interest Rate (%)"
              value={loanForm.interestRate}
              onChange={(e) =>
                setLoanForm({ ...loanForm, interestRate: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Document Charge"
              value={loanForm.documentCharge}
              onChange={(e) =>
                setLoanForm({ ...loanForm, documentCharge: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Number of Installments"
              value={loanForm.numberOfInstallments}
              onChange={(e) =>
                setLoanForm({
                  ...loanForm,
                  numberOfInstallments: e.target.value,
                })
              }
            />

            <Input
              placeholder="Bank"
              value={loanForm.bank}
              onChange={(e) =>
                setLoanForm({ ...loanForm, bank: e.target.value })
              }
            />

            <Input
              placeholder="Bank Account"
              value={loanForm.bankAccount}
              onChange={(e) =>
                setLoanForm({ ...loanForm, bankAccount: e.target.value })
              }
            />

            <button
              onClick={saveLoan}
              disabled={loanSaving}
              className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
            >
              {loanSaving ? "Saving..." : "Create Loan"}
            </button>

          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CustomerManagementPage;