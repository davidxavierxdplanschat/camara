"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DeputySummary } from "@/lib/api/types";

export function DeputySearch() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DeputySummary[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [active, setActive] = useState(-1);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    const timer = setTimeout(async () => {
      abort.current?.abort();
      abort.current = new AbortController();
      setState("loading");
      try {
        const response = await fetch(
          `/api/deputados?nome=${encodeURIComponent(query)}`,
          { signal: abort.current.signal },
        );
        if (!response.ok) throw new Error();
        const body = (await response.json()) as { data: DeputySummary[] };
        setResults(body.data);
        setActive(-1);
        setState("ready");
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError"))
          setState("error");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  function onQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      abort.current?.abort();
      setResults([]);
      setState("idle");
      setActive(-1);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    }
    if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      router.push(`/deputados/${results[active].id}`);
    }
    if (event.key === "Escape") {
      setResults([]);
      setActive(-1);
    }
  }

  return (
    <section
      id="busca"
      aria-labelledby="search-title"
      className="card relative p-5 sm:p-7"
    >
      <p className="eyebrow">Consulta individual</p>
      <h2 id="search-title" className="mt-1 text-2xl font-black">
        Encontre um deputado
      </h2>
      <p className="mt-1 text-[var(--muted)]">
        Digite pelo menos duas letras do nome parlamentar.
      </p>
      <label className="mt-5 block font-bold" htmlFor="deputy-search">
        Nome do deputado
      </label>
      <input
        id="deputy-search"
        type="search"
        className="field mt-1"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Ex.: Maria, João..."
      />
      <div
        className="mt-2 min-h-6 text-sm text-[var(--muted)]"
        aria-live="polite"
      >
        {state === "loading" && "Buscando na Câmara..."}
        {state === "error" &&
          "A busca está indisponível no momento. Tente novamente."}
        {state === "ready" && !results.length && "Nenhum deputado encontrado."}
      </div>
      {results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-80 w-[calc(100%-2.5rem)] overflow-auto rounded-xl border border-[var(--line)] bg-white p-1 shadow-xl sm:w-[calc(100%-3.5rem)]"
        >
          {results.map((deputy, index) => (
            <li
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              key={deputy.id}
            >
              <button
                type="button"
                onClick={() => router.push(`/deputados/${deputy.id}`)}
                className={`flex min-h-16 w-full items-center gap-3 rounded-lg p-2 text-left ${index === active ? "bg-emerald-50" : "hover:bg-[var(--paper)]"}`}
              >
                <Image
                  src={deputy.urlFoto}
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover"
                  alt=""
                />
                <span>
                  <strong className="block">{deputy.nome}</strong>
                  <span className="text-sm text-[var(--muted)]">
                    {deputy.siglaPartido} · {deputy.siglaUf}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
