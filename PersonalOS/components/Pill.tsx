"use client";

import type { ButtonHTMLAttributes } from "react";

export function Pill({
  active,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`pill ${active ? "pill-active" : ""} ${className}`.trim()}
      {...props}
    />
  );
}
