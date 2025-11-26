/**
 * Acernity UI Example Component
 * यह एक example component है जो दिखाता है कि Acernity UI components कैसे use करें
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/acernity-utils";

interface ExampleComponentProps {
  className?: string;
}

export function ExampleComponent({ className }: ExampleComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10",
        className
      )}
    >
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Acernity UI Component
      </h3>
      <p className="text-muted-foreground">
        यह एक example component है। आप इसे modify करके अपने components बना सकते हैं।
      </p>
    </motion.div>
  );
}

