interface MaterialIconProps {
  icon: string;
  className?: string;
  fill?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
  xl: "text-4xl",
};

export default function MaterialIcon({
  icon,
  className = "",
  fill = false,
  size = "md",
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${sizeMap[size]} ${className}`}
      style={fill ? { fontVariationSettings: '"FILL" 1' } : undefined}
    >
      {icon}
    </span>
  );
}
