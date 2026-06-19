import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
}

const MAX_PROMPT_FIELD_LENGTH = 500;

// Bounds and HTML-escapes user-supplied text before it's interpolated into an
// XML-tagged AI prompt, so untrusted input can't break out of its tag or
// smuggle instructions into the surrounding prompt.
export function escapeForPrompt(input: string): string {
  return truncate(input, MAX_PROMPT_FIELD_LENGTH)
    // eslint-disable-next-line no-control-regex -- intentionally stripping control chars from untrusted input
    .replace(/[\x00-\x09\x0b-\x1f\x7f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
