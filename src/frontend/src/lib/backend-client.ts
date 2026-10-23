import type {
  ApiError,
  Result,
  Result_1,
  Result_2,
  Result_3,
  Result_4,
  Result_5,
} from "@/backend";

/** Human-readable message for a backend `ApiError` variant. */
export function apiErrorMessage(error: ApiError): string {
  switch (error.__kind__) {
    case "alreadyUsed":
      return "This code has already been used.";
    case "conflict":
      return error.conflict || "This action conflicts with the current state.";
    case "expired":
      return "This code has expired.";
    case "notAuthorized":
      return "You are not authorized to perform this action.";
    case "invalidInput":
      return error.invalidInput || "Some of the details provided are invalid.";
    case "notFound":
      return "We could not find what you were looking for.";
    case "rateLimited":
      return "Too many requests. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

type AnyResult = Result | Result_1 | Result_2 | Result_3 | Result_4 | Result_5;

/** Unwrap a backend `Result`, throwing a readable Error on the `err` branch. */
export function unwrapResult<T extends AnyResult>(
  result: T,
): Extract<T, { __kind__: "ok" }>["ok"] {
  if (result.__kind__ === "err") {
    throw new Error(apiErrorMessage(result.err as ApiError));
  }
  return result.ok as Extract<T, { __kind__: "ok" }>["ok"];
}

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function validatePhoto(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    return "Please choose a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return "Images must be 8 MB or smaller.";
  }
  return null;
}
