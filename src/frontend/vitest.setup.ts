import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components expose `data-ocid` hooks; use them as the test-id
// attribute so tests can reach elements that have no accessible name (e.g. the
// visually hidden file input behind the photo upload button).
configure({ testIdAttribute: "data-ocid" });

// Mirrors the runtime patch in `src/main.tsx`: TanStack Query hashes query keys
// with JSON.stringify, and the app's keys carry bigint report ids.
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

// jsdom does not implement matchMedia, which the theme hook reads on mount.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// jsdom does not implement the object-URL API the photo picker uses to build a
// local preview. Stub it so selecting a file does not throw an unhandled error.
if (typeof URL !== "undefined") {
  if (typeof URL.createObjectURL !== "function") {
    URL.createObjectURL = () => "blob:mock-preview";
  }
  if (typeof URL.revokeObjectURL !== "function") {
    URL.revokeObjectURL = () => undefined;
  }
}

// Radix UI primitives (Select, Tabs, Dialog) call pointer-capture and
// scrollIntoView APIs that jsdom does not implement.
if (typeof window !== "undefined") {
  const proto = window.HTMLElement.prototype as unknown as Record<
    string,
    unknown
  >;
  if (typeof proto.hasPointerCapture !== "function") {
    proto.hasPointerCapture = () => false;
  }
  if (typeof proto.setPointerCapture !== "function") {
    proto.setPointerCapture = () => undefined;
  }
  if (typeof proto.releasePointerCapture !== "function") {
    proto.releasePointerCapture = () => undefined;
  }
  if (typeof proto.scrollIntoView !== "function") {
    proto.scrollIntoView = () => undefined;
  }
}

afterEach(() => {
  cleanup();
});
