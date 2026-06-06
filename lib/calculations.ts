export function formatIDR(amount: number): string {
  const n = Math.round(amount || 0);
  return "Rp " + n.toLocaleString("id-ID");
}

export function applyCascade(price: number, steps: number[]): number {
  return steps.reduce((acc, s) => acc * (1 - s / 100), price);
}

export function effectivePct(steps: number[]): number {
  const factor = steps.reduce((acc, s) => acc * (1 - s / 100), 1);
  return (1 - factor) * 100;
}

export function stepsLabel(steps: number[]): string {
  return steps.length ? steps.map((s) => s + "%").join(" → ") : "—";
}
