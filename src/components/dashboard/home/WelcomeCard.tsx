/**
 * Welcome Card Component
 */

"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export function WelcomeCard() {
  return (
    <Card className="bg-white transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg text-black flex items-center font-bold">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            👋
          </motion.div>
          <span className="ml-2">Welcome to Your Portfolio</span>
        </CardTitle>
        <motion.p 
          className="text-gray-600 mt-1 font-medium text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          We're excited to see you back! Let's customize your portfolio
        </motion.p>
      </CardHeader>
    </Card>
  )
}

