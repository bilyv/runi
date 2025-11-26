import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "./modules/Dashboard";
import { Products } from "./modules/Products";
import { Sales } from "./modules/Sales";
import { Expenses } from "./modules/Expenses";
import { Documents } from "./modules/Documents";
import { Reports } from "./modules/Reports";
import { Users } from "./modules/Users";
import { Settings } from "./modules/Settings";

export type ModuleType =
  | "dashboard"
  | "products"
  | "sales"
  | "expenses"
  | "documents"
  | "reports"
  | "users"
  | "settings";

import { Navbar } from "./Navbar";
import { BarChart3, Package, ShoppingCart, Menu } from "lucide-react";

export function BusinessDashboard() {
  const [activeModule, setActiveModule] = useState<ModuleType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      default:
        return <Dashboard />;
    }
  };

  // Bottom navigation items for mobile
  const bottomNavItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "sales", label: "Sales", icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:static fixed inset-y-0 left-0 z-30`}>
        <Sidebar activeModule={activeModule} onModuleChange={(module) => {
          setActiveModule(module);
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
        <Navbar />
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
                  onClick={() => setActiveModule(item.id as ModuleType)}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg ${
                    isActive 
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