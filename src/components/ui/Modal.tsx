import { useEffect } from "react";
import { Portal } from "./Portal";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, children, title, className = "" }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
              {/* Backdrop with Blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-[8px]"
              />

              {/* Glowing background effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute pointer-events-none"
              >
                <div className="w-[400px] h-[400px] bg-indigo-500/20 dark:bg-indigo-600/15 rounded-full blur-[120px] animate-pulse" />
              </motion.div>

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className={`
                  relative w-full max-w-sm overflow-hidden
                  bg-white/70 dark:bg-dark-card/70 backdrop-blur-3xl
                  rounded-[2.5rem] border border-white/30 dark:border-white/10
                  shadow-[0_25px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.4)]
                  font-display tracking-tight ${className}
                `}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-7 pb-3">
                  {title && (
                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white">
                      {title}
                    </h3>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-white/10 transition-all group"
                  >
                    <X className="w-4 h-4 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-7 pb-7">
                  <div className="text-gray-600 dark:text-gray-300 font-body text-sm leading-relaxed">
                    {children}
                  </div>
                </div>
              </motion.div>
            </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
