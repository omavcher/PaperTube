"use client";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Search, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      {/* iOS 17 style container */}
      <div className="w-full max-w-sm mx-auto">
        {/* Dynamic Island - Glass effect */}


        {/* Main card - Glass morphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl"
        >
          {/* Icon with glass effect */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "backOut" }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-lg flex items-center justify-center border border-red-500/30"
          >
            <div className="w-16 h-16 bg-red-500/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-red-400/30">
              <XCircle className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">
              Not Found
            </h1>
            
            <p className="text-gray-400 text-sm leading-relaxed">
              This page is not available. The link may be broken or the page may have been removed.
            </p>

            {/* iOS-style glass buttons */}
            <div className="space-y-3 pt-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className={cn(
                  "w-full bg-blue-500/20 backdrop-blur-lg text-white",
                  "py-3 px-6 rounded-2xl font-semibold text-base",
                  "flex items-center justify-center space-x-2",
                  "transition-all duration-200 border border-blue-400/30",
                  "hover:bg-blue-500/30 hover:border-blue-400/50",
                  "active:bg-blue-500/40"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/")}
                className={cn(
                  "w-full bg-white/10 backdrop-blur-lg text-white",
                  "py-3 px-6 rounded-2xl font-semibold text-base",
                  "flex items-center justify-center space-x-2",
                  "transition-all duration-200 border border-white/20",
                  "hover:bg-white/20 hover:border-white/30",
                  "active:bg-white/30"
                )}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </motion.button>

            </div>
          </div>
        </motion.div>

        {/* Home indicator - Glass effect */}
        <div className="mt-8 flex justify-center">
          <div className="w-32 h-1 bg-white/30 backdrop-blur-lg rounded-full border border-white/10"></div>
        </div>
      </div>

      {/* Background animated gradient effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-3/4 left-1/4 w-60 h-60 bg-red-500/10 rounded-full blur-3xl"
        />

        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 -z-5">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  );
}