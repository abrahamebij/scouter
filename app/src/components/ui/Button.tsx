import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "primary-gradient text-on-primary font-headline font-bold rounded-full shadow-lg shadow-primary/10",
  secondary:
    "bg-surface-container-high text-on-surface font-headline font-bold rounded-full border border-outline-variant/10 hover:bg-surface-container-highest hover:border-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150",
  tertiary:
    "text-secondary font-body hover:underline hover:brightness-110 active:brightness-90 transition-all duration-150",
  ghost:
    "bg-surface-container text-on-surface-variant font-label text-xs rounded-full border border-outline-variant/20 hover:border-primary/40 hover:text-on-surface hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150",
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantStyles[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
