import React, { useState, useEffect } from "react";
import axiosAPI from "@/api/axiosAPI";
import {
  Search,
  Trash2,
  Plus,
  Edit,
  DollarSign,
} from "lucide-react";
import { Input } from "@/component/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/component/ui/dialog";

const emptyCustomer = {
  nic: "",
  name: "",
  email: "",
  phoneNumber: "",
  address: "",
};

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
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyCustomer);

  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanForm, setLoanForm] = useState(emptyLoanForm);
  const [loanSaving, setLoanSaving] = useState(false);
  const [loanError, setLoanError] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 6;

  // ================= LOAD =================
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosAPI.get("/admin/customers");
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

  // ================= SAVE CUSTOMER =================
  const saveCustomer = async () => {
    if (!form.nic || !form.name) {
      alert("NIC and Name are required.");
      return;
    }

    try {
      setSaving(true);
      if (editMode) {
        await axiosAPI.put(`admin/customers/${form.nic}`, form);
      } else {
        await axiosAPI.post(`admin/customers`, form);
      }

      setShowForm(false);
      setForm(emptyCustomer);
      setEditMode(false);
      await loadCustomers();
    } catch (err) {
      console.error("Failed to save customer:", err);
      alert("Failed to save customer.");
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE =================
  const deleteCustomer = async (nic) => {
    const ok = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (!ok) return;

    try {
      await axiosAPI.delete(`admin/customers/${nic}`);
      setShowCustomerDetails(false);
      setSelectedCustomer(null);
      await loadCustomers();
    } catch (err) {
      console.error("Failed to delete customer:", err);
      alert("Failed to delete customer.");
    }
  };

  // ================= VIEW =================
  const viewCustomer = async (customer) => {
    try {
      const res = await axiosAPI.get(`admin/customers/${customer.nic}`);
      setSelectedCustomer(res.data);
      setShowCustomerDetails(true);
    } catch {
      setSelectedCustomer(customer);
      setShowCustomerDetails(true);
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
      setLoanError("Required fields are missing.");
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

      await axiosAPI.post(`admin/loans`, payload);

      setShowLoanForm(false);
      setLoanForm(emptyLoanForm);

      if (selectedCustomer) {
        const res = await axiosAPI.get(
          `admin/customers/${selectedCustomer.nic}`
        );
        setSelectedCustomer(res.data);
      }

      await loadCustomers();
    } catch (err) {
      console.error("Failed to add loan:", err);
      setLoanError("Failed to add loan.");
    } finally {
      setLoanSaving(false);
    }
  };

  // ================= PAGINATION =================
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  if (loading) {
    return <div className="p-8">Loading customers...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage customers and their loans
          </p>
        </div>

        <button
          onClick={() => {
            setForm(emptyCustomer);
            setEditMode(false);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* SEARCH */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-10 bg-white shadow-sm"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CUSTOMER TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  NIC
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Loan Count
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {paginated.map((c) => (
                <tr
                  key={c.nic}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => viewCustomer(c)}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.nic}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.phoneNumber || "No phone"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.email || "No email"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {c.loans?.length ?? 0}
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-gray-400">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-black text-white" : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* ======================== DIALOGS ======================== */}

      {/* CUSTOMER DETAILS DIALOG */}
      <Dialog
        open={showCustomerDetails}
        onOpenChange={setShowCustomerDetails}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* CUSTOMER INFO */}
              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border text-sm">
                <div>
                  <span className="font-medium text-gray-500">NIC</span>
                  <p className="text-gray-900">{selectedCustomer.nic}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Name</span>
                  <p className="text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Email</span>
                  <p className="text-gray-900">
                    {selectedCustomer.email || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">
                    Phone Number
                  </span>
                  <p className="text-gray-900">
                    {selectedCustomer.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Address</span>
                  <p className="text-gray-900">
                    {selectedCustomer.address || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">
                    Bank Details
                  </span>
                  <p className="text-gray-900">
                    {selectedCustomer.bank || "N/A"}
                  </p>
                  <p className="text-gray-900">
                    {selectedCustomer.bankAccount || "N/A"}
                  </p>
                </div>
              </div>

              {/* LOANS TABLE */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-gray-800">Loans</h2>
                  <button
                    onClick={() => openAddLoan(selectedCustomer)}
                    className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white px-3 py-1.5 text-sm rounded-md transition"
                  >
                    <DollarSign size={14} />
                    Add Loan
                  </button>
                </div>

                {selectedCustomer.loans?.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">
                            File No.
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">
                            Amount
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">
                            Interest
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">
                            Installments
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">
                            Created At
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">
                            Entered By
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedCustomer.loans.map((loan, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-900 font-medium">
                              {loan.fileNumber}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {loan.amount}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {loan.interestRate}%
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {loan.noOfInstallments}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {loan.Status || "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {loan.createdAt || "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              <div>
                                {loan.enteredBy?.firstName}{" "}
                                {loan.enteredBy?.lastName}
                              </div>
                              <div className="text-xs text-gray-400">
                                {loan.enteredBy?.nic}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm py-4">
                    No loans available
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 pt-2 border-t">
                <button
                  onClick={() => {
                    setShowCustomerDetails(false);
                    setForm(selectedCustomer);
                    setEditMode(true);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700 text-sm transition"
                >
                  <Edit size={14} />
                  Edit
                </button>

                <button
                  onClick={() => deleteCustomer(selectedCustomer.nic)}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 text-sm transition"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD / EDIT CUSTOMER DIALOG */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
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
              className="w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Saving..." : editMode ? "Update" : "Create"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD LOAN DIALOG */}
      <Dialog open={showLoanForm} onOpenChange={setShowLoanForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Loan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-500">
              Customer: <b>{loanForm.name}</b> (NIC: {loanForm.customerId})
            </p>

            {loanError && (
              <div className="p-3 rounded bg-red-50 text-red-600 text-sm">
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
              className="w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg transition disabled:opacity-50"
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