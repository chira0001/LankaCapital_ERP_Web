import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosAPI from "@/api/axiosAPI";
import { Search, Trash2, Plus, Edit, DollarSign } from "lucide-react";
import { Input } from "@/component/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/component/ui/dialog";
import { ToastContainer } from "react-toastify";

const emptyCustomer = {
  nic: "",
  name: "",
  email: "",
  phoneNumber: "",
  address: "",
  bank: "",
  bankAccount: "",
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
  loanType: "DAILY",
};

const CustomerCardSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm animate-pulse">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="h-4 w-36 rounded bg-gray-100" />
        <div className="mt-2 h-3 w-28 rounded bg-gray-100" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-44 rounded bg-gray-100" />
          <div className="h-3 w-full max-w-56 rounded bg-gray-100" />
        </div>
      </div>

      <div className="shrink-0 space-y-2">
        <div className="h-3 w-16 rounded bg-gray-100" />
        <div className="ml-auto h-5 w-8 rounded bg-gray-100" />
      </div>
    </div>
  </div>
);

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]); // current page content from backend
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  // backend pagination state
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // ✅ in-memory cache (same approach as Salary section)
  // key: `${page}:${perPage}:${debouncedSearch}`
  const cacheRef = useRef(new Map());
  // ✅ cancel inflight request if page/search changes quickly
  const abortRef = useRef(null);

  const cacheKey = useMemo(
    () => `${page}:${perPage}:${debouncedSearch || ""}`,
    [page, perPage, debouncedSearch]
  );

  const clearCustomerCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // ================= DEBOUNCE SEARCH =================
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // ================= LOAD (PAGINATED + SEARCHED BY BACKEND) =================
  const loadCustomers = useCallback(
    async ({ force = false } = {}) => {
      const cached = cacheRef.current.get(cacheKey);

      // ✅ Cache hit -> return immediately unless forced refresh
      if (!force && cached) {
        setCustomers(Array.isArray(cached.content) ? cached.content : []);
        setTotalPages(Number(cached.totalPages) || 1);
        setTotalElements(Number(cached.totalElements) || 0);
        setError("");
        setLoading(false);
        return;
      }

      // cancel previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setLoading(true);
        setError("");

        const res = await axiosAPI.get("/admin/customers", {
          params: {
            page,
            size: perPage,
            search: debouncedSearch || "",
          },
          signal: controller.signal,
        });

        const data = res.data || {};
        const content = Array.isArray(data.content) ? data.content : [];

        setCustomers(content);
        setTotalPages(Number(data.totalPages) || 1);
        setTotalElements(Number(data.totalElements) || 0);

        // cache the whole page response
        cacheRef.current.set(cacheKey, data);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

        console.error("Failed to load customers:", err);
        setError("Failed to load customers. Please try again.");
        setCustomers([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    },
    [cacheKey, debouncedSearch, page, perPage]
  );

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // cleanup inflight request on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

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

      clearCustomerCache();
      setShowForm(false);
      setForm(emptyCustomer);
      setEditMode(false);

      await loadCustomers({ force: true });
    } catch (err) {
      console.error("Failed to save customer:", err);
      alert("Failed to save customer.");
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE =================
  const deleteCustomer = async (nic) => {
    const ok = window.confirm("Are you sure you want to delete this customer?");
    if (!ok) return;

    try {
      await axiosAPI.delete(`admin/customers/${nic}`);

      clearCustomerCache();
      setShowCustomerDetails(false);
      setSelectedCustomer(null);

      await loadCustomers({ force: true });
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
      bank: customer.bank || "",
      bankAccount: customer.bankAccount || "",
    });
    setShowLoanForm(true);
  };

  const saveLoan = async () => {
    if (!loanForm.loanAmount || !loanForm.interestRate || !loanForm.numberOfInstallments) {
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
        documentCharge: loanForm.documentCharge ? Number(loanForm.documentCharge) : 0,
        numberOfInstallments: Number(loanForm.numberOfInstallments),
        customerId: Number(loanForm.customerId),
      };

      await axiosAPI.post(`admin/loans`, payload);

      clearCustomerCache();
      setShowLoanForm(false);
      setLoanForm(emptyLoanForm);

      if (selectedCustomer) {
        const res = await axiosAPI.get(`admin/customers/${selectedCustomer.nic}`);
        setSelectedCustomer(res.data);
      }

      await loadCustomers({ force: true });
    } catch (err) {
      console.error("Failed to add loan:", err);
      setLoanError("Failed to add loan.");
    } finally {
      setLoanSaving(false);
    }
  };

  const startIndex = totalElements === 0 ? 0 : (page - 1) * perPage + 1;
  const endIndex = Math.min(page * perPage, totalElements);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Customer Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage customers and their loans</p>
          <p className="text-gray-400 text-xs mt-1">
            Showing {startIndex}–{endIndex} of {totalElements}
          </p>
        </div>

        <button
          onClick={() => {
            setForm(emptyCustomer);
            setEditMode(false);
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-sm transition"
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

      {/* SEARCH (backend) */}
      <div className="relative mb-4 w-full max-w-md sm:mb-6 lg:mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-10 bg-white shadow-sm"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ===================== MOBILE LIST (cards) ===================== */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <CustomerCardSkeleton key={index} />)
        ) : (
          customers.map((c) => (
            <div
              key={c.nic}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:bg-gray-50"
              onClick={() => viewCustomer(c)}
              role="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="mt-1 text-xs text-gray-500 break-all">NIC: {c.nic}</p>

                  <div className="mt-3 grid grid-cols-1 gap-1 text-xs text-gray-600">
                    <p className="break-all">
                      <span className="text-gray-500">Phone:</span> {c.phoneNumber || "No phone"}
                    </p>
                    <p className="break-all">
                      <span className="text-gray-500">Email:</span> {c.email || "No email"}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-gray-500">Loan Count</p>
                  <p className="text-sm font-bold text-gray-900">{c.loans?.length ?? 0}</p>
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && customers.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400">
            No customers found
          </div>
        )}
      </div>

      {/* ===================== CUSTOMER TABLE (md+) ===================== */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-gray-200 text-sm">
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
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-40 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.nic}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => viewCustomer(c)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-gray-600">{c.nic}</td>
                    <td className="px-6 py-4 text-gray-600">{c.phoneNumber || "No phone"}</td>
                    <td className="px-6 py-4 text-gray-600">{c.email || "No email"}</td>
                    <td className="px-6 py-4 text-gray-600">{c.loans?.length ?? 0}</td>
                  </tr>
                ))
              )}

              {!loading && customers.length === 0 && (
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

      {/* PAGINATION (backend) */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 sm:mt-8 gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded text-sm ${page === i + 1 ? "bg-black text-white" : "bg-white"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* CUSTOMER DETAILS MODAL */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCustomerDetails(false)}
          />

          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-4 sm:p-6 z-10">
            <div className="flex justify-between items-start gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">Customer Details</h2>
              <button
                onClick={() => setShowCustomerDetails(false)}
                className="text-gray-500 hover:text-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg border text-sm">
                <div>
                  <span className="font-medium text-gray-500">NIC</span>
                  <p className="text-gray-900 break-all">{selectedCustomer.nic}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Name</span>
                  <p className="text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Email</span>
                  <p className="text-gray-900 break-all">{selectedCustomer.email || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Phone Number</span>
                  <p className="text-gray-900 break-all">{selectedCustomer.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Address</span>
                  <p className="text-gray-900 break-words">{selectedCustomer.address || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Bank Details</span>
                  {selectedCustomer.bank != null ? (
                    <p className="text-gray-900 break-all">
                      {selectedCustomer.bank} <br />
                      {selectedCustomer.bankAccount}
                    </p>
                  ) : (
                    <p className="text-gray-900">N/A</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-3">
                  <h2 className="font-semibold text-gray-800">Loans</h2>
                  <button
                    onClick={() => openAddLoan(selectedCustomer)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1 bg-black hover:bg-gray-800 text-white px-3 py-2 sm:py-1.5 text-sm rounded-md transition"
                  >
                    <DollarSign size={14} />
                    Add Loan
                  </button>
                </div>

                {selectedCustomer.loans?.length > 0 ? (
                  <>
                    <div className="md:hidden space-y-3">
                      {selectedCustomer.loans.map((loan, idx) => (
                        <div key={idx} className="rounded-lg border bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">File No.</p>
                              <p className="font-semibold text-gray-900 break-all">
                                {loan.fileNumber}
                              </p>

                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-gray-500">Amount</p>
                                  <p className="text-gray-900">{loan.amount}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Interest</p>
                                  <p className="text-gray-900">{loan.interestRate}%</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Installments</p>
                                  <p className="text-gray-900">{loan.noOfInstallments}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Status</p>
                                  <p
                                    className={`${loan.status == "PENDING"
                                        ? "text-red-500"
                                        : "text-gray-900"
                                      }`}
                                  >
                                    {loan.status || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 text-xs text-gray-500">
                                Entered By:{" "}
                                <span className="text-gray-900">
                                  {loan.enteredBy?.firstName} {loan.enteredBy?.lastName}
                                </span>
                                <div className="text-[11px] text-gray-400 break-all">
                                  {loan.enteredBy?.nic}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 text-right text-xs text-gray-500">
                              <p>Created</p>
                              <p className="text-gray-900">{loan.createdAt || "-"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="hidden md:block overflow-x-auto border rounded-lg">
                      <table className="min-w-[900px] w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 text-center">
                          <tr>
                            <th className="px-4 py-2 font-semibold text-gray-600">
                              File No.
                            </th>
                            <th className="px-4 py-2 font-semibold text-gray-600">
                              Amount
                            </th>
                            <th className="px-4 py-2 font-semibold text-gray-600">
                              Interest
                            </th>
                            <th className="px-4 py-2 font-semibold text-gray-600">
                              Installments
                            </th>
                            <th className="px-4 py-2 font-semibold text-gray-600">
                              Status
                            </th>
                            <th className="px-4 py-2 font-semibold text-gray-600">
                              Created At
                            </th>
                            <th className="px-4 py-2 font-semibold text-gray-600">
                              Entered By
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-center">
                          {selectedCustomer.loans.map((loan, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium">{loan.fileNumber}</td>
                              <td className="px-4 py-2">{loan.amount}</td>
                              <td className="px-4 py-2">{loan.interestRate}%</td>
                              <td className="px-4 py-2">{loan.noOfInstallments}</td>
                              <td
                                className={`px-4 py-2 ${loan.status == "PENDING" ? "text-red-500" : ""
                                  }`}
                              >
                                {loan.status || "-"}
                              </td>
                              <td className="px-4 py-2">{loan.createdAt || "-"}</td>
                              <td className="px-4 py-2">
                                {loan.enteredBy?.firstName} {loan.enteredBy?.lastName}
                                <div className="text-xs text-gray-400">{loan.enteredBy?.nic}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm py-4">No loans available</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCustomerDetails(false);
                    setForm(selectedCustomer);
                    setEditMode(true);
                    setShowForm(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700 text-sm transition"
                >
                  <Edit size={14} />
                  Edit
                </button>

                <button
                  onClick={() => deleteCustomer(selectedCustomer.nic)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 text-sm transition"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOMER DIALOG */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Customer" : "Add Customer"}</DialogTitle>
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
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <Input
              placeholder="Phone"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            />

            <Input
              placeholder="Bank Name"
              value={form.bank}
              onChange={(e) => setForm({ ...form, bank: e.target.value })}
            />

            <Input
              placeholder="Bank Account Number"
              value={form.bankAccount}
              onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
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
        <DialogContent className="w-[calc(100%-1.5rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Loan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-500 break-words">
              Customer: <b>{loanForm.name}</b> (NIC: {loanForm.customerId})
            </p>

            {loanError && (
              <div className="p-3 rounded bg-red-50 text-red-600 text-sm">
                {loanError}
              </div>
            )}

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
              placeholder="Number of Installments"
              value={loanForm.numberOfInstallments}
              onChange={(e) =>
                setLoanForm({ ...loanForm, numberOfInstallments: e.target.value })
              }
            />

            <select
              name="loanType"
              value={loanForm.loanType}
              onChange={(e) => setLoanForm({ ...loanForm, loanType: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="DAILY">Dialy</option>
              <option value="WEEKLY">Weekly</option>
            </select>

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