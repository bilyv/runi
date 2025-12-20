import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AllTransactions() {
  const transactions = useQuery(api.transactions.list);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (transactions !== undefined) {
      setIsLoading(false);
    }
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">All Transactions</h2>
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">Loading Transactions</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we load your transaction data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (transactions === undefined || transactions.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">All Transactions</h2>
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-card">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No transactions found
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
        <div className="overflow-hidden rounded-3xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm shadow-xl">
          <div className="p-7 border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/[0.01]">
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">All Transactions</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200/50 dark:border-white/5">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Time</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Product</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Client</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Quantity</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Payment</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                {transactions.map((transaction) => (
                  <tr key={transaction.transaction_id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {new Date(transaction.updated_at).toLocaleString()}
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
                      <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                        {transaction.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${transaction.payment_status === 'completed' ? 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          transaction.payment_status === 'partial' ? 'bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 
                          'bg-red-100/50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                        {transaction.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline">View</button>
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