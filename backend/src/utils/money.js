export function toCents(amount) {
    const value = String(amount);
    const negative = value.startsWith("-");
    const normalized = negative ? value.slice(1) : value;
    const [whole, decimal = ""] = normalized.split(".");

    const cents =
        BigInt(whole) * 100n +
        BigInt(decimal.padEnd(2, "0").slice(0, 2) || "0");

    return negative ? -cents : cents;
}

export function formatCents(cents) {
    const negative = cents < 0n;
    const absolute = negative ? -cents : cents;
    const whole = absolute / 100n;
    const decimal = String(absolute % 100n).padStart(2, "0");

    return `${negative ? "-" : ""}${whole}.${decimal}`;
}

export function toScaledBigInt(value, scale) {
    const text = String(value);
    const [whole, fraction = ""] = text.split(".");
    const digits = fraction.slice(0, scale).padEnd(scale, "0");
    const extra = fraction.slice(scale);
    const rounding = extra.length > 0 && extra[0] >= "5" ? 1n : 0n;

    return BigInt(whole) * 10n ** BigInt(scale) + (digits.length > 0 ? BigInt(digits) : 0n) + rounding;
}
