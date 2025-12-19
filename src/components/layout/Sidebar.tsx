import {
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  TrendingUp,
  UserCheck,
  Settings as SettingsIcon,
  Banknote,
  LayoutGrid
} from "lucide-react";
import { ModuleType } from "./BusinessDashboard";
import { SignOutButton } from "../../features/auth/SignOutButton";

interface SidebarProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

const menuGroups = [
  {
    label: "Main",
    items: [
      { id: "dashboard" as const, label: "Dashboard", icon: LayoutGrid },
      { id: "products" as const, label: "Products", icon: Package },
      { id: "sales" as const, label: "Sales", icon: ShoppingCart },
    ]
  },
  {
    label: "Finance",
    items: [
      { id: "transactions" as const, label: "Transactions", icon: Banknote },
      { id: "expenses" as const, label: "Expenses", icon: Receipt },
    ]
  },
  {
    label: "Resources",
    items: [
      { id: "documents" as const, label: "Documents", icon: FileText },
      { id: "reports" as const, label: "Reports", icon: TrendingUp },
    ]
  },
  {
    label: "System",
    items: [
      { id: "users" as const, label: "Users", icon: UserCheck },
      { id: "settings" as const, label: "Settings", icon: SettingsIcon },
    ]
  }
];

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white dark:bg-[#1a1a1a] border-r border-gray-100 dark:border-white/5 flex flex-col h-full shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <img src="/logo.svg" alt="Runi Logo" className="w-6 h-6 invert brightness-0" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Runi</h1>
        </div>
      </div>

    <nav className="flex-1 px-4 pb-4 overflow-y-auto custom-scrollbar">
      {menuGroups.map((group, groupIdx) => (
        <div key={group.label} className={groupIdx > 0 ? "mt-5" : ""}>
          <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-1.5">
            {group.label}
          </h3>
          <div className="space-y-0.5">
            {group.items.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;

              return (
                <button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left transition-all duration-300 group relative ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`transition-all duration-300 ${
                        isActive 
                          ? "scale-110" 
                          : "group-hover:scale-110 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                      }`}
                    />
                    <span className={`text-sm font-semibold transition-colors ${
                      isActive ? "opacity-100" : "opacity-90 group-hover:opacity-100"
                    }`}>
                      {module.label}
                    </span>
                    {isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5 transition-all hover:border-gray-200 dark:hover:border-white/10 group">
          <SignOutButton />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}} />
    </div>
  );
}
