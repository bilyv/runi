import { motion } from "framer-motion";

export function Reports() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const reportCards = [
    {
      title: "General Report",
      description: "Overview of all business metrics",
      gradient: "from-blue-500 to-indigo-600",
      hoverGradient: "from-blue-400 to-indigo-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      progress: "w-3/4"
    },
    {
      title: "Sales Report",
      description: "Track your sales performance",
      gradient: "from-emerald-500 to-teal-600",
      hoverGradient: "from-emerald-400 to-teal-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      progress: "w-2/3"
    },
    {
      title: "Top Selling",
      description: "Best performing products",
      gradient: "from-amber-500 to-orange-600",
      hoverGradient: "from-amber-400 to-orange-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      progress: "w-4/5"
    },
    {
      title: "Debit/Unpaid",
      description: "Pending customer payments",
      gradient: "from-rose-500 to-pink-600",
      hoverGradient: "from-rose-400 to-pink-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      progress: "w-1/2"
    },
    {
      title: "Profit & Loss",
      description: "Financial performance analysis",
      gradient: "from-violet-500 to-purple-600",
      hoverGradient: "from-violet-400 to-purple-500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
        </svg>
      ),
      progress: "w-3/5"
    }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-dark-text tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-body">
          Gain deep insights into your business performance and growth.
        </p>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {reportCards.map((card, index) => (
          <motion.div 
            key={index}
            variants={item}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-r ${card.gradient} p-8 shadow-xl transition-all duration-300 cursor-pointer`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${card.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-white tracking-tight">{card.title}</h3>
                <p className="text-white/80 text-sm mt-1 font-body">{card.description}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 group-hover:bg-white/30 transition-colors">
                {card.icon}
              </div>
            </div>
            <div className="mt-12 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Analysis Status</span>
                <span className="text-white text-xs font-bold">Ready</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: card.progress.split("-")[1] }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
