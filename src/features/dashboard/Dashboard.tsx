import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../lib/utils";
import { LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

// Import Recharts components
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import {
  DollarSign,
  Package,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";

// Define the type for our stat cards
type StatCardData = {
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
};

// Define types for chart data
type ChartDataPoint = {
  name: string;
  value: number;
};

type FinancialOverviewData = {
  revenue: number;
  profit: number;
  expenses: number;
  damages: number;
};

type ChartPeriod = "daily" | "weekly" | "monthly";

export function Dashboard() {
  const stats = useQuery(api.dashboard.getStats, { period: "monthly" });
  const currentUser = useCurrentUser();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("monthly");
  const [activeChart, setActiveChart] = useState(0); // For mobile slideshow

  // Update stats when chart period changes
  const statsWithPeriod = useQuery(api.dashboard.getStats, { period: chartPeriod });

  if (!stats || !statsWithPeriod) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate if low stock is critical (more than 5 items)
  const isLowStockCritical = stats.lowStockCount > 5;

  // Create stat cards data
  const statCards: StatCardData[] = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "green",
      indicator: {
        value: parseFloat(stats.revenueGrowth.toFixed(1)),
        isPositive: stats.revenueGrowth >= 0
      }
    },
    {
      title: "Products in Stock",
      value: stats.totalProductsInStock.toString(),
      icon: Package,
      color: "blue",
      detail: `${stats.productTypes} types, ${stats.fishTypes} fish`
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockCount.toString(),
      icon: AlertTriangle,
      color: "red",
      status: isLowStockCritical ? "critical" : "good"
    },
    {
      title: "Damaged Items",
      value: stats.damagedItemsCount.toString(),
      icon: Zap,
      color: "orange",
      detail: "Daily change and disposal status"
    }
  ];

  // Prepare data for charts
  const revenueChartData = statsWithPeriod.revenueData.map((item, index) => ({
    name: item.name,
    profit: item.value,
    investment: statsWithPeriod.expenseData[index]?.value || 0
  }));

  // Financial overview data
  const financialOverviewData = [
    { name: 'Revenue', value: stats.financialOverview.revenue, color: '#10B981' },
    { name: 'Profit', value: stats.financialOverview.profit, color: '#3B82F6' },
    { name: 'Expenses', value: stats.financialOverview.expenses, color: '#F59E0B' },
    { name: 'Damages', value: stats.financialOverview.damages, color: '#EF4444' }
  ];

  // Calculate total for financial overview center display
  const financialTotal = financialOverviewData.reduce((sum, item) => sum + item.value, 0);

  // Calculate net positive vs total costs
  const netPositive = stats.financialOverview.revenue - stats.financialOverview.expenses;
  const totalCosts = stats.financialOverview.expenses + stats.financialOverview.damages;

  // Handle mobile chart navigation
  const nextChart = () => {
    setActiveChart((prev) => (prev === 1 ? 0 : prev + 1));
  };

  const prevChart = () => {
    setActiveChart((prev) => (prev === 0 ? 1 : prev - 1));
  };

  // Custom tooltip for area chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-card p-4 border border-gray-200 dark:border-dark-border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-dark-text">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-card p-4 border border-gray-200 dark:border-dark-border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-dark-text">{payload[0].name}</p>
          <p className="text-sm text-gray-900 dark:text-dark-text">
            Value: ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-sm text-gray-900 dark:text-dark-text">
            Percentage: {(payload[0].percent * 100).toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-white">
        <h1 className="text-2xl font-bold">Hello {currentUser?.fullName || currentUser?.name || "there"} 👋</h1>
        <p className="text-blue-100 mt-1">Welcome back to your home overview</p>
      </div>

      {/* Stats Cards - Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Stats Cards - Mobile Horizontal Scroll with Auto Animation */}
      <div className="md:hidden auto-scroll-container">
        <div className="auto-scroll-content">
          {/* First set of cards */}
          {statCards.map((card, index) => (
            <div key={`first-${index}`} className="flex-none w-64">
              <StatCard {...card} />
            </div>
          ))}
          {/* Duplicate set for seamless looping */}
          {statCards.map((card, index) => (
            <div key={`second-${index}`} className="flex-none w-64">
              <StatCard {...card} />
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-6">Financial Overview</h2>

        {/* Desktop Layout - 3-column grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {/* Revenue Chart - 2 columns */}
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Revenue Chart</h3>
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value as ChartPeriod)}
                className="px-3 py-1 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
              >
                <option value="daily">This Week</option>
                <option value="weekly">This Month</option>
                <option value="monthly">Last 6 Months</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                    name="Profit"
                  />
                  <Area
                    type="monotone"
                    dataKey="investment"
                    stroke="#F59E0B"
                    fillOpacity={1}
                    fill="url(#colorInvestment)"
                    name="Investment"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Financial Overview - 1 column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Financial Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialOverviewData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent ?? 0 * 100).toFixed(0)}%`}
                  >
                    {financialOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Center display for total value */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                ${financialTotal.toFixed(2)}
              </p>
            </div>

            {/* Summary: Net Positive vs Total Costs */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Net Positive</p>
                  <p className={`font-semibold ${netPositive >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${netPositive.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Costs</p>
                  <p className="font-semibold text-gray-900 dark:text-dark-text">
                    ${totalCosts.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Slideshow */}
        <div className="md:hidden">
          {/* Chart display */}
          <div className="h-64 mb-4">
            {activeChart === 0 ? (
              // Revenue Chart
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Revenue Chart</h3>
                  <select
                    value={chartPeriod}
                    onChange={(e) => setChartPeriod(e.target.value as ChartPeriod)}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
                  >
                    <option value="daily">This Week</option>
                    <option value="weekly">This Month</option>
                    <option value="monthly">Last 6 Months</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueChartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                      name="Profit"
                    />
                    <Area
                      type="monotone"
                      dataKey="investment"
                      stroke="#F59E0B"
                      fillOpacity={1}
                      fill="url(#colorInvestment)"
                      name="Investment"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              // Financial Overview
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4 text-center">Financial Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialOverviewData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent ?? 0 * 100).toFixed(0)}%`}
                    >
                      {financialOverviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center display for total value */}
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-dark-text">
                    ${financialTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            {/* Dots indicator */}
            <div className="flex space-x-2">
              {[0, 1].map((index) => (
                <button
                  key={index}
                  onClick={() => setActiveChart(index)}
                  className={`w-2 h-2 rounded-full ${activeChart === index
                      ? 'bg-blue-600 dark:bg-blue-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                />
              ))}
            </div>

            {/* Arrow buttons */}
            <div className="flex space-x-4">
              <button
                onClick={prevChart}
                className="p-2 rounded-full bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border"
              >
                <ChevronLeft size={16} className="text-gray-700 dark:text-dark-text" />
              </button>
              <button
                onClick={nextChart}
                className="p-2 rounded-full bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border"
              >
                <ChevronRight size={16} className="text-gray-700 dark:text-dark-text" />
              </button>
            </div>
          </div>

          {/* Summary for mobile */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Net Positive</p>
                <p className={`font-semibold ${netPositive >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${netPositive.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Costs</p>
                <p className="font-semibold text-gray-900 dark:text-dark-text">
                  ${totalCosts.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}