import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Loader2 } from "lucide-react";

interface MarkAsPaidDialogProps {
    isOpen: boolean;
    onClose: () => void;
    clientName: string;
    totalOwed: number;
}

export function MarkAsPaidDialog({
    isOpen,
    onClose,
    clientName,
    totalOwed,
}: MarkAsPaidDialogProps) {
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const processPayment = useMutation(api.sales.processDebtorPayment);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError("Please enter a valid amount");
            setIsSubmitting(false);
            return;
        }

        try {
            await processPayment({
                clientName,
                amount: amountNum,
                paymentMethod,
            });
            setAmount("");
            onClose();
        } catch (err) {
            setError("Failed to process payment. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Receive Payment from ${clientName}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total Owed
                    </label>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ${totalOwed.toFixed(2)}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Payment Amount
                    </label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        step="0.01"
                        min="0"
                        max={totalOwed}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Payment Method
                    </label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-4 py-2 bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Check">Check</option>
                        <option value="Mobile Money">Mobile Money</option>
                    </select>
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-2 rounded">
                        {error}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            "Confirm Payment"
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
