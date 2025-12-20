import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: { _id: any; category_name: string } | null;
}

export function AddCategoryModal({ isOpen, onClose, category }: AddCategoryModalProps) {
    const [categoryName, setCategoryName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createCategory = useMutation(api.productCategories.create);
    const updateCategory = useMutation(api.productCategories.update);

    // Update form when category prop changes
    useEffect(() => {
        if (category) {
            setCategoryName(category.category_name);
        } else {
            setCategoryName("");
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            toast.error("Category name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            if (category) {
                await updateCategory({
                    id: category._id,
                    category_name: categoryName.trim()
                });
                toast.success("Category updated successfully");
            } else {
                await createCategory({ category_name: categoryName.trim() });
                toast.success("Category created successfully");
            }
            setCategoryName("");
            onClose();
        } catch (error: any) {
            toast.error(error.message || `Failed to ${category ? 'update' : 'create'} category`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setCategoryName("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={category ? "Edit Category" : "Add Category"}
        >
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/10">
                <div className="p-8 space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text font-display">
                            {category ? "Update Category" : "New Category"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Organize your products by grouping them into meaningful categories.
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 ml-1">
                                Category Name
                            </label>
                            <Input
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="e.g. Rice, Spices, Beverages"
                                disabled={isSubmitting}
                                className="h-12 border-emerald-500/10 focus:border-emerald-500/30 bg-gray-50 dark:bg-dark-bg/50"
                            />
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4 border-t border-emerald-500/10">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-6 h-12 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-10 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-bold uppercase tracking-wider text-xs transition-all active:scale-95"
                            >
                                {isSubmitting
                                    ? (category ? "Updating..." : "Creating...")
                                    : (category ? "Update Category" : "Confirm & Create")
                                }
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}

