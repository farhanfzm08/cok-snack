import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  pastelAccent?: "lavender" | "mint" | "peach" | "yellow" | "sky" | "none";
}

export function Card({
  children,
  className = "",
  pastelAccent = "none",
  ...props
}: CardProps) {
  const accentClasses = {
    none: "border-line/70",
    lavender: "border-l-4 border-l-primary/60 border-t-line/60 border-r-line/60 border-b-line/60",
    mint: "border-l-4 border-l-success/60 border-t-line/60 border-r-line/60 border-b-line/60",
    peach: "border-l-4 border-l-[#F28B82] border-t-line/60 border-r-line/60 border-b-line/60",
    yellow: "border-l-4 border-l-warning/60 border-t-line/60 border-r-line/60 border-b-line/60",
    sky: "border-l-4 border-l-[#4A90E2] border-t-line/60 border-r-line/60 border-b-line/60",
  };

  return (
    <div
      className={`bg-surface rounded-2xl border ${accentClasses[pastelAccent]} p-5 shadow-xs transition-shadow hover:shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pb-3 mb-3 border-b border-line/60">
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
