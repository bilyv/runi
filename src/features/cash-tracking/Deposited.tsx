import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Modal } from "../../components/ui/Modal";
import { Table, TableRow, TableCell } from "../../components/ui/Table";
import {
  Plus,
  Trash2,
  Eye,
  Search,
  Calendar,
  DollarSign,
  Tag,
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

  const [amount, setAmount] = useState("");
  const [depositType, setDepositType] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const createDeposit = useMutation(api.deposit.create);
  const deleteDeposit = useMutation(api.deposit.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFileRecord = useMutation(api.files.create);
  const getOrCreateFolder = useMutation(api.folders.getOrCreateByName);

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

        // Ensure 'Deposited' folder exists and get ID
        const folderId = await getOrCreateFolder({ folder_name: "Deposited" });

        const fileRecord = await createFileRecord({
          storageId,
          fileName: receiptFile.name,
          fileType: receiptFile.type,
          fileSize: receiptFile.size,
          folderId: folderId,
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
        <p className="text-gray-600 dark:text-gray-400 animate-pulse font-sans">Loading deposited transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Deposited Transactions</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-sans">Track and manage all bank and mobile money deposits</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search deposits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans text-sm"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-display font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Deposit</span>
            </button>
          </div>
        </div>
      </div>

      <Table
        headers={["Date & Time", "Amount", "Type", "Account Info", "Approval Status", "Receipt", "Actions"]}
        count={filteredDeposits?.length}
      >
        {filteredDeposits && filteredDeposits.length > 0 ? (
          filteredDeposits.map((deposit) => (
            <TableRow key={deposit.deposit_id}>
              <TableCell>
                <div className="flex items-center text-sm font-medium">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white font-display">{new Date(deposit.updated_at).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-400 font-sans">{new Date(deposit.updated_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell primary className="text-base text-blue-600 dark:text-blue-400">
                ${deposit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  {deposit.deposit_type}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 dark:text-white font-display text-sm">{deposit.account_name}</span>
                  <span className="text-xs text-gray-400 font-mono tracking-tight">{deposit.account_number}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${deposit.approval === "approved"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : deposit.approval === "rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  }`}>
                  {deposit.approval === "approved" ? <CheckCircle className="w-3 h-3" /> :
                    deposit.approval === "rejected" ? <XCircle className="w-3 h-3" /> :
                      <Clock className="w-3 h-3" />}
                  {deposit.approval}
                </span>
              </TableCell>
              <TableCell>
                {deposit.deposit_image_url ? (
                  <a
                    href={deposit.deposit_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-bold text-xs"
                  >
                    <Eye className="w-4 h-4" />
                    View Proof
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 text-gray-300 italic text-xs">
                    <AlertCircle className="w-4 h-4" />
                    No Receipt
                  </span>
                )}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleDelete(deposit.deposit_id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <tr>
            <td colSpan={7} className="px-8 py-20 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-sans italic">No deposited transactions found.</p>
              </div>
            </td>
          </tr>
        )}
      </Table>

      <Modal
        isOpen={showModal}
        onClose={() => !isSubmitting && setShowModal(false)}
        title="Record New Deposit"
      >
        <form className="space-y-6" onSubmit={handleSaveDeposit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold font-display text-gray-400 uppercase tracking-widest ml-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-display">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  placeholder="0.00"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold font-display text-gray-400 uppercase tracking-widest ml-1">
                Type
              </label>
              <select
                value={depositType}
                onChange={(e) => setDepositType(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans appearance-none"
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

          <div className="space-y-2">
            <label className="text-xs font-bold font-display text-gray-400 uppercase tracking-widest ml-1">
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
              placeholder="e.g. John Doe / Business"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold font-display text-gray-400 uppercase tracking-widest ml-1">
              Account / Ref Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
              placeholder="Enter reference number"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold font-display text-gray-400 uppercase tracking-widest ml-1">
              Proof of Payment
            </label>
            <div className={`mt-1 flex flex-col items-center justify-center px-6 py-6 border-2 border-dashed rounded-[2rem] transition-all ${receiptFile
                ? "border-blue-400 bg-blue-500/5"
                : "border-gray-200 dark:border-white/10 hover:border-blue-400 bg-white/30 dark:bg-black/10"
              }`}>
              {receiptFile ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate font-display">{receiptFile.name}</p>
                    <p className="text-xs text-gray-500 font-sans">{(receiptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptFile(null)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-black/20 rounded-xl"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer text-center group w-full">
                  <Plus className="mx-auto h-10 w-10 text-gray-300 group-hover:text-blue-500 transition-colors mb-2" />
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-display">Click to upload receipt</span>
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-3 text-sm font-bold font-display text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-display font-bold shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Processing..." : "Save Transaction"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
