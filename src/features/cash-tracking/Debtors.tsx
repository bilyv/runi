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
              {allDebtTransactions.map((transaction) => (
                <tr key={transaction.transaction_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">{transaction.transaction_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{transaction.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{transaction.client_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.boxes_quantity} boxes / {transaction.kg_quantity} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${transaction.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${transaction.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {transaction.payment_status === 'partial' ? 'Partial Payment' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{transaction.payment_method}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                    >
                      Mark as Paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark as Paid Modal */}
      <Modal
        isOpen={showModal && !!selectedTransaction}
        onClose={() => {
          setShowModal(false);
          setSelectedTransaction(null);
          setAmountPaid('');
        }}
        title="Mark as Paid"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedTransaction) return;

            // Calculate new payment status
            const newPaymentStatus =
              parseFloat(amountPaid) >= selectedTransaction.total_amount ? 'completed' : 'partial';

            try {
              // Update the transaction
              await updateTransaction({
                transaction_id: selectedTransaction.transaction_id,
                sales_id: selectedTransaction.sales_id,
                user_id: selectedTransaction.user_id,
                product_name: selectedTransaction.product_name,
                client_name: selectedTransaction.client_name,
                boxes_quantity: selectedTransaction.boxes_quantity,
                kg_quantity: selectedTransaction.kg_quantity,
                total_amount: selectedTransaction.total_amount,
                payment_status: newPaymentStatus,
                payment_method: selectedTransaction.payment_method,
                updated_by: selectedTransaction.updated_by, // In a real app, this would be the current user
                updated_at: Date.now(),
              });
            } catch (error) {
              console.error('Error updating transaction:', error);
              // In a real app, you would show an error message to the user
            }

            // Close modal and reset state
            setShowModal(false);
            setSelectedTransaction(null);
            setAmountPaid('');
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
            <input
              type="text"
              value={selectedTransaction?.client_name || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-dark-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Paid</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-card dark:text-dark-text"
              placeholder="Enter amount paid"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setSelectedTransaction(null);
                setAmountPaid('');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-card/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Mark as Paid
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}