import {
  BarChart3,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  TrendingUp,
  UserCheck,
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";
import { ModuleType } from "./BusinessDashboard";
import { SignOutButton } from "../SignOutButton";

interface SidebarProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

const modules = [
  { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
  { id: "products" as const, label: "Products", icon: Package },
  { id: "sales" as const, label: "Sales", icon: ShoppingCart },
  { id: "expenses" as const, label: "Expenses", icon: Receipt },
  { id: "documents" as const, label: "Documents", icon: FileText },
  { id: "reports" as const, label: "Reports & Analytics", icon: TrendingUp },
  { id: "users" as const, label: "Users & Roles", icon: UserCheck },
  { id: "settings" as const, label: "Settings", icon: SettingsIcon },
];

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-r border-gray-200 dark:border-dark-border flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-card/80 backdrop-blur-md">
        <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">Runi</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;

          return (
            <button
              key={module.id}
              onClick={() => onModuleChange(module.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${isActive
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card/50 hover:text-gray-900 dark:hover:text-dark-text"
                }`}
            >
              <Icon
                size={20}
                className={`transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  }`}
              />
              <span className="font-medium">{module.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-dark-border bg-white/80 dark:bg-dark-card/80 backdrop-blur-md">
        <SignOutButton />
      </div>
    </div>
  );
}
