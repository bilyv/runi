import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../../components/ui/Button";

export function AuditSales() {
  // Fetch audit data
  const audits = useQuery(api.sales.listAudit) || [];
  const products = useQuery(api.products.list) || [];
  const sales = useQuery(api.sales.list) || [];
  
  // Mutations
  const updateAuditStatus = useMutation(api.sales.updateAuditStatus);
  
  // Helper function to format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Helper function to format status
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      "pending": "Pending",
      "approved": "Approved",
      "rejected": "Rejected"
    };
    return statusMap[status] || status;
  };
  
  // Helper function to get product name by ID
  const getProductName = (productId: string) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : "Unknown Product";
  };
  
  // Helper function to get sale by ID
  const getSale = (saleId: string) => {
    return sales.find(s => s._id === saleId);
  };
  
  // Handle approval/rejection
  const handleAuditAction = async (auditId: string, status: "approved" | "rejected", reason?: string) => {
    try {
      await updateAuditStatus({ auditId, status, reason });
      alert(`Audit ${status} successfully!`);
    } catch (error) {
      console.error(`Error ${status} audit:`, error);
      alert(`Failed to ${status} audit. Please try again.`);
    }
  };
  
    return (
      <div className="overflow-hidden rounded-3xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm shadow-xl">
        <div className="p-7 border-b border-gray-200/50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Audit History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200/50 dark:border-white/5">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Time</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Product</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Status</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
              {audits.length > 0 ? (
                audits.map((audit: any) => (
                  <tr key={audit._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(audit.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white font-display">
                        {(() => {
                          const sale = getSale(audit.sales_id);
                          return sale ? getProductName(sale.product_id) : "Unknown Product";
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        {audit.audit_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="max-w-xs space-y-1">
                        {audit.audit_type === "edit" && (
                          <div className="text-[11px] opacity-80">
                            {audit.boxes_change?.before} → {audit.boxes_change?.after} Boxes
                          </div>
                        )}
                        <div className="italic truncate" title={audit.reason}>{audit.reason}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${audit.approval_status === 'approved' ? 'bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          audit.approval_status === 'rejected' ? 'bg-red-100/50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 
                          'bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {formatStatus(audit.approval_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {audit.approval_status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleAuditAction(audit._id, "approved")} className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"><Check size={14} /></button>
                          <button onClick={() => handleAuditAction(audit._id, "rejected")} className="p-1.5 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"><X size={14} /></button>
                        </div>
                      ) : (
                        <span className="text-gray-400 opacity-30 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">No audit records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
}