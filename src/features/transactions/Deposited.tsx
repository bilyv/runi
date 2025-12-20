import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Modal } from "../../components/ui/Modal";
import { 
  Plus, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  User,
  Hash,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Loader2
} from "lucide-react";

export function Deposited() {
  const user = useQuery(api.auth.loggedInUser);
  const deposits = useQuery(api.deposit.list);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Deposit form state
  const [amount, setAmount] = useState("");
  const [depositType, setDepositType] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  // Mutations
  const createDeposit = useMutation(api.deposit.create);
  const deleteDeposit = useMutation(api.deposit.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFileRecord = useMutation(api.files.create);
  
  // Handle form submission
  const handleSaveDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a deposit.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let receiptImageUrl = "";
      if (receiptFile) {
        const uploadUrl = await generateUploadUrl();
        
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: receiptFile,
          headers: { "Content-Type": receiptFile.type },
        });
        
        if (!response.ok) throw new Error("Failed to upload file");
        
        const { storageId } = await response.json();
        
        const fileRecord = await createFileRecord({
          storageId,
          fileName: receiptFile.name,
          fileType: receiptFile.type,
          fileSize: receiptFile.size,
        });

        receiptImageUrl = fileRecord.fileUrl;
      }
      
      const userIdStr = user._id.toString();
      
      await createDeposit({
        deposit_id: `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: userIdStr,
        deposit_type: depositType,
        account_name: accountName,
        account_number: accountNumber,
        amount: parseFloat(amount),
        to_recipient: accountName,
        deposit_image_url: receiptImageUrl,
        approval: "pending",
        created_by: userIdStr,
        updated_at: Date.now(),
        updated_by: userIdStr,
      });
      
      // Reset form
      setAmount("");
      setDepositType("");
      setAccountName("");
      setAccountNumber("");
      setReceiptFile(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving deposit:", error);
      alert("Failed to save deposit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (depositId: string) => {
    if (!window.confirm("Are you sure you want to delete this deposit record?")) return;
    
    try {
      await deleteDeposit({ deposit_id: depositId });
    } catch (error) {
      console.error("Error deleting deposit:", error);
      alert("Failed to delete deposit.");
    }
  };

  useEffect(() => {
    if (deposits !== undefined) {
      setIsLoading(false);
    }
  }, [deposits]);

  const filteredDeposits = deposits?.filter(d => 
    d.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.deposit_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.deposit_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-dark-text-muted animate-pulse">Loading deposited transactions...</p>
      </div>
    );
  }

  const renderTable = () => (
    <div className="overflow-hidden rounded-3xl border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm shadow-xl mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200/50 dark:border-white/5">
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Date & Time</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Amount</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Type</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Account</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Receipt</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-display">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
            {filteredDeposits && filteredDeposits.length > 0 ? (
              filteredDeposits.map((deposit) => (
                <tr key={deposit.deposit_id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white font-display">{new Date(deposit.updated_at).toLocaleDateString()}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{new Date(deposit.updated_at).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      ${deposit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      {deposit.deposit_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col text-gray-600 dark:text-dark-text">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white font-display">{deposit.account_name}</span>
                      <span className="text-xs text-gray-400">{deposit.account_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      deposit.approval === "approved" 
                        ? "bg-emerald-100/50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                        : deposit.approval === "rejected"
                        ? "bg-red-100/50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                        : "bg-amber-100/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      {deposit.approval}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deposit.deposit_image_url ? (
                      <a href={deposit.deposit_image_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline">View</a>
                    ) : (
                      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 opacity-50">No receipt</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => handleDelete(deposit.deposit_id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">No deposits found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Deposited Transactions</h2>
          <p className="text-sm text-gray-500 dark:text-dark-text-muted">Manage and track all bank and mobile money deposits</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search deposits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-dark-text w-full md:w-64 transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 font-medium shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>New Deposit</span>
          </button>
        </div>
      </div>

      {renderTable()}

      <Modal
        isOpen={showModal}
        onClose={() => !isSubmitting && setShowModal(false)}
        title="Add New Deposit Record"
      >
        <form className="space-y-5 py-2" onSubmit={handleSaveDeposit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-500" />
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text outline-none transition-all"
                  placeholder="0.00"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-500" />
                Deposit Type
              </label>
              <select
                value={depositType}
                onChange={(e) => setDepositType(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text outline-none appearance-none transition-all"
                required
                disabled={isSubmitting}
              >
                <option value="">Select type</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Cash Deposit">Cash Deposit</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-500" />
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text outline-none transition-all"
              placeholder="e.g. John Doe / Company Name"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1.5 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-blue-500" />
              Account / Transaction Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-dark-bg dark:text-dark-text outline-none transition-all"
              placeholder="Enter account or ref number"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1.5">
              Receipt / Proof of Payment
            </label>
            <div className={`mt-1 flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed rounded-xl transition-all ${
              receiptFile 
                ? "border-blue-400 bg-blue-50/30 dark:bg-blue-900/10" 
                : "border-gray-300 dark:border-dark-border hover:border-blue-400"
            }`}>
              {receiptFile ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">{receiptFile.name}</p>
                    <p className="text-xs text-gray-500">{(receiptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setReceiptFile(null)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer text-center group">
                  <Plus className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Click to upload image</span>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  <input 
                    type="file" 
                    className="sr-only" 
                    accept="image/*" 
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2 transition-all min-w-[140px] justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Deposit"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
