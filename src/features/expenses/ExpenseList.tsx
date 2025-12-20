import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "convex/dist/esm/types";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";

export function ExpenseList() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState<Id<"expensecategory"> | "">("");
  
  const expenses = useQuery(api.expenses.list, {
    ...(categoryId && { categoryId: categoryId as Id<"expensecategory"> }),
  });
  
  const categories = useQuery(api.expenseCategories.list);
  const deleteExpense = useMutation(api.expenses.remove);

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM dd, yyyy");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleDelete = async (id: Id<"expenses">) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense({ id });
      } catch (error) {
        console.error("Failed to delete expense:", error);
        alert("Failed to delete expense");
      }
    }
  };

  if (!expenses || !categories) {
    return <div>Loading expenses...</div>;
  }

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-white/5 p-7 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="startDate" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-200 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all outline-none"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="endDate" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-200 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all outline-none"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">
                Category
              </label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value as Id<"expensecategory"> | "")}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-dark-bg/50 border border-gray-200 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Expenses Table */}
        <div className="overflow-hidden rounded-3xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm shadow-xl">
          <div className="p-7 border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/[0.01]">
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
              All Expenses <span className="text-indigo-500 opacity-50 font-medium ml-1">({expenses.length})</span>
            </h2>
          </div>
          
          {expenses.length === 0 ? (
            <div className="p-16 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
              No expenses found. Create your first expense using the "Create Expenses" tab.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200/50 dark:border-white/5">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Expense Title</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Category</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Amount</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Receipt</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Status</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                  {expenses.map((expense) => {
                    const category = categories.find(c => c._id === expense.categoryId);
                    return (
                      <tr key={expense._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white font-display">{expense.title}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {category ? category.name : "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(expense.amount)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.receiptUrl ? (
                            <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline">
                              View Receipt
                            </a>
                          ) : (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 opacity-50">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            expense.status === "paid" 
                              ? "bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                              : "bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                          }`}>
                            {expense.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => console.log("Edit expense", expense._id)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(expense._id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
}