// Registers the jest-dom matchers (e.g. `toBeInTheDocument`) with Vitest's
// `Assertion` interface for the TypeScript program. The runtime registration
// lives in `vitest.setup.ts`, which sits outside `src` and so is not part of
// the `tsc --noEmit` program; this file brings the same augmentation into it.
import "@testing-library/jest-dom/vitest";
