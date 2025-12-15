import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
    const [categoryName, setCategoryName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createCategory = useMutation(api.productCategories.create);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            toast.error("Category name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await createCategory({ category_name: categoryName.trim() });
            toast.success("Category created successfully");
            setCategoryName("");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to create category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setCategoryName("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Category">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Category Name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    required
                    disabled={isSubmitting}
                />

                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create Category"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
