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
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Header */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">
                            {category ? "Edit Category" : "Add Category"}
                        </h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-dark-text mb-1">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text transition-colors"
                                    placeholder="Enter category name"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? (category ? "Updating..." : "Creating...")
                                    : (category ? "Update Category" : "Create Category")
                                }
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}

