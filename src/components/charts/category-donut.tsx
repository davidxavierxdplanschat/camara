"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardData } from "@/lib/aggregations/types";
import { formatCurrency } from "@/lib/formatters/currency";

const COLORS = [
  "#006b62",
  "#e5a11a",
  "#3568a8",
  "#8b5e3c",
  "#7c4d9e",
  "#4f7b43",
  "#b65c6d",
];

export function CategoryDonut({
  categories,
}: {
  categories: DashboardData["categories"];
}) {
  if (!categories.length)
    return (
      <p className="py-8 text-[var(--muted)]">
        Nenhuma categoria encontrada para estes filtros.
      </p>
    );
  return (
    <div>
      <div
        className="h-64"
        role="img"
        aria-label="Gráfico de rosca da distribuição das despesas por categoria"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="amount"
              nameKey="label"
              innerRadius={62}
              outerRadius={98}
              paddingAngle={2}
            >
              {categories.map((category, index) => (
                <Cell
                  key={category.label}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid gap-2" aria-label="Alternativa textual ao gráfico">
        {categories.map((category, index) => (
          <li
            className="flex items-start justify-between gap-3 text-sm"
            key={category.label}
            title={`Categorias oficiais: ${category.officialNames.join(", ")}`}
          >
            <span className="flex items-center gap-2">
              <span
                className="mt-1 size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                aria-hidden="true"
              />
              <span>
                <strong>{category.label}</strong>
                <span className="block text-xs text-[var(--muted)]">
                  {category.percentage.toFixed(1).replace(".", ",")}%
                </span>
              </span>
            </span>
            <span className="font-bold">{formatCurrency(category.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
