"use client";

import { useEffect } from "react";
import { RetryButton } from "@/components/ui/retry-button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Falha ao renderizar página", error);
  }, [error]);
  return (
    <div className="container-app py-20">
      <div className="card mx-auto max-w-xl p-8 text-center" role="alert">
        <p className="eyebrow">Serviço temporariamente indisponível</p>
        <h1 className="mt-2 text-3xl font-black">
          Não conseguimos carregar os dados
        </h1>
        <p className="my-5 text-[var(--muted)]">
          A fonte oficial pode estar instável. Aguarde um instante e tente
          novamente.
        </p>
        <RetryButton reset={reset} />
      </div>
    </div>
  );
}
