"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import { Users, UserCheck, UserPlus } from "lucide-react"

export default function CommunityStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    todayUsers: 0,
  })

  useEffect(() => {
    fetch("/api/community-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error loading stats:", err))
  }, [])

  const cards = [
    {
      label: "Active Users",
      key: "activeUsers",
      icon: <UserCheck className="w-8 h-8 text-green-500" />,
      gradient: "from-green-400/20 to-emerald-700/10",
    },
    {
      label: "Total Users",
      key: "totalUsers",
      icon: <Users className="w-8 h-8 text-blue-500" />,
      gradient: "from-blue-400/20 to-indigo-700/10",
    },
    {
      label: "New Users Today",
      key: "todayUsers",
      icon: <UserPlus className="w-8 h-8 text-pink-500" />,
      gradient: "from-pink-400/20 to-rose-700/10",
    },
  ]

  return (
    <section className="py-16 px-6 ">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold mb-10 bg-clip-text bg-gradient-to-r text-black dark:text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Thriving Community
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${card.gradient} shadow-xl backdrop-blur-xl border border-white/10 dark:border-gray-800`}
            >
              <div className="relative flex flex-col items-center gap-3">
                {card.icon}
                <motion.h3
                  className="text-3xl font-bold text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                >
                  <CountUp end={stats[card.key]} duration={2} />
                </motion.h3>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
