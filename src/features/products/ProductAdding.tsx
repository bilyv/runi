import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface ProductAddingProps {
    onAddProduct: () => void;
}

export function ProductAdding({ onAddProduct }: ProductAddingProps) {
    return (
        <div className="space-y-6">
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                    <Plus size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">
                    Add New Product
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Click the button below to add a new product to your inventory. You can specify details like name, SKU, category, pricing, and stock levels.
                </p>
                <Button
                    variant="primary"
                    onClick={onAddProduct}
                    className="flex items-center gap-2 mx-auto"
                >
                    <Plus size={16} />
                    Add New Product
                </Button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-dark-border">
                <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                    <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">Import Products</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Bulk import products from CSV or Excel file
                    </p>
                    <Button variant="secondary" className="w-full text-sm">
                        Import File
                    </Button>
                </div>

                <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                    <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">Bulk Update</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Update multiple products at once
                    </p>
                    <Button variant="secondary" className="w-full text-sm">
                        Bulk Edit
                    </Button>
                </div>

                <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                    <h3 className="font-medium text-gray-900 dark:text-dark-text mb-2">Templates</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Use product templates for faster entry
                    </p>
                    <Button variant="secondary" className="w-full text-sm">
                        View Templates
                    </Button>
                </div>
            </div>
        </div>
    );
}
