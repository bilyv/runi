import { Package, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface ProductCategoryProps {
    categories: Array<{ _id: any; category_name: string; _creationTime: number }>;
    onAddCategory: () => void;
    onEditCategory: (category: any) => void;
    onDeleteCategory: (categoryId: any) => void;
}

export function ProductCategory({
    categories,
    onAddCategory,
    onEditCategory,
    onDeleteCategory
}: ProductCategoryProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Product Categories</h2>
                <Button
                    variant="primary"
                    className="flex items-center gap-2"
                    onClick={onAddCategory}
                >
                    <Plus size={16} />
                    Add Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.length > 0 ? (
                    categories.map((cat) => (
                        <div
                            key={cat._id}
                            className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Package size={20} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-dark-text">{cat.category_name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEditCategory(cat)}
                                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        title="Edit category"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteCategory(cat._id)}
                                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete category"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                        No categories found. Click "Add Category" to create one.
                    </div>
                )}
            </div>
        </div>
    );
}
