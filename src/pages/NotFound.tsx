import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#111] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-75" />

            <div className="relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative inline-block"
                >
                    {/* 3D Animated 404 */}
                    <motion.div
                        className="text-[12rem] md:text-[16rem] font-bold leading-none select-none"
                        initial={{ rotateX: 0, rotateY: 0 }}
                        animate={{
                            rotateX: [0, 10, 0, -10, 0],
                            rotateY: [0, 15, 0, -15, 0],
                            scale: [1, 1.02, 1, 1.02, 1]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            perspective: 1000,
                            textShadow: "0 20px 50px rgba(0,0,0,0.2)"
                        }}
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 animate-gradient bg-300%">
                            404
                        </span>
                    </motion.div>

                    {/* Floating Elements */}
                    <motion.div
                        className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/30 rounded-full backdrop-blur-md"
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-10 -left-10 w-14 h-14 bg-purple-500/30 rounded-full backdrop-blur-md"
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mt-8 space-y-6"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                        Lost in Space?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg">
                        The page you're looking for seems to have drifted away into the digital void.
                    </p>

                    <Link to="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 mt-4"
                        >
                            Return Home
                        </motion.button>
                    </Link>
                </motion.div>
            </div>

            <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s linear infinite;
        }
        .bg-300\\% {
          background-size: 300% auto;
        }
      `}</style>
        </div>
    );
}
