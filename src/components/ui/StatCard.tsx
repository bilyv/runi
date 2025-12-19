import { LucideIcon } from "lucide-react";

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
  blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  green: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  red: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  orange: "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
};

const borderColorClasses = {
  blue: "border-blue-200 dark:border-blue-800",
  green: "border-green-200 dark:border-green-800",
  purple: "border-purple-200 dark:border-purple-800",
  red: "border-red-200 dark:border-red-800",
  orange: "border-orange-200 dark:border-orange-800",
};

const statusColorClasses = {
  critical: "text-red-600 dark:text-red-400",
  good: "text-green-600 dark:text-green-400",
};

export function StatCard({ title, value, icon: Icon, color, indicator, detail, status }: StatCardProps) {
  return (
    <div className={`bg-white dark:bg-dark-card rounded-lg border ${borderColorClasses[color]} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-text mt-1">{value}</p>
          {detail && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{detail}</p>
          )}
          {status && (
            <p className={`text-sm font-medium mt-1 ${statusColorClasses[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      {indicator && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${indicator.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {indicator.isPositive ? '↑' : '↓'} {Math.abs(indicator.value)}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}