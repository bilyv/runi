import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Search, Phone, User, Trash2, Shield, Calendar, Mail, FileText, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";

export function AllWorkers() {
  const staff = useQuery(api.staff.list);
  const deleteStaff = useMutation(api.staff.remove);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);

  useEffect(() => {
    if (staff) {
      const filtered = staff.filter(member =>
        member.staff_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone_number.includes(searchTerm)
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staff]);

  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      try {
        await deleteStaff({ id });
        toast.success("Staff member removed successfully");
      } catch (error) {
        toast.error("Failed to remove staff member");
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (staff === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/40 dark:border-white/10 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Staff Directory</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-sans">View and manage your registered staff</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredStaff.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-white/40 dark:border-white/10 p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                <User size={32} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium font-sans">
                {searchTerm ? "No staff members match your search." : "No staff members registered yet."}
              </p>
            </motion.div>
          ) : (
            filteredStaff.map((member) => (
              <motion.div
                key={member._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-white/40 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar / Profile */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold font-display text-2xl shadow-lg shadow-blue-500/20">
                      {member.staff_full_name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Details Bar */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center w-full">
                    <div className="col-span-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate font-display mb-1">{member.staff_full_name}</h4>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <Fingerprint className="w-3 h-3 mr-1.5 text-blue-500/70" />
                        ID: {member.staff_id}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 font-medium">
                          <Phone className="w-4 h-4 mr-2 text-indigo-500/70" />
                          {member.phone_number}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                          <Shield className="w-3 h-3 mr-2" />
                          Employee
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 font-medium">
                          <Calendar className="w-3.5 h-3.5 mr-2 text-emerald-500/70" />
                          Updated: {formatDate(member.updated_at)}
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={member.id_card_front_url} target="_blank" rel="noreferrer" className="p-1 px-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                            <FileText className="w-3 h-3 mr-1" /> ID Front
                          </a>
                          <a href={member.id_card_back_url} target="_blank" rel="noreferrer" className="p-1 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider flex items-center hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                            <FileText className="w-3 h-3 mr-1" /> ID Back
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-end gap-2">
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
