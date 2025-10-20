/**
 * URL Import Component - Import projects from URL
 */

"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { LinkIcon, Plus, Loader2 } from "lucide-react"

interface UrlImportProps {
  onImport: (url: string) => Promise<void>
}

export function UrlImport({ onImport }: UrlImportProps) {
  const [projectUrl, setProjectUrl] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = async () => {
    if (!projectUrl.trim()) return

    setIsImporting(true)
    try {
      await onImport(projectUrl.trim())
      setProjectUrl("")
    } catch (error) {
      console.error("Import error:", error)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <motion.div 
      className="flex-1 min-w-[220px] relative"
      whileFocus={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Put your project URL here"
        value={projectUrl}
        onChange={(e) => setProjectUrl(e.target.value)}
        className="pl-10 pr-12 bg-gray-50 text-black font-medium h-9 text-sm focus:bg-white transition-all duration-300"
        onKeyDown={(e) => e.key === 'Enter' && projectUrl.trim() && handleImport()}
      />
      {/* Inline Add Button - only show when there's text */}
      <AnimatePresence>
        {projectUrl.trim() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
          >
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="h-7 w-7 p-0 bg-black text-white hover:bg-gray-800 transition-all duration-300 rounded"
            >
              {isImporting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

