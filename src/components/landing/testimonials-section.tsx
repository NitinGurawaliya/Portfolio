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
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="mb-4 inline-flex items-center rounded-full border border-border/40 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground sm:text-sm">
            Loved by builders
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            What devs say about DevFolio
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Drop in embeds from X (Twitter) to feature community feedback in seconds.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonialEmbeds.map((embed, index) => (
            <motion.article
              key={index}
              className="h-full rounded-3xl border border-border/60 bg-card/80 p-4 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-5"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div
                className="[&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:rounded-2xl [&_.twitter-tweet]:mx-auto [&_.twitter-tweet]:max-w-full"
                dangerouslySetInnerHTML={{ __html: embed }}
              />
            </motion.article>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground sm:mt-8">
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

