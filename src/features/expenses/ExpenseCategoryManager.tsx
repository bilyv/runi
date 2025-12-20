import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Modal } from "../../components/ui/Modal";

export function ExpenseCategoryManager() {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [editingId, setEditingId] = useState<Id<"expensecategory"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const categories = useQuery(api.expenseCategories.list);
  const createCategory = useMutation(api.expenseCategories.create);
  const updateCategory = useMutation(api.expenseCategories.update);
  const deleteCategory = useMutation(api.expenseCategories.remove);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await updateCategory({
          id: editingId,
          name,
          budget: budget ? parseFloat(budget) : undefined,
        });
        setEditingId(null);
      } else {
        await createCategory({
          name,
          budget: budget ? parseFloat(budget) : undefined,
        });
        setIsModalOpen(false);
      }
      setName("");
      setBudget("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const openCreateModal = () => {
    setName("");
    setBudget("");
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setName(category.name);
    setBudget(category.budget || "");
    setEditingId(category._id);
    setIsModalOpen(true);
  };

  const handleEdit = (category: any) => {
    openEditModal(category);
  };

  const handleDelete = async (id: Id<"expensecategory">) => {
    try {
      await deleteCategory({ id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const handleCancel = () => {
    setName("");
    setBudget("");
    setEditingId(null);
  };

  if (!categories) {
    return <div>Loading categories...</div>;
  }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm p-6 rounded-3xl border border-gray-200/50 dark:border-white/5 shadow-xl">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
            Expense Categories
          </h2>
          <Button onClick={openCreateModal}>
            Create Category
          </Button>
        </div>
        
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Category" : "Create Category"}
        >
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-500/20 text-sm font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">
                Category Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all outline-none"
                placeholder="e.g., Office Supplies"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="budget" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-1">
                Budget (Optional)
              </label>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all outline-none"
                placeholder="e.g., 1000"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">{editingId ? "Update" : "Create"}</Button>
            </div>
          </form>
        </Modal>
        
        <div className="overflow-hidden rounded-3xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm shadow-xl">
          <div className="p-7 border-b border-gray-200/50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Existing Categories</h2>
          </div>
          
          {categories.length === 0 ? (
            <div className="p-16 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
              No categories found. Add your first category above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200/50 dark:border-white/5">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Category Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Budget</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                  {categories.map((category) => (
                    <tr key={category._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white font-display">{category.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{category.budget ? `$${category.budget.toFixed(2)}` : "-"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(category)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(category._id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
}