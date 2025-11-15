export const truncateWords = (input?: string | null, limit = 30) => {
  if (!input) return ""

  // remove html tags and normalize whitespace
  const plain = input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  if (!plain) return ""

  const words = plain.split(" ")
  if (words.length <= limit) {
    return plain
  }

  return `${words.slice(0, limit).join(" ")}…`
}
