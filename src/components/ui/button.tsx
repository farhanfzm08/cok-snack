import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm active:scale-[0.98]",
    secondary:
      "bg-lavender text-primary-dark hover:bg-opacity-80 focus:ring-primary font-semibold active:scale-[0.98]",
    outline:
      "border border-line bg-surface text-foreground hover:bg-background focus:ring-primary active:scale-[0.98]",
    danger:
      "bg-danger text-white hover:bg-red-700 focus:ring-danger shadow-sm active:scale-[0.98]",
    ghost:
      "bg-transparent text-muted hover:text-foreground hover:bg-black/5 focus:ring-primary",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : null}
      {children}
    </button>
  );
}
