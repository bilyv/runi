import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF';
import {
  FileText,
  Download,
  TrendingUp,
  Package,
  Wallet,
  Calendar as CalendarIcon,
  ChevronRight,
  Loader2,
  Users,
  LineChart,
  Filter
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { cn } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

type ReportType = 'general' | 'sales' | 'top_selling' | 'debtors' | 'pl';
type DateOption = 'today' | 'week' | 'month' | 'custom';

export function Reports() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('general');
  const [dateOption, setDateOption] = useState<DateOption>('month');
  const [customRange, setCustomRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const user = useQuery(api.users.currentUser);

  // Date range logic
  const activeRange = useMemo(() => {
    const now = new Date();
    switch (dateOption) {
      case 'today': return { from: startOfDay(now), to: endOfDay(now) };
      case 'week': return { from: startOfWeek(now), to: endOfWeek(now) };
      case 'month': return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'custom': return { from: startOfDay(new Date(customRange.from)), to: endOfDay(new Date(customRange.to)) };
      default: return { from: startOfMonth(now), to: endOfMonth(now) };
    }
  }, [dateOption, customRange]);

  // Specific Queries
  const generalData = useQuery(api.reports.getGeneralReport,
    (isModalOpen && selectedReportType === 'general') ? { startDate: activeRange.from.getTime(), endDate: activeRange.to.getTime() } : 'skip'
  );
  const salesDataDetailed = useQuery(api.reports.getDetailedSalesReport,
    (isModalOpen && selectedReportType === 'sales') ? { startDate: activeRange.from.getTime(), endDate: activeRange.to.getTime() } : 'skip'
  );
  const topSellingData = useQuery(api.reports.getTopSellingReport,
    (isModalOpen && selectedReportType === 'top_selling') ? { startDate: activeRange.from.getTime(), endDate: activeRange.to.getTime() } : 'skip'
  );
  const debtorData = useQuery(api.reports.getDebtorReport,
    (isModalOpen && selectedReportType === 'debtors') ? {} : 'skip'
  );
  const plData = useQuery(api.reports.getProfitLossReport,
    (isModalOpen && selectedReportType === 'pl') ? { startDate: activeRange.from.getTime(), endDate: activeRange.to.getTime() } : 'skip'
  );

  const isLoading = (selectedReportType === 'general' && generalData === undefined) ||
    (selectedReportType === 'sales' && salesDataDetailed === undefined) ||
    (selectedReportType === 'top_selling' && topSellingData === undefined) ||
    (selectedReportType === 'debtors' && debtorData === undefined) ||
    (selectedReportType === 'pl' && plData === undefined);

  // PDF Data Preparation
  const pdfProps = useMemo(() => {
    if (!isModalOpen) return null;
    const businessName = user?.businessName || 'Runi Business';
    const rangeStr = `${format(activeRange.from, 'PP')} - ${format(activeRange.to, 'PP')}`;

    if (selectedReportType === 'general' && generalData) {
      return {
        title: 'General Report',
        businessName,
        dateRange: rangeStr,
        layout: 'landscape' as const,
        sections: [{
          type: 'table' as const,
          data: generalData,
          columns: [
            { label: 'Product', key: 'productName', width: 90 },
            { label: 'Opening (B/K)', key: 'openingStock', format: (v: any) => `${v.boxes} / ${v.kg.toFixed(1)}` },
            { label: 'New (B/K)', key: 'newStock', format: (v: any) => `${v.boxes} / ${v.kg.toFixed(1)}` },
            { label: 'Damaged (B/K/$)', key: 'damagedStock', format: (v: any) => `${v.boxes}/${v.kg.toFixed(1)}/$${v.amount.toFixed(0)}` },
            { label: 'Closing (B/K)', key: 'closingStock', format: (v: any) => `${v.boxes} / ${v.kg.toFixed(1)}` },
            { label: 'Unpaid (B/K/$)', key: 'unpaidSales', format: (v: any) => `${v.boxes}/${v.kg.toFixed(1)}/$${v.amount.toFixed(0)}` },
            { label: 'Sales (B/K/$)', key: 'sales', format: (v: any) => `${v.boxes}/${v.kg.toFixed(1)}/$${v.amount.toFixed(0)}` },
            { label: 'Unit ($B/K)', key: 'unitPrice', format: (v: any) => `$${v.box}/$${v.kg}` },
            { label: 'Sell ($B/K)', key: 'sellingPrice', format: (v: any) => `$${v.box}/$${v.kg}` },
            { label: 'Profit (B/K/T)', key: 'profit', format: (v: any) => `$${v.box}/$${v.kg}/$${v.total.toFixed(0)}` },
          ]
        }]
      };
    }

    if (selectedReportType === 'sales' && salesDataDetailed) {
      return {
        title: 'Sales Report',
        businessName,
        dateRange: rangeStr,
        layout: 'landscape' as const,
        sections: [{
          type: 'table' as const,
          data: salesDataDetailed,
          columns: [
            { label: 'Date', key: 'date', format: (v: number) => format(v, 'P p') },
            { label: 'Product', key: 'productName' },
            { label: 'Qty', key: 'quantitySold' },
            { label: 'Client', key: 'clientName' },
            { label: 'Unit Price', key: 'unitPrice' },
            { label: 'Selling Price', key: 'sellingPrice' },
            { label: 'Profit', key: 'profit', format: (v: number) => `$${v.toFixed(2)}` },
            { label: 'Total', key: 'total', format: (v: number) => `$${v.toFixed(2)}` },
            { label: 'Seller', key: 'seller' },
            { label: 'Status', key: 'paymentStatus' },
            { label: 'Method', key: 'paymentMethod' },
          ]
        }]
      };
    }

    if (selectedReportType === 'top_selling' && topSellingData) {
      return {
        title: 'Top Selling Report',
        businessName,
        dateRange: rangeStr,
        sections: [{
          type: 'table' as const,
          data: topSellingData,
          columns: [
            { label: 'Product', key: 'product' },
            { label: 'Total Sold', key: 'totalSold' },
            { label: 'Total Revenue', key: 'totalRevenue', format: (v: number) => `$${v.toFixed(2)}` },
            { label: 'Damaged Rate', key: 'damageRate' },
          ]
        }]
      };
    }

    if (selectedReportType === 'debtors' && debtorData) {
      return {
        title: 'Debtor/Credit Report',
        businessName,
        dateRange: 'Full History',
        sections: [{
          type: 'table' as const,
          data: debtorData,
          columns: [
            { label: 'Client Name', key: 'clientName' },
            { label: 'Amount Owed', key: 'amountOwed', format: (v: number) => `$${v.toFixed(2)}` },
            { label: 'Amount Paid', key: 'amountPaid', format: (v: number) => `$${v.toFixed(2)}` },
            { label: 'Phone', key: 'phoneNumber' },
            { label: 'Email', key: 'email' },
          ]
        }]
      };
    }

    if (selectedReportType === 'pl' && plData) {
      return {
        title: 'Profit & Loss Report',
        businessName,
        dateRange: rangeStr,
        sections: [
          {
            type: 'summary' as const,
            title: 'Financial Overview',
            data: [
              { label: 'Total Revenue', value: `$${plData.totalRevenue.toFixed(2)}` },
              { label: 'Cost of Stock', value: `$${plData.costOfStock.toFixed(2)}` },
              { label: 'Damaged Value', value: `-$${plData.damagedValue.toFixed(2)}`, isLoss: true },
              { label: 'Total Expenses', value: `-$${plData.totalExpenses.toFixed(2)}`, isLoss: true },
              { label: 'Total Deposits', value: `$${plData.totalDeposits.toFixed(2)}` },
              { label: 'Net Profit', value: `$${plData.netProfit.toFixed(2)}`, isProfit: plData.netProfit >= 0, isLoss: plData.netProfit < 0 },
            ]
          },
          {
            type: 'list' as const,
            title: 'Key Metrics',
            data: [
              { label: 'Sales Count', value: plData.salesCount.toString() },
              { label: 'Expense Count', value: plData.expenseCount.toString() },
              { label: 'Deposit Count', value: plData.depositCount.toString() },
              { label: 'Average Sale Amount', value: `$${plData.avgSaleAmount.toFixed(2)}` },
            ]
          },
          {
            type: 'table' as const,
            title: 'Top Selling Products',
            data: plData.topSellingProducts,
            columns: [
              { label: 'ID', key: 'id', width: 40 },
              { label: 'Product Name', key: 'name' },
              { label: 'Qty Sold', key: 'qty' },
              { label: 'Total Revenue', key: 'revenue', format: (v: number) => `$${v.toFixed(2)}` },
            ]
          },
          {
            type: 'table' as const,
            title: 'Sales by Payment Method',
            data: plData.salesByPaymentMethod,
            columns: [
              { label: 'Method', key: 'method' },
              { label: 'Transactions', key: 'count' },
              { label: 'Total Amount', key: 'total', format: (v: number) => `$${v.toFixed(2)}` },
            ]
          }
        ]
      };
    }

    return null;
  }, [selectedReportType, generalData, salesDataDetailed, topSellingData, debtorData, plData, user, activeRange, isModalOpen]);

  const reportCards = [
    { id: 'general' as ReportType, title: "General Report", desc: "Overview of inventory and performance", icon: FileText, color: "from-blue-500 to-blue-600" },
    { id: 'sales' as ReportType, title: "Sales Report", desc: "Detailed transaction tracking", icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
    { id: 'top_selling' as ReportType, title: "Top Selling", desc: "Analyze best performing products", icon: Package, color: "from-amber-500 to-amber-600" },
    { id: 'debtors' as ReportType, title: "Debtor/Credit", desc: "Monitor unpaid balances", icon: Users, color: "from-rose-500 to-rose-600" },
    { id: 'pl' as ReportType, title: "Profit & Loss", desc: "Comprehensive financial statement", icon: LineChart, color: "from-violet-500 to-violet-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Business Reports</h1>
        <p className="text-gray-500 dark:text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
          Access specialized analytics to monitor your inventory, sales, and overall financial health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reportCards.map((card) => (
          <div
            key={card.id}
            onClick={() => { setSelectedReportType(card.id); setIsModalOpen(true); }}
            className="group relative bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 overflow-hidden"
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500", card.color)} />
            <div className="relative z-10 space-y-8">
              <div className={cn("inline-flex p-5 rounded-3xl bg-gray-50 dark:bg-white/5 group-hover:bg-primary/10 transition-colors duration-500")}>
                <card.icon className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold dark:text-white">{card.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">{card.desc}</p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-primary font-bold text-lg group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-2">
                  View Report <ChevronRight className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report Configuration">
        <div className="p-4 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <CalendarIcon className="w-6 h-6 text-primary" />
              Select Period
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['today', 'week', 'month', 'custom'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setDateOption(opt as DateOption)}
                  className={cn(
                    "py-4 rounded-2xl text-sm font-bold transition-all border capitalize",
                    dateOption === opt
                      ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105"
                      : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>

            {dateOption === 'custom' && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Start Date</label>
                  <input type="date" value={customRange.from} onChange={e => setCustomRange(p => ({ ...p, from: e.target.value }))} className="w-full p-4 bg-gray-50 dark:bg-white/10 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">End Date</label>
                  <input type="date" value={customRange.to} onChange={e => setCustomRange(p => ({ ...p, to: e.target.value }))} className="w-full p-4 bg-gray-50 dark:bg-white/10 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold" />
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 border-t dark:border-white/5">
            {isLoading ? (
              <Button disabled className="w-full h-16 rounded-[1.25rem] opacity-50"><Loader2 className="animate-spin mr-3" /> Fetching Analytics...</Button>
            ) : pdfProps ? (
              <PDFDownloadLink
                document={<ReportPDF {...pdfProps} />}
                fileName={`${selectedReportType}-report.pdf`}
                className="block"
              >
                {({ loading }) => (
                  <Button className="w-full h-16 rounded-[1.25rem] shadow-2xl shadow-primary/20 text-xl font-bold" disabled={loading}>
                    {loading ? <><Loader2 className="animate-spin mr-3" /> Packaging PDF...</> : <><Download className="mr-3" /> Download {selectedReportType.replace('_', ' ')}</>}
                  </Button>
                )}
              </PDFDownloadLink>
            ) : (
              <Button disabled className="w-full h-16 rounded-[1.25rem] opacity-50">No Data for this Period</Button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 font-medium">
            Analysis for {format(activeRange.from, 'PPP')} to {format(activeRange.to, 'PPP')}
          </p>
        </div>
      </Modal>

      <div className="bg-gray-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px] -mr-[20rem] -mt-[20rem] group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="space-y-6 flex-1">
            <span className="px-5 py-2 bg-primary/20 rounded-full text-primary-light text-xs font-black uppercase tracking-[0.2em] border border-primary/30">Analytics Pro</span>
            <h2 className="text-4xl font-bold leading-tight">Identify Your Profit Leaks <br /> with Damaged Rate Tracking</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              The new **Top Selling Report** now includes Damage Rate analysis, helping you spot inventory fragility and optimize your supply chain quality control.
            </p>
          </div>
          <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border border-primary/20 backdrop-blur-xl shrink-0">
            <LineChart className="w-16 h-16 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
