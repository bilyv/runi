import { UserCircle, Mail, Phone, BadgeCheck } from "lucide-react";

interface StaffProfileProps {
    staffUser: any;
}

export function StaffProfile({ staffUser }: StaffProfileProps) {
    // Get staff details
    const fullName = staffUser.staff_full_name || "Staff Member";
    const email = staffUser.email_address || "Not specified";
    const phone = staffUser.phone_number || "Not specified";
    const staffId = staffUser.staff_id || "Not specified";

    // Extract initials from the full name
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map(part => part.charAt(0))
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const initials = getInitials(fullName);

    return (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-white/5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Staff Profile Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">
                    Your personal details as registered in the system
                </p>
            </div>

            <div className="p-8">
                {/* Profile Header */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-sm relative overflow-hidden group">
                        {staffUser.id_card_front_url ? (
                            <img src={staffUser.id_card_front_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-display">
                                {initials}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-display">{fullName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wider uppercase">
                                Staff Member
                            </span>
                            <span className="text-gray-400 dark:text-gray-600 px-1">•</span>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ID: {staffId}</span>
                        </div>
                    </div>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-blue-500/20 transition-all">
                        <div className="p-2 bg-white dark:bg-[#222] rounded-xl shadow-sm text-blue-500">
                            <UserCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Full Name</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white font-sans">{fullName}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-blue-500/20 transition-all">
                        <div className="p-2 bg-white dark:bg-[#222] rounded-xl shadow-sm text-indigo-500">
                            <BadgeCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Staff ID</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white font-sans">{staffId}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-blue-500/20 transition-all">
                        <div className="p-2 bg-white dark:bg-[#222] rounded-xl shadow-sm text-amber-500">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Email Address</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white font-sans">{email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-blue-500/20 transition-all">
                        <div className="p-2 bg-white dark:bg-[#222] rounded-xl shadow-sm text-emerald-500">
                            <Phone size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Phone Number</p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white font-sans">{phone}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
