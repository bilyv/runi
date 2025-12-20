import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "red" | "orange";
  indicator?: {
    value: number;
    isPositive: boolean;
  };
  detail?: string;
  status?: "critical" | "good";
}

const colorClasses = {
  blue: "bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  green: "bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  purple: "bg-purple-50/50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  red: "bg-red-50/50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  orange: "bg-orange-50/50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

const statusColorClasses = {
  critical: "text-red-600 dark:text-red-400",
  good: "text-emerald-600 dark:text-emerald-400",
};

export function StatCard({ title, value, icon: Icon, color, indicator, detail, status }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-display font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</p>
            <div className="flex flex-col">
              <p className="text-2xl font-display font-black text-gray-900 dark:text-white">{value}</p>

            {detail && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight mt-0.5">{detail}</p>
            )}
            {status && (
              <p className={`text-[11px] font-bold mt-1 uppercase tracking-tight ${statusColorClasses[status]}`}>
                {status}
              </p>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      
      {indicator && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-dark-border/50">
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            indicator.isPositive 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
              : 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          }`}>
            {indicator.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(indicator.value)}%
          </div>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">vs last month</span>
        </div>
      )}
    </div>
  );
}
