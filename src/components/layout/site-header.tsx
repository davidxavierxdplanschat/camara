import Link from "next/link";
import { branding } from "@/config/branding";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)] bg-white">
      <div className="container-app flex min-h-20 items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 no-underline"
          aria-label={`${branding.name}, página inicial`}
        >
          <span
            className="grid size-11 place-items-center rounded-xl bg-[var(--brand)] text-lg font-black text-white"
            aria-hidden="true"
          >
            CC
          </span>
          <span>
            <strong className="block text-lg leading-tight">
              {branding.name}
            </strong>
            <span className="hidden text-sm text-[var(--muted)] sm:block">
              Transparência em linguagem simples
            </span>
          </span>
        </Link>
        <a
          className="text-sm font-bold text-[var(--brand)] underline decoration-2 underline-offset-4"
          href="#busca"
        >
          Buscar deputado
        </a>
      </div>
    </header>
  );
}
