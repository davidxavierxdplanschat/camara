"use client";

export function RetryButton({ reset }: { reset: () => void }) {
  return (
    <button type="button" className="button-primary" onClick={reset}>
      Tentar novamente
    </button>
  );
}
