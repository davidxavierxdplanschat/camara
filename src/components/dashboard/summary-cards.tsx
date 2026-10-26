import { formatCurrency } from "@/lib/formatters/currency";
import type { DashboardData } from "@/lib/aggregations/types";

export function SummaryCards({ data }: { data: DashboardData }) {
  const items = [
    [
      "Total de despesas",
      formatCurrency(data.total),
      "Soma dos valores líquidos publicados",
    ],
    [
      "Deputados considerados",
      data.deputyCount.toLocaleString("pt-BR"),
      "Com registros no período",
    ],
    [
      "Categoria com maior gasto",
      data.leadingCategory,
      "Agrupamento em linguagem simples",
    ],
    [
      "Média por deputado",
      formatCurrency(data.averagePerDeputy),
      "Total dividido pelos deputados considerados",
    ],
  ];
  return (
    <section aria-labelledby="resumo-title">
      <h2 id="resumo-title" className="sr-only">
        Resumo do período
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value, hint]) => (
          <article className="card p-5" key={label}>
            <p className="text-sm font-bold text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{hint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
