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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
          Expense Categories
        </h2>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Category
        </button>
      </div>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Category" : "Create Category"}
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text"
              placeholder="e.g., Office Supplies"
              required
            />
          </div>
          
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budget (Optional)
            </label>
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text"
              placeholder="e.g., 1000"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-dark-card dark:text-dark-text dark:border-dark-border dark:hover:bg-dark-bg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {editingId ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
      
      <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
            Existing Categories
          </h2>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No categories found. Add your first category above.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-dark-border">
            {categories.map((category) => (
              <li key={category._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text">
                      {category.name}
                    </h3>
                    {category.budget && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Budget: ${category.budget.toFixed(2)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}