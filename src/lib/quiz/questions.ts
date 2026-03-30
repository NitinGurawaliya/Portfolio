export type QuizDifficulty = "easy" | "medium" | "hard"

export interface QuizQuestion {
  id: number | string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  detailedExplanation?: string
  category: string
  difficulty: QuizDifficulty
}

export interface QuizCategory {
  id: string
  name: string
  description: string
  iconKey: "laptop" | "atom" | "brain" | "globe"
  color: "yellow" | "blue" | "purple" | "green"
  questions: QuizQuestion[]
}

const javascriptQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the output of: console.log(typeof null)?",
    options: ["null", "undefined", "object", "string"],
    correctAnswer: 2,
    explanation:
      "In JavaScript, typeof null returns 'object'. This is a well-known bug kept for backward compatibility.",
    detailedExplanation:
      "This is one of JavaScript's most famous quirks. The typeof operator returns 'object' for null, which is technically incorrect since null is a primitive value, not an object. This behavior exists due to a bug in the original JavaScript implementation and has been kept for backward compatibility.",
    category: "JavaScript Fundamentals",
    difficulty: "medium",
  },
  {
    id: 2,
    question: "Which of the following is NOT a valid way to create an array in JavaScript?",
    options: ["let arr = []", "let arr = new Array()", "let arr = Array.of()", "let arr = Array.create()"],
    correctAnswer: 3,
    explanation:
      "Array.create() is not a valid method in JavaScript. Use [], new Array(), Array.of(), or Array.from().",
    detailedExplanation:
      "JavaScript provides several ways to create arrays: array literals ([]), the Array constructor (new Array()), Array.of(), and Array.from(). Array.create() does not exist.",
    category: "JavaScript Fundamentals",
    difficulty: "easy",
  },
  {
    id: 3,
    question: "What will be the output of: console.log(0.1 + 0.2 === 0.3)?",
    options: ["true", "false", "undefined", "Error"],
    correctAnswer: 1,
    explanation:
      "false — because of floating-point precision. 0.1 + 0.2 is 0.30000000000000004.",
    detailedExplanation:
      "JavaScript uses IEEE 754 floating point numbers, so some decimals can’t be represented exactly in binary. Use an epsilon comparison instead of strict equality for floats.",
    category: "JavaScript Fundamentals",
    difficulty: "medium",
  },
  {
    id: 4,
    question: "What is closure in JavaScript?",
    options: [
      "A way to close functions",
      "A function that has access to variables in its outer scope",
      "A method to end loops",
      "A type of error handling",
    ],
    correctAnswer: 1,
    explanation:
      "A closure is a function that can access variables from its outer (enclosing) scope even after the outer function returns.",
    detailedExplanation:
      "Closures are created every time a function is created. They enable patterns like private state, function factories, and callbacks that retain access to outer variables.",
    category: "JavaScript Advanced",
    difficulty: "medium",
  },
  {
    id: 5,
    question: "What is the main difference between '==' and '===' in JavaScript?",
    options: ["No difference", "=== is stricter than ==", "== checks type, === doesn't", "=== is faster than =="],
    correctAnswer: 1,
    explanation:
      "=== compares value and type without coercion; == coerces types before comparing.",
    detailedExplanation:
      "Prefer === for predictability. Example: '5' == 5 is true, but '5' === 5 is false.",
    category: "JavaScript Fundamentals",
    difficulty: "easy",
  },
]

const reactQuestions: QuizQuestion[] = [
  {
    id: 6,
    question: "What does the 'useState' hook return in React?",
    options: ["A single value", "An object with value and setter", "An array with value and setter function", "A function"],
    correctAnswer: 2,
    explanation: "useState returns an array: [currentValue, setValue].",
    detailedExplanation:
      "The setter can take a value or an updater function. Calling it schedules a re-render with the next state.",
    category: "React Hooks",
    difficulty: "easy",
  },
  {
    id: 7,
    question: "What is the purpose of the 'key' prop in React lists?",
    options: ["To style list items", "To help React identify which items have changed", "To set the order of items", "To make items clickable"],
    correctAnswer: 1,
    explanation: "Keys help React reconcile list items efficiently.",
    detailedExplanation:
      "Keys should be stable and unique among siblings. Avoid using indices when items can be reordered/added/removed.",
    category: "React Core",
    difficulty: "medium",
  },
  {
    id: 8,
    question: "What is the useEffect hook used for in React?",
    options: ["To create side effects only", "To manage component lifecycle and side effects", "To update state", "To render components"],
    correctAnswer: 1,
    explanation: "useEffect runs side effects and lifecycle-like logic in function components.",
    detailedExplanation:
      "It runs after render; the dependency array controls when it re-runs. It can return a cleanup function.",
    category: "React Hooks",
    difficulty: "medium",
  },
]

const algorithmQuestions: QuizQuestion[] = [
  {
    id: 9,
    question: "What is the time complexity of accessing an element in an array by index?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 0,
    explanation: "Array index access is O(1) — constant time.",
    detailedExplanation:
      "Arrays are contiguous in memory, so address calculation is constant time: base + index * elementSize.",
    category: "Data Structures",
    difficulty: "easy",
  },
  {
    id: 10,
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
    correctAnswer: 1,
    explanation: "Quick Sort is O(n log n) on average (though O(n²) worst-case).",
    detailedExplanation:
      "Quick Sort typically performs well in practice. Merge Sort is O(n log n) worst-case too but uses extra memory.",
    category: "Algorithms",
    difficulty: "medium",
  },
]

const webDevQuestions: QuizQuestion[] = [
  {
    id: 11,
    question: "Which HTTP status code indicates a successful GET request?",
    options: ["200", "201", "204", "304"],
    correctAnswer: 0,
    explanation: "200 (OK) indicates a successful GET request.",
    detailedExplanation:
      "201 is for resource creation (often POST). 204 is success with no body. 304 is cache-related (not modified).",
    category: "Web Development",
    difficulty: "easy",
  },
  {
    id: 12,
    question: "What is the correct way to handle promises in JavaScript?",
    options: ["promise.then().catch()", "promise.catch().then()", "Both A and B are correct", "Neither A nor B"],
    correctAnswer: 2,
    explanation: "Both patterns are valid; chaining order changes how you handle errors/fallbacks.",
    detailedExplanation:
      "Common is then().catch() for success then error. catch().then() can provide fallbacks and continue.",
    category: "Web Development",
    difficulty: "medium",
  },
]

export const quizCategories: QuizCategory[] = [
  {
    id: "javascript",
    name: "JavaScript Quiz",
    description: "Test your knowledge of JavaScript—from fundamentals to tricky quirks.",
    iconKey: "laptop",
    color: "yellow",
    questions: javascriptQuestions,
  },
  {
    id: "react",
    name: "React.js Quiz",
    description: "Dive into React hooks, components, and modern React patterns.",
    iconKey: "atom",
    color: "blue",
    questions: reactQuestions,
  },
  {
    id: "algorithms",
    name: "Algorithms & DS Quiz",
    description: "Challenge yourself with time complexity and core data structures.",
    iconKey: "brain",
    color: "purple",
    questions: algorithmQuestions,
  },
  {
    id: "webdev",
    name: "Web Dev Quiz",
    description: "Cover HTTP, APIs, and practical web development concepts.",
    iconKey: "globe",
    color: "green",
    questions: webDevQuestions,
  },
]

export function getQuizCategoryById(id: string): QuizCategory | null {
  return quizCategories.find((c) => c.id === id) ?? null
}

