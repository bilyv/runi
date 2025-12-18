import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "../../features/dashboard/Dashboard";
import { Products } from "../../features/products/Products";
import { Sales } from "../../features/sales/Sales";
import { Expenses } from "../../features/expenses/Expenses";
import { Documents } from "../../features/documents/Documents";
import { Reports } from "../../features/reports/Reports";
import { Users } from "../../features/users/Users";
import { Settings } from "../../features/settings/Settings";
import { Transactions } from "../../features/transactions/Transactions";
import { useNavigate, useParams } from "react-router-dom";

export type ModuleType =
  | "dashboard"
  | "products"
  | "sales"
  | "expenses"
  | "documents"
  | "reports"
  | "users"
  | "settings"
  | "transactions";

import { Navbar } from "./Navbar";
import { BarChart3, Package, Menu, Receipt, FileText } from "lucide-react";

export function BusinessDashboard() {
  const [activeModule, setActiveModule] = useState<ModuleType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { module } = useParams<{ module: string }>();

  // Set active module based on URL parameter
  useEffect(() => {
    if (module && isValidModule(module)) {
      setActiveModule(module as ModuleType);
    } else {
      // Default to dashboard if no valid module is specified
      setActiveModule("dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [module, navigate]);

  // Validate if the module is a valid ModuleType
  const isValidModule = (module: string): module is ModuleType => {
    const validModules: ModuleType[] = [
      "dashboard",
      "products",
      "sales",
      "expenses",
      "documents",
      "reports",
      "users",
      "settings",
      "transactions"
    ];
    return validModules.includes(module as ModuleType);
  };

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <Products />;
      case "sales":
        return <Sales />;
      case "expenses":
        return <Expenses />;
      case "documents":
        return <Documents />;
      case "reports":
        return <Reports />;
      case "users":
        return <Users />;
      case "settings":
        return <Settings />;
      case "transactions":
        return <Transactions />;
      default:
        return <Dashboard />;
    }
  };

  // Bottom navigation items for mobile
  const bottomNavItems = [
    { id: "dashboard", label: "Home", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:static fixed inset-y-0 left-0 z-30`}>
        <Sidebar activeModule={activeModule} onModuleChange={(module) => {
          setActiveModule(module);
          navigate(`/${module}`);
          // Close sidebar on mobile after selection
          if (window.innerWidth < 768) setSidebarOpen(false);
        }} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-auto md:ml-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto">
          {renderModule()}
        </div>

        {/* Bottom Navigation for mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border z-10">
          <div className="flex justify-around items-center py-2">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id as ModuleType);
                    navigate(`/${item.id}`);
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg ${isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}

            {/* More button to open sidebar */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-gray-500 dark:text-gray-400"
            >
              <Menu size={20} />
              <span className="text-xs mt-1">More</span>
            </button>
          </div>
        </div>

        {/* Add padding to content to prevent overlap with bottom nav */}
        <div className="md:hidden h-16"></div>
      </main>
    </div>
  );
}