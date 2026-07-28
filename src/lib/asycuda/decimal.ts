const DECIMAL_PATTERN = /^-?\d+(?:\.\d+)?$/;

/** Convert a decimal value to integer minor units without binary floating-point math. */
export function toMinorUnits(value: string | number | null | undefined, scale = 2): bigint | null {
  if (value == null || value === "") return null;
  const raw = String(value).trim();
  if (!DECIMAL_PATTERN.test(raw)) return null;

  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole, fraction = ""] = unsigned.split(".");
  const padded = (fraction + "0".repeat(scale + 1)).slice(0, scale + 1);
  const kept = padded.slice(0, scale);
  const roundDigit = Number(padded.charAt(scale) || "0");

  let minor = BigInt(whole) * 10n ** BigInt(scale) + BigInt(kept || "0");
  if (roundDigit >= 5) minor += 1n;
  return negative ? -minor : minor;
}

export function formatMinorUnits(value: bigint, scale = 2): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const divisor = 10n ** BigInt(scale);
  const whole = absolute / divisor;
  const fraction = (absolute % divisor).toString().padStart(scale, "0");
  return `${negative ? "-" : ""}${whole.toString()}${scale > 0 ? `.${fraction}` : ""}`;
}

export function sumMinorUnits(values: Array<string | number | null | undefined>, scale = 2): bigint {
  return values.reduce<bigint>((sum, value) => sum + (toMinorUnits(value, scale) ?? 0n), 0n);
}
