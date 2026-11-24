export function num(n: number): string {
  return n.toLocaleString("en-KE");
}

export function kes(n: number): string {
  return "KES " + Math.abs(n).toLocaleString("en-KE");
}

export function signedKes(n: number): string {
  const sign = n < 0 ? "−" : n > 0 ? "+" : "";
  return sign + Math.abs(n).toLocaleString("en-KE");
}
