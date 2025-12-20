import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Package, Trash2, Edit3, DollarSign, Box, Scale } from "lucide-react";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  categoryName: string;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  categoryName,
  onEdit,
  onDelete,
}: ProductDetailModalProps) {
  if (!product) return null;

  const profitBox = (product.price_per_box || 0) - (product.cost_per_box || 0);
  const profitKg = (product.price_per_kg || 0) - (product.cost_per_kg || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details">
      <div className="space-y-6 mt-2">
        {/* Basic Info */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Package size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h4>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wider">
              {categoryName}
            </p>
          </div>
        </div>

        {/* Stock Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Box size={14} />
              <span className="text-xs font-medium">Boxes</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {product.quantity_box || 0}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Scale size={14} />
              <span className="text-xs font-medium">KG Stock</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {product.quantity_kg || 0}
            </p>
          </div>
        </div>

        {/* Pricing & Profit */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <DollarSign size={16} />
                <span className="text-sm font-bold">Profit Analysis</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Per Box</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">${profitBox.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">Per KG</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">${profitKg.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">Selling (Box)</p>
              <p className="font-bold text-gray-900 dark:text-white">${(product.price_per_box || 0).toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">Cost (Box)</p>
              <p className="font-bold text-gray-900 dark:text-white">${(product.cost_per_box || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <Button
            variant="secondary"
            className="flex-1 bg-white/50 dark:bg-white/10 border-white/20 backdrop-blur-sm"
            onClick={() => {
              onClose();
              onEdit(product);
            }}
          >
            <Edit3 size={16} className="mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="flex-1 shadow-lg shadow-red-500/20"
            onClick={() => {
              onClose();
              onDelete(product);
            }}
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
