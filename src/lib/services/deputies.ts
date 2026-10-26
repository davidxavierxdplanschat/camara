import {
  deputyDetailSchema,
  deputyExpenseSchema,
  deputySummarySchema,
  itemSchema,
  listSchema,
} from "@/lib/api/schemas";
import { fetchCamara } from "@/lib/api/camara-client";
import { fetchAllPages } from "@/lib/api/pagination";
import type {
  DeputyDetail,
  DeputyExpense,
  DeputySummary,
} from "@/lib/api/types";
import { citizenCategory } from "@/config/expense-categories";
import {
  AVAILABLE_YEARS,
  getSnapshotDeputySummary,
} from "@/lib/data/dashboard-data";

export async function searchDeputies(query: string): Promise<DeputySummary[]> {
  const normalized = query.trim().slice(0, 80);
  if (normalized.length < 2) return [];
  const result = await fetchCamara(
    "/deputados",
    listSchema(deputySummarySchema),
    { nome: normalized, itens: 8, ordenarPor: "nome", ordem: "ASC" },
    { revalidate: 3_600 },
  );
  return result.dados.slice(0, 8) as DeputySummary[];
}

export async function getDeputy(id: number): Promise<DeputyDetail> {
  const result = await fetchCamara(
    `/deputados/${id}`,
    itemSchema(deputyDetailSchema),
    {},
    { revalidate: 86_400 },
  );
  return result.dados as DeputyDetail;
}

export async function getDeputyExpenses(
  id: number,
  year: number,
  month?: number,
): Promise<DeputyExpense[]> {
  return fetchAllPages<DeputyExpense>(
    `/deputados/${id}/despesas`,
    listSchema(deputyExpenseSchema),
    { ano: year, mes: month, ordenarPor: "dataDocumento", ordem: "DESC" },
    { maxPages: 30, revalidate: 3_600 },
  );
}

export function summarizeDeputyExpenses(expenses: DeputyExpense[]) {
  const monthly = new Map<number, number>();
  const categories = new Map<
    string,
    { amount: number; officialNames: Set<string> }
  >();
  const suppliers = new Map<string, number>();
  let total = 0;

  for (const expense of expenses) {
    total += expense.valorLiquido;
    monthly.set(
      expense.mes,
      (monthly.get(expense.mes) ?? 0) + expense.valorLiquido,
    );
    const label = citizenCategory(expense.tipoDespesa);
    const category = categories.get(label) ?? {
      amount: 0,
      officialNames: new Set<string>(),
    };
    category.amount += expense.valorLiquido;
    category.officialNames.add(expense.tipoDespesa);
    categories.set(label, category);
    suppliers.set(
      expense.nomeFornecedor,
      (suppliers.get(expense.nomeFornecedor) ?? 0) + expense.valorLiquido,
    );
  }

  return {
    total,
    monthly: Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      amount: monthly.get(index + 1) ?? 0,
    })),
    categories: [...categories.entries()]
      .map(([label, value]) => ({
        label,
        amount: value.amount,
        officialNames: [...value.officialNames],
      }))
      .sort((a, b) => b.amount - a.amount),
    suppliers: [...suppliers.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8),
  };
}

export async function getDeputyExpenseData(
  id: number,
  year: number,
  month?: number,
) {
  const expenses = await getDeputyExpenses(id, year, month);
  if (expenses.length)
    return {
      summary: summarizeDeputyExpenses(expenses),
      source: "api" as const,
    };
  if ((AVAILABLE_YEARS as readonly number[]).includes(year)) {
    return {
      summary: await getSnapshotDeputySummary(id, year, month),
      source: "annual-file" as const,
    };
  }
  return { summary: summarizeDeputyExpenses([]), source: "api" as const };
}
