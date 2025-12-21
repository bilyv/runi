import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Users,
  Package,
  ShoppingCart,
  LineChart,
  Wallet,
  Search,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PermissionGroup {
  id: string;
  label: string;
  icon: any;
  permissions: Permission[];
}

export function RolesAndPermissions() {
  const staff = useQuery(api.staff.list);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("product");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedStaff = staff?.find(s => s._id === selectedStaffId);

  // Hardcoded UI implementation of permissions
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([
    {
      id: "product",
      label: "Product",
      icon: Package,
      permissions: [
        { id: "p1", name: "View Inventory", description: "Allow staff to see product list and stock levels", enabled: true },
        { id: "p2", name: "Add Products", description: "Allow staff to create new product entries", enabled: false },
        { id: "p3", name: "Edit Products", description: "Allow staff to modify existing product details", enabled: false },
        { id: "p4", name: "Manage Categories", description: "Allow staff to create and edit product categories", enabled: true },
      ]
    },
    {
      id: "sales",
      label: "Sales",
      icon: ShoppingCart,
      permissions: [
        { id: "s1", name: "Process Sales", description: "Allow staff to use the POS and create orders", enabled: true },
        { id: "s2", name: "Apply Discounts", description: "Allow staff to apply custom discounts to orders", enabled: false },
        { id: "s3", name: "Issue Refunds", description: "Allow staff to process order returns and refunds", enabled: false },
        { id: "s4", name: "View Sales History", description: "Allow staff to view past sales records", enabled: true },
      ]
    },
    {
      id: "cash-tracking",
      label: "Cash Tracking",
      icon: LineChart,
      permissions: [
        { id: "c1", name: "Open/Close Register", description: "Allow staff to open and close daily cash registers", enabled: true },
        { id: "c2", name: "View Cash Flows", description: "Allow staff to see all cash movements", enabled: false },
        { id: "c3", name: "Perform Cash Payouts", description: "Allow staff to record cash leaving the register", enabled: false },
        { id: "c4", name: "Cash Reconciliation", description: "Allow staff to perform end-of-day cash counts", enabled: true },
      ]
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: Wallet,
      permissions: [
        { id: "e1", name: "View Expenses", description: "Allow staff to see the list of business expenses", enabled: true },
        { id: "e2", name: "Record Expenses", description: "Allow staff to log new business expenditures", enabled: false },
        { id: "e3", name: "Approve Expenses", description: "Allow staff to approve pending expense reports", enabled: false },
        { id: "e4", name: "Manage Vendors", description: "Allow staff to add or edit vendor information", enabled: true },
      ]
    }
  ]);

  const togglePermission = (groupId: string, permissionId: string) => {
    setPermissionGroups(groups => groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          permissions: group.permissions.map(p =>
            p.id === permissionId ? { ...p, enabled: !p.enabled } : p
          )
        };
      }
      return group;
    }));
  };

  const filteredStaff = staff?.filter(s =>
    s.staff_full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[600px] bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Roles & Permissions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage access levels for your staff members</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Staff List */}
        <div className="w-80 border-r border-gray-100 dark:border-white/5 flex flex-col">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
            {staff === undefined ? (
              // Loading state
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse mx-2" />
              ))
            ) : filteredStaff && filteredStaff.length > 0 ? (
              filteredStaff.map((member) => (
                <button
                  key={member._id}
                  onClick={() => setSelectedStaffId(member._id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                    selectedStaffId === member._id
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase",
                    selectedStaffId === member._id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                  )}>
                    {member.staff_full_name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left truncate">
                    <p className={cn(
                      "font-semibold text-sm truncate",
                      selectedStaffId === member._id ? "text-white" : "text-gray-900 dark:text-white"
                    )}>
                      {member.staff_full_name}
                    </p>
                    <p className={cn(
                      "text-xs truncate",
                      selectedStaffId === member._id ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {member.email_address}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    selectedStaffId === member._id ? "text-white opacity-100 translate-x-1" : "text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100"
                  )} />
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Users className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No staff members found</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Permissions */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-transparent">
          {selectedStaff ? (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedStaff.staff_full_name}
                    <span className="text-sm font-normal px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg">
                      Staff Member
                    </span>
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Configure what this user can access and perform.</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                    Reset to Default
                  </button>
                  <button className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl mb-8 w-fit">
                {permissionGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setActiveTab(group.id)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                        activeTab === group.id
                          ? "bg-white dark:bg-white/10 text-primary shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", activeTab === group.id ? "text-primary" : "text-gray-400")} />
                      {group.label}
                      {activeTab === group.id && (
                        <motion.div
                          layoutId="activeTabGlow"
                          className="absolute inset-0 rounded-xl bg-primary/5 dark:bg-primary/10"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {permissionGroups.find(g => g.id === activeTab)?.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className={cn(
                        "p-5 rounded-2xl border transition-all cursor-pointer group",
                        permission.enabled
                          ? "bg-white dark:bg-white/5 border-primary/20 shadow-sm"
                          : "bg-gray-50/50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5"
                      )}
                      onClick={() => togglePermission(activeTab, permission.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base">
                              {permission.name}
                            </h4>
                            {permission.enabled && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {permission.description}
                          </p>
                        </div>
                        <div className={cn(
                          "w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative flex items-center",
                          permission.enabled ? "bg-primary" : "bg-gray-200 dark:bg-white/10"
                        )}>
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm",
                            permission.enabled ? "translate-x-6" : "translate-x-0"
                          )} />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="md:col-span-2 p-6 mt-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl flex gap-4 items-start">
                    <AlertCircle className="w-6 h-6 text-orange-500 shrink-0" />
                    <div>
                      <h5 className="font-bold text-orange-900 dark:text-orange-400">Security Warning</h5>
                      <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1">
                        Changes to permissions will take effect immediately. The staff member may need to refresh their page to see some changes reflected in the UI.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select a Staff Member</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
                Choose a staff member from the left sidebar to manage their access permissions and roles.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}