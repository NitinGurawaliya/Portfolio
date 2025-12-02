# Acernity UI Components

यह directory Acernity UI components के लिए है। आप यहाँ Acernity UI से components copy कर सकते हैं।

## Setup Complete ✅

- ✅ Utility functions ready हैं (`src/lib/acernity-utils.ts`)
- ✅ Framer Motion installed है
- ✅ Tailwind CSS configured है
- ✅ TypeScript setup है

## Usage

1. [Acernity UI website](https://ui.aceternity.com/) से component code copy करें
2. इस directory में component file create करें
3. `src/lib/acernity-utils.ts` से utilities import करें

## Example

```tsx
import { cn } from "@/lib/acernity-utils";
import { motion } from "framer-motion";

export function ExampleComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("p-4 rounded-lg")}
    >
      Your component here
    </motion.div>
  );
}
```

## Common Utilities

- `cn()` - Class names merge करने के लिए
- `gradients` - Pre-defined gradient classes
- `borderRadius` - Border radius utilities
- `getAnimationDelay()` - Animation delays के लिए
- `textGradient()` - Text gradients के लिए
- `containerClass` - Container wrapper class
- `sectionPadding` - Section padding utility

## Next Steps

अब आप Acernity UI components को portfolio layout में use कर सकते हैं!

