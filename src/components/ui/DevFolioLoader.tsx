"use client"

import { motion } from "framer-motion"

interface DevFolioLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function DevFolioLoader({ 
  size = "md", 
  text = "Loading...", 
  className = "" 
}: DevFolioLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Animated D Logo */}
      <motion.div
        className={`${sizeClasses[size]} bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center relative overflow-hidden`}
        animate={{ 
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Moving Border Light Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
          }}
          animate={{ 
            x: ['-100%', '100%'],
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* D Letter */}
        <motion.span 
          className="text-white font-bold relative z-10"
          style={{ fontSize: size === "sm" ? "12px" : size === "md" ? "16px" : "20px" }}
          animate={{ 
            y: [0, -1, 0]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          D
        </motion.span>
        
        {/* Subtle Pulse Effect */}
        <motion.div
          className="absolute inset-1 rounded-lg border-2 border-white/20"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

    </div>
  )
}

// Full Page Loader Component
export function DevFolioPageLoader() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <DevFolioLoader 
          size="lg" 
          text="DevFolio" 
          className="space-y-4"
        />
      </motion.div>
    </div>
  )
}

// Inline Loader for buttons/components
export function DevFolioInlineLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.div
        className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded flex items-center justify-center relative overflow-hidden"
        animate={{ 
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Moving light effect */}
        <motion.div
          className="absolute inset-0 rounded"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
          }}
          animate={{ 
            x: ['-100%', '100%'],
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <span className="text-white font-bold text-xs relative z-10">D</span>
      </motion.div>
      <span className="text-sm font-medium">Loading...</span>
    </div>
  )
}
