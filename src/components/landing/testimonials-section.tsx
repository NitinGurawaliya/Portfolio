"use client"

import { useEffect } from "react"
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
  useEffect(() => {
    if (testimonialEmbeds.length === 0 || typeof window === "undefined") {
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
  }, [])

  if (testimonialEmbeds.length === 0) {
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
          <div className="mb-3 inline-flex items-center rounded-full border border-border/40 bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">
            Loved by builders
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl lg:text-2xl">
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

        <div className="mt-5 text-center text-xs text-muted-foreground sm:mt-6">
          Tip: generate embed code at{" "}
          <a
            href="https://publish.twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            publish.twitter.com
          </a>{" "}
          and paste it into <code className="rounded bg-muted px-1.5 py-0.5 text-xs">testimonial-embeds.ts</code>.
        </div>
      </div>
    </section>
  )
}

