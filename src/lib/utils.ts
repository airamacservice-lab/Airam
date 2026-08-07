/** Join class names, skipping falsy values. */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/** Format 8000 → "8,000+" for stat displays. */
export function statNumber(n: number): string {
  return `${n.toLocaleString("en-IN")}+`;
}
