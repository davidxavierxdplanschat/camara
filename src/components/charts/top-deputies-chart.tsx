"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardData } from "@/lib/aggregations/types";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/formatters/currency";

export function TopDeputiesChart({
  deputies,
}: {
  deputies: DashboardData["topDeputies"];
}) {
  if (!deputies.length)
    return (
      <p className="py-8 text-[var(--muted)]">
        Nenhum gasto encontrado para estes filtros.
      </p>
    );
  return (
    <div className="min-w-0">
      <div
        className="h-80 w-full min-w-0"
        role="img"
        aria-label="Gráfico de barras dos cinco deputados com maiores despesas"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={deputies}
            layout="vertical"
            margin={{ left: 8, right: 18 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={formatCompactCurrency} />
            <YAxis
              type="category"
              dataKey="name"
              width={94}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar
              dataKey="amount"
              name="Despesas"
              fill="#006b62"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ol
        className="mt-4 grid min-w-0 gap-2"
        aria-label="Alternativa textual ao gráfico"
      >
        {deputies.map((deputy, index) => (
          <li className="min-w-0" key={deputy.id}>
            <Link
              className="flex min-h-12 min-w-0 flex-col items-start justify-between gap-1 rounded-lg border border-[var(--line)] px-3 py-2 no-underline hover:bg-[var(--paper)] sm:flex-row sm:items-center sm:gap-3"
              href={`/deputados/${deputy.id}`}
            >
              <span className="min-w-0">
                <strong>
                  {index + 1}. {deputy.name}
                </strong>
                <span className="ml-2 text-sm text-[var(--muted)]">
                  {deputy.party} · {deputy.uf}
                </span>
              </span>
              <span className="font-bold">{formatCurrency(deputy.amount)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
