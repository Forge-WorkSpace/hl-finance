const AVATAR_COLORS: [string, string][] = [
  ["#EFF6FF", "#2563EB"],
  ["#F0FDF4", "#16A34A"],
  ["#FFF7ED", "#EA580C"],
  ["#F5F3FF", "#7C3AED"],
  ["#FEF2F2", "#DC2626"],
  ["#ECFEFF", "#0891B2"],
  ["#FDF4FF", "#C026D3"],
  ["#FFFBEB", "#D97706"],
];

export function getCustomerInitials(name: string): string {
  const parts = name
    .replace(/^(PT|CV|UD|Toko|Apotek)\s+/i, "")
    .trim()
    .split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")
  ).toUpperCase();
}

export function getAvatarColors(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % 997;
  }
  const [bg, text] = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return { bg, text };
}
