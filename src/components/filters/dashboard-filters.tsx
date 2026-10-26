import Link from "next/link";
import type { DashboardData } from "@/lib/aggregations/types";
import { AVAILABLE_YEARS } from "@/lib/data/dashboard-data";

const MONTHS = [
  "Todos",
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function DashboardFilters({ data }: { data: DashboardData }) {
  return (
    <form
      action="/"
      method="get"
      className="card p-4 sm:p-5"
      aria-label="Filtros do dashboard"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-bold">
          Ano
          <select
            className="field mt-1 font-normal"
            name="ano"
            defaultValue={data.filters.year}
          >
            {AVAILABLE_YEARS.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold">
          Mês
          <select
            className="field mt-1 font-normal"
            name="mes"
            defaultValue={data.filters.month ?? ""}
          >
            <option value="">Todos os meses</option>
            {MONTHS.slice(1).map((month, index) => (
              <option value={index + 1} key={month}>
                {month}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold">
          Partido
          <select
            className="field mt-1 font-normal"
            name="partido"
            defaultValue={data.filters.party ?? ""}
          >
            <option value="">Todos os partidos</option>
            {data.parties.map((party) => (
              <option key={party}>{party}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold">
          Estado — UF
          <select
            className="field mt-1 font-normal"
            name="uf"
            defaultValue={data.filters.uf ?? ""}
          >
            <option value="">Todos os estados</option>
            {data.states.map((uf) => (
              <option key={uf}>{uf}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="button-primary" type="submit">
          Aplicar filtros
        </button>
        <Link
          className="button-secondary inline-flex items-center no-underline"
          href="/"
        >
          Limpar filtros
        </Link>
      </div>
    </form>
  );
}
