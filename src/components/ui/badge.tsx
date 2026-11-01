import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "lavender" | "mint" | "peach" | "yellow" | "sky" | "muted" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "lavender",
  size = "md",
  className = "",
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-medium rounded-lg",
    md: "px-2.5 py-1 text-xs font-medium rounded-xl",
  };

  const variantStyles = {
    lavender: "bg-lavender text-primary-dark",
    mint: "bg-mint text-success",
    peach: "bg-peach text-[#A04128]",
    yellow: "bg-yellow text-warning",
    sky: "bg-sky text-[#1D5B99]",
    muted: "bg-line/60 text-muted",
    danger: "bg-red-100 text-danger",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
