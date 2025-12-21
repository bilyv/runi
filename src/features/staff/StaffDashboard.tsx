import { useState } from "react";
import { LogOut, LayoutDashboard, ShoppingCart, User, Bell, Settings as SettingsIcon, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { StaffSettings } from "./StaffSettings";

interface StaffDashboardProps {
    staffUser: any;
    onLogout: () => void;
}

export function StaffDashboard({ staffUser, onLogout }: StaffDashboardProps) {
    const [activeTab, setActiveTab] = useState("pos");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { id: "pos", name: "Point of Sale", icon: ShoppingCart },
        { id: "settings", name: "Settings", icon: SettingsIcon },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-200">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 h-16 shadow-sm">
                <div className="h-full px-6 flex items-center justify-between max-w-[1920px] mx-auto">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold font-display tracking-tight text-gray-900 dark:text-white hidden sm:block">
                                Runi <span className="text-blue-500 text-sm font-medium ml-1">Staff</span>
                            </span>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 mr-4 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                                            ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        <ThemeToggle />

                        <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10 mx-2" />

                        <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/5 p-1.5 pr-4 rounded-2xl border border-transparent hover:border-blue-500/20 transition-all group">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden border border-blue-500/20 group-hover:scale-105 transition-transform">
                                {staffUser.id_card_front_url ? (
                                    <img src={staffUser.id_card_front_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                )}
                            </div>
                            <div className="text-left hidden xs:block">
                                <p className="text-xs font-bold text-gray-900 dark:text-white font-display leading-tight">{staffUser.staff_full_name.split(' ')[0]}</p>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Staff</p>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="p-2.5 text-gray-400 hover:text-red-500 transition-colors bg-gray-100 dark:bg-white/5 rounded-xl shadow-sm border border-transparent hover:border-red-500/20"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#111] z-[70] shadow-2xl lg:hidden p-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-xl font-bold font-display text-gray-900 dark:text-white">Menu</span>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${activeTab === item.id
                                                ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30"
                                                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                                            }`}
                                    >
                                        <item.icon size={22} />
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="pt-24 px-4 sm:px-6 pb-12 max-w-[1920px] mx-auto min-h-screen">
                <AnimatePresence mode="wait">
                    {activeTab === "pos" ? (
                        <motion.div
                            key="pos"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-1 gap-6 mb-8">
                                <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-white/5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                                    <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">
                                        Welcome back, {staffUser.staff_full_name.split(' ')[0]}!
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 font-sans text-lg">
                                        You are logged in as a staff member. Ready to process sales?
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-12 shadow-sm border border-gray-100 dark:border-white/5 min-h-[500px] flex flex-col items-center justify-center text-center group">
                                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <ShoppingCart className="w-12 h-12 text-blue-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-display tracking-tight">Point of Sale Terminal</h2>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md font-sans text-lg leading-relaxed">
                                    This interactive area will soon host the sales terminal where you can browse products, add items to cart, and process customer payments.
                                </p>
                                <button className="mt-8 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold font-display shadow-lg hover:translate-y-[-2px] transition-all">
                                    Initialize Terminal
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <StaffSettings staffUser={staffUser} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
