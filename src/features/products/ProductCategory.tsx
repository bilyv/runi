import { Package, Pencil, Trash2, Plus, Layers } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { motion } from "framer-motion";

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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text font-display">Product Categories</h2>
                    <p className="text-sm text-gray-500">Organize your products into logical groups for better management.</p>
                </div>
                <Button
                    onClick={onAddCategory}
                    className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-bold uppercase tracking-wider text-xs transition-all active:scale-95"
                >
                    <Plus size={18} />
                    New Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.length > 0 ? (
                    categories.map((cat, index) => (
                        <motion.div
                            key={cat._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative bg-white dark:bg-dark-card/50 p-6 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                        <Layers size={24} />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEditCategory(cat)}
                                            className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                            title="Edit category"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteCategory(cat._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete category"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text font-display group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {cat.category_name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                            Inventory
                                        </span>
                                        <span className="text-[10px] text-gray-400 tabular-nums">
                                            Created {new Date(cat._creationTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-emerald-500/5 rounded-3xl border border-dashed border-emerald-500/20">
                        <Package size={48} className="text-emerald-500/20 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text">No categories yet</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-6">Start by creating your first product category.</p>
                        <Button
                            variant="primary"
                            onClick={onAddCategory}
                            className="bg-emerald-500"
                        >
                            Create Category
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
