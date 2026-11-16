import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import axiosAPI from "@/api/axiosAPI";
import { formatLoanDateTime } from "./loanDateTime";

const formatLKR = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(Number(amount) || 0);

const Info = ({ label, children }) => (
  <div className="min-w-0">
    <p className="mb-1 text-xs text-gray-500">{label}</p>
    <div className="break-words text-sm font-medium text-gray-800">
      {children}
    </div>
  </div>
);

const LoanDetailsPaymentPanel = ({ loan, customer = loan?.customer, onEdit }) => {
  const [paymentResult, setPaymentResult] = useState(null);
  const [page, setPage] = useState(1);
  const requestKey = loan?.id ? `${loan.id}:${page}` : null;
  const currentResult =
    paymentResult?.key === requestKey ? paymentResult : null;
  const payments = currentResult?.payments || [];
  const totalPages = currentResult?.totalPages || 1;
  const totalElements = currentResult?.totalElements || 0;
  const loading = Boolean(requestKey) && !currentResult;
  const error = currentResult?.error || "";

  useEffect(() => {
    if (!loan?.id) return undefined;

    const controller = new AbortController();

    axiosAPI
      .get(`/admin/loan-summary/${loan.id}/payments`, {
        params: { page, size: 10 },
        signal: controller.signal,
      })
      .then((response) => {
        const data = response.data || {};
        setPaymentResult({
          key: requestKey,
          payments: Array.isArray(data.content) ? data.content : [],
          totalPages: Number(data.totalPages) || 1,
          totalElements: Number(data.totalElements) || 0,
          error: "",
        });
      })
      .catch((requestError) => {
        if (
          requestError?.name === "CanceledError" ||
          requestError?.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Failed to load loan payment history:", requestError);
        setPaymentResult({
          key: requestKey,
          payments: [],
          totalPages: 1,
          totalElements: 0,
          error:
            requestError.response?.data?.message ||
            "Failed to load payment history.",
        });
      });

    return () => controller.abort();
  }, [loan?.id, page, requestKey]);

  return (
    <div className="grid items-start gap-6 p-4 sm:p-6 xl:grid-cols-2">
      <div className="space-y-6">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
              Loan Information
            </h3>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="shrink-0 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900"
              >
                Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
            <Info label="Loan Date">{formatLoanDateTime(loan?.createdAt)}</Info>
            <Info label="Amount">{formatLKR(loan?.amount)}</Info>
            <Info label="Installment Value">{formatLKR(loan?.installmentValue)}</Info>
            <Info label="Document Charge">{formatLKR(loan?.documentCharge)}</Info>
            <Info label="Installments">{loan?.noOfInstallments ?? "-"}</Info>
            <Info label="Interest Rate">{loan?.interestRate ?? 0}%</Info>
            <Info label="Status">{loan?.status || "Not available"}</Info>
            <Info label="Loan Type">{loan?.loanType || "Not available"}</Info>
            <Info label="Entered By">
              {loan?.enteredBy?.id
                ? `${loan.enteredBy.firstName || ""} ${loan.enteredBy.lastName || ""}`.trim()
                : "Not recorded"}
            </Info>
            <Info label="Updated By">
              {loan?.updatedBy?.id
                ? `${loan.updatedBy.firstName || ""} ${loan.updatedBy.lastName || ""}`.trim()
                : "No updates made"}
            </Info>
            <Info label="Approved By">
              {loan?.approvedBy?.id
                ? `${loan.approvedBy.firstName || ""} ${loan.approvedBy.lastName || ""}`.trim()
                : "Approval Pending"}
            </Info>
            <Info label="Loan End Date">
              {loan?.endAt
                ? new Date(`${loan.endAt}T00:00:00`).toLocaleDateString("en-LK", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Not entered"}
            </Info>
            {loan?.decisionNote && (
              <div className="sm:col-span-2">
                <Info label="Decision Note">{loan.decisionNote}</Info>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-base font-semibold text-gray-800 sm:text-lg">
            Customer Information
          </h3>
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
            <Info label="NIC">{customer?.nic || "N/A"}</Info>
            <Info label="Name">{customer?.name || "N/A"}</Info>
            <Info label="Address">{customer?.address || "N/A"}</Info>
            <Info label="Phone">{customer?.phoneNumber || "N/A"}</Info>
            <Info label="Email">{customer?.email || "N/A"}</Info>
            <Info label="Bank">
              {customer?.bank || "N/A"}
              {customer?.bankAccount ? ` / ${customer.bankAccount}` : ""}
            </Info>
          </div>
        </section>
      </div>

      <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Payment History
          </p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">
            Loan {loan?.fileNumber}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Total records</p>
              <p className="mt-1 font-semibold text-gray-900">{totalElements}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Loan type</p>
              <p className="mt-1 font-semibold text-gray-900">{loan?.loanType || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Installment value</p>
              <p className="mt-1 font-semibold text-gray-900">
                {formatLKR(loan?.installmentValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[55vh] min-h-48 overflow-auto">
          {!loan?.id ? (
            <p className="p-6 text-sm text-gray-500" role="status">
              Payment history is unavailable for this loan.
            </p>
          ) : loading ? (
            <div className="flex items-center gap-3 p-6 text-sm text-gray-600" role="status">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={20} />
              Loading payment history...
            </div>
          ) : error ? (
            <p className="p-6 text-sm text-red-600" role="alert">{error}</p>
          ) : payments.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No payment records found.</p>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="sticky top-0 border-b border-gray-200 bg-white text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-3">Installment</th>
                  <th className="px-3 py-3">Paid amount</th>
                  <th className="px-3 py-3">Paid at</th>
                  <th className="px-3 py-3">Processed by</th>
                  <th className="px-3 py-3">Due amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment, index) => {
                  const dueAmount =
                    Number(payment.paidAmount || 0) -
                    Number(loan?.installmentValue || 0);

                  return (
                    <tr key={payment.id || payment.installmentNumber || index}>
                      <td className="px-3 py-3 font-semibold text-gray-900">
                        #{payment.installmentNumber || "—"}
                      </td>
                      <td className="px-3 py-3 font-semibold text-gray-900">
                        {Number(payment.paidAmount) === 0
                          ? "No payment received"
                          : formatLKR(payment.paidAmount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600">
                        {formatLoanDateTime(payment.paidAt)}
                      </td>
                      <td className="px-3 py-3 text-gray-700">
                        {payment.employee?.firstName
                          ? `${payment.employee.firstName} ${payment.employee.lastName || ""}`.trim()
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-gray-700">
                        {formatLKR(dueAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-2">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={loading || page === 1}
                aria-label="Previous payment page"
                className="rounded-md border bg-white p-2 text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft aria-hidden="true" size={16} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((currentPage) => Math.min(totalPages, currentPage + 1))
                }
                disabled={loading || page === totalPages}
                aria-label="Next payment page"
                className="rounded-md border bg-white p-2 text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight aria-hidden="true" size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default LoanDetailsPaymentPanel;
