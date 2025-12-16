import { ReactNode } from "react";
import { X } from "lucide-react";
import { Portal } from "./Portal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
          <div className="relative bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-dark-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
