export const isDevelopment = process.env.NODE_ENV !== "production"

export function devLog(...args: unknown[]): void {
  if (isDevelopment) {
    // eslint-disable-next-line no-console
    console.log(...args)
  }
}

export function devWarn(...args: unknown[]): void {
  if (isDevelopment) {
    // eslint-disable-next-line no-console
    console.warn(...args)
  }
}

export function devError(...args: unknown[]): void {
  // Always log errors
  // eslint-disable-next-line no-console
  console.error(...args)
}

