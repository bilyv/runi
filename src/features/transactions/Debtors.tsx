import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Modal } from "../../components/ui/Modal";

export function Debtors() {
  // Get both pending and partial transactions
  const pendingTransactions = useQuery(api.transactions.listByPaymentStatus, { payment_status: "pending" });
  const partialTransactions = useQuery(api.transactions.listByPaymentStatus, { payment_status: "partial" });

  const updateTransaction = useMutation(api.transactions.update);

  const [isLoading, setIsLoading] = useState(true);
  const [allDebtTransactions, setAllDebtTransactions] = useState<Array<{
    _id: Id<"transactions">;
    _creationTime: number;
    transaction_id: string;
    sales_id: Id<"sales">;
    user_id: Id<"users">;
    product_name: string;
    client_name: string;
    boxes_quantity: number;
    kg_quantity: number;
    total_amount: number;
    payment_status: "pending" | "partial" | "completed";
    payment_method: string;
    updated_by: Id<"users">;
    updated_at: number;
  }>>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<{
    _id: Id<"transactions">;
    _creationTime: number;
    transaction_id: string;
    sales_id: Id<"sales">;
    user_id: Id<"users">;
    product_name: string;
    client_name: string;
    boxes_quantity: number;
    kg_quantity: number;
    total_amount: number;
    payment_status: "pending" | "partial" | "completed";
    payment_method: string;
    updated_by: Id<"users">;
    updated_at: number;
  } | null>(null);
  const [amountPaid, setAmountPaid] = useState('');

  useEffect(() => {
    if (pendingTransactions !== undefined && partialTransactions !== undefined) {
      // Combine both arrays
      const combined = [...(pendingTransactions || []), ...(partialTransactions || [])];
      // Sort by updated_at descending
      combined.sort((a, b) => b.updated_at - a.updated_at);
      setAllDebtTransactions(combined);
      setIsLoading(false);
    }
  }, [pendingTransactions, partialTransactions]);

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">Unpaid/Debtors</h2>
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">Loading Debt Records</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we load your debt records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (allDebtTransactions.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">Unpaid/Debtors</h2>
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-card">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No debt records found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm shadow-xl mt-6">
          <div className="p-7 border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/[0.01]">
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Unpaid/Debtors</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200/50 dark:border-white/5">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Transaction ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Product</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Client</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Quantity</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Total</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                {allDebtTransactions.map((transaction) => (
                  <tr key={transaction.transaction_id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                      {transaction.transaction_id.split('-').slice(0, 2).join('-')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white font-display">{transaction.product_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {transaction.client_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{transaction.boxes_quantity} Boxes</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{transaction.kg_quantity} KG</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">${transaction.total_amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${transaction.payment_status === 'partial' ? 'bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-red-100/50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                        {transaction.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowModal(true);
                        }}
                        className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Mark Paid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
}