import { useState, useEffect } from "react";
import { Banknote, Check, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const currencies = [
    { id: "USD", name: "US Dollar", symbol: "$", code: "USD" },
    { id: "EUR", name: "Euro", symbol: "€", code: "EUR" },
    { id: "RWF", name: "Rwandan Franc", symbol: "FRW", code: "RWF" },
    { id: "UGX", name: "Ugandan Shilling", symbol: "UGX", code: "UGX" },
    { id: "KES", name: "Kenyan Shilling", symbol: "KSh", code: "KES" },
];

export function CurrencySettings() {
    const [selectedCurrency, setSelectedCurrency] = useState(localStorage.getItem("app_currency") || "RWF");

    const handleCurrencyChange = (id: string) => {
        setSelectedCurrency(id);
        localStorage.setItem("app_currency", id);
        // In a real app, this would update the global business settings in the DB
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Business Currency</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set the default currency for all transactions and reports</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencies.map((currency) => (
                    <button
                        key={currency.id}
                        onClick={() => handleCurrencyChange(currency.id)}
                        className={cn(
                            "relative flex flex-col p-5 rounded-[2rem] border transition-all text-left",
                            selectedCurrency === currency.id
                                ? "bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]"
                                : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-900 dark:text-white hover:border-blue-500/30"
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn(
                                "p-2.5 rounded-2xl",
                                selectedCurrency === currency.id ? "bg-white/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            )}>
                                <Banknote size={20} />
                            </div>
                            {selectedCurrency === currency.id && <Check size={20} className="text-white" />}
                        </div>

                        <div className="space-y-1">
                            <div className={cn("text-xs font-bold uppercase tracking-wider opacity-60")}>
                                {currency.code}
                            </div>
                            <div className="text-lg font-bold font-display">
                                {currency.name}
                            </div>
                            <div className={cn("text-2xl font-black mt-2", selectedCurrency === currency.id ? "text-white" : "text-blue-600 dark:text-blue-400")}>
                                {currency.symbol}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex gap-4 items-start">
                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600">
                    <Info size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">Important Note</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1 leading-relaxed">
                        Changing the base currency will update how amounts are displayed across the system. This does not perform automatic currency conversion for existing historical data.
                    </p>
                </div>
            </div>
        </div>
    );
}
