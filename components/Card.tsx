import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg shadow bg-white dark:bg-zinc-900 p-6 ${className}`}>
      {children}
    </div>
  );
}
