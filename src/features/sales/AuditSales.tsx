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
    <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Audit Sales</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
          <thead className="bg-gray-50 dark:bg-dark-card">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Changed Details</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performed By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
            {audits.length > 0 ? (
              audits.map((audit: any) => (
                <tr key={audit._id} className="hover:bg-gray-50 dark:hover:bg-dark-card/80">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(audit.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                    {(() => {
                      const sale = getSale(audit.sales_id);
                      return sale ? getProductName(sale.product_id) : "Unknown Product";
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {audit.audit_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="max-w-xs">
                      {audit.audit_type === "quantity_change" && (
                        <div>
                          <div>Boxes: {audit.boxes_change?.before} → {audit.boxes_change?.after}</div>
                          <div>Kg: {audit.kg_change?.before} → {audit.kg_change?.after}</div>
                        </div>
                      )}
                      {audit.audit_type === "payment_method_change" && (
                        <div>
                          Payment Method: {audit.old_values?.payment_method} → {audit.new_values?.payment_method}
                        </div>
                      )}
                      {audit.audit_type === "deletion" && (
                        <div>
                          <div>Boxes: {audit.boxes_change?.before} (to be deleted)</div>
                          <div>Kg: {audit.kg_change?.before} (to be deleted)</div>
                        </div>
                      )}
                      {audit.audit_type === "edit" && (
                        <div>
                          <div>Boxes: {audit.boxes_change?.before} → {audit.boxes_change?.after}</div>
                          <div>Kg: {audit.kg_change?.before} → {audit.kg_change?.after}</div>
                          <div>Payment: {audit.old_values?.payment_method} → {audit.new_values?.payment_method}</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="max-w-xs">
                      <div className="truncate" title={audit.reason}>
                        {audit.reason}
                      </div>
                      {audit.approval_reason && (
                        <div className="truncate text-xs mt-1 italic" title={`Approval reason: ${audit.approval_reason}`}>
                          Approved: {audit.approval_reason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {audit.performed_by}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${audit.approval_status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        audit.approval_status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {formatStatus(audit.approval_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {audit.approval_status === "pending" ? (
                      <div className="flex space-x-2">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleAuditAction(audit._id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleAuditAction(audit._id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No audit records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}