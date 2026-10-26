"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCompactCurrency,
  formatCurrency,
} from "@/lib/formatters/currency";

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function MonthlyExpenseChart({
  data,
}: {
  data: Array<{ month: number; amount: number }>;
}) {
  const chartData = data.map((item) => ({
    ...item,
    label: MONTHS[item.month - 1],
  }));
  return (
    <div>
      <div
        className="h-72"
        role="img"
        aria-label="Gráfico de linha da evolução mensal das despesas"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 4, right: 12, top: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={formatCompactCurrency} width={72} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line
              dataKey="amount"
              name="Despesas"
              stroke="#006b62"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="sr-only">
        {chartData.map((item) => (
          <li key={item.month}>
            {item.label}: {formatCurrency(item.amount)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DeputyCategoryChart({
  data,
}: {
  data: Array<{ label: string; amount: number; officialNames: string[] }>;
}) {
  const shown = data.slice(0, 7);
  return (
    <div>
      <div
        className="h-80"
        role="img"
        aria-label="Gráfico de barras das despesas por categoria"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={shown}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={formatCompactCurrency} />
            <YAxis
              type="category"
              dataKey="label"
              width={112}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar
              dataKey="amount"
              name="Despesas"
              fill="#e5a11a"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 grid gap-2 text-sm">
        {shown.map((item) => (
          <li
            className="flex justify-between gap-4 border-b border-[var(--line)] py-2"
            key={item.label}
            title={`Nome oficial: ${item.officialNames.join(", ")}`}
          >
            <span>{item.label}</span>
            <strong>{formatCurrency(item.amount)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
