import type { ReactNode } from "react";

export function StatusMessage({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "error";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`rounded-xl border p-4 ${tone === "error" ? "border-red-300 bg-red-50 text-red-900" : "border-sky-200 bg-sky-50 text-sky-950"}`}
    >
      {children}
    </div>
  );
}
