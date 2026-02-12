# Component Size Standards

This project enforces size limits to keep code maintainable and reusable.

## Limits

- **Components (`src/components`)**: 300 lines
- **Hooks (`src/hooks`)**: 200 lines
- **Utilities (`src/lib`)**: 100 lines

## Folder structure guidelines

Use use-case folders with shared building blocks:

- Keep feature-specific UI in feature folders (example: `src/components/dashboard/theme/`)
- Keep reusable cross-layout logic in dedicated shared folders (example: `src/components/themes/shared/`)
- Keep prop and data contracts in `shared/types.ts`
- Keep repeatable helpers in focused files (`shared/repository.ts`, `shared/social-icons.tsx`, etc.)

## Commands

Check staged files (recommended during development):

```bash
npm run quality:size
```

Check all files under `src`:

```bash
npm run quality:size:all
```

## Exceptions

Temporary exceptions for legacy oversized files are listed in:

`config/component-size-exceptions.json`

Only add exceptions when a file cannot be split in the current change. Remove exceptions after refactoring.
