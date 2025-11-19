"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { testimonialEmbeds } from "./testimonial-embeds"

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => void
      }
    }
  }
}

export function TestimonialsSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || testimonialEmbeds.length === 0 || typeof window === "undefined") {
      return
    }

    const scriptId = "twitter-wjs"

    const loadWidgets = () => {
      try {
        window.twttr?.widgets?.load()
      } catch (err) {
        console.warn("Unable to refresh X embeds", err)
      }
    }

    if (document.getElementById(scriptId)) {
      loadWidgets()
      return
    }

    const script = document.createElement("script")
    script.id = scriptId
    script.async = true
    script.src = "https://platform.twitter.com/widgets.js"
    script.charset = "utf-8"
    script.onload = loadWidgets
    document.body.appendChild(script)
  }, [mounted])

  if (!mounted || testimonialEmbeds.length === 0) {
    return null
  }

  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <motion.div
          className="mx-auto mb-8 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-1">
            What devs say about DevFolio
          </h2>

        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {testimonialEmbeds.map((embed, index) => (
            <motion.article
              key={index}
              className="h-full rounded-2xl border border-border/50 bg-white/90 p-3 shadow-md transition-all duration-300 hover:shadow-lg dark:bg-card/70 dark:border-border/30 dark:hover:bg-card/80 sm:p-4"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div
                className="[&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:rounded-2xl [&_.twitter-tweet]:mx-auto [&_.twitter-tweet]:max-w-full [&_.twitter-tweet]:!text-sm [&_.twitter-tweet]:scale-[0.96] bg-white dark:bg-card/60"
                dangerouslySetInnerHTML={{ __html: embed }}
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

