import { getAvatarColors, getCustomerInitials } from "@/lib/customers/avatar";

interface CustomerAvatarProps {
  name: string;
  size?: number;
}

export function CustomerAvatar({ name, size = 36 }: CustomerAvatarProps) {
  const { bg, text } = getAvatarColors(name);
  const fontSize = size >= 48 ? 18 : 13;

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: text,
        fontSize,
      }}
    >
      {getCustomerInitials(name)}
    </div>
  );
}
