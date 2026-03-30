export const getLanguageColor = (language: string) => {
  const colors: Record<string, string> = {
    JavaScript: "bg-yellow-400",
    TypeScript: "bg-blue-500",
    Python: "bg-green-500",
    Java: "bg-orange-500",
    React: "bg-cyan-500",
    Vue: "bg-emerald-500",
    Angular: "bg-red-500",
    "Node.js": "bg-green-600",
    Go: "bg-cyan-600",
    Rust: "bg-orange-600",
    "C++": "bg-blue-600",
    "C#": "bg-purple-500",
    CSS: "bg-pink-500",
    HTML: "bg-orange-400",
    PHP: "bg-indigo-500",
    Ruby: "bg-red-600",
    Swift: "bg-orange-500",
    Kotlin: "bg-purple-600",
  }
  return colors[language] || "bg-gray-500"
}
