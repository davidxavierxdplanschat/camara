import "server-only";
import { aggregateDashboard } from "@/lib/aggregations/dashboard";
import type { CeapSnapshot, DashboardFilters } from "@/lib/aggregations/types";
import { citizenCategory } from "@/config/expense-categories";

export const AVAILABLE_YEARS = [2026] as const;

export async function loadSnapshot(year: number): Promise<CeapSnapshot> {
  if (!AVAILABLE_YEARS.includes(year as (typeof AVAILABLE_YEARS)[number])) {
    throw new Error("Ano sem arquivo agregado disponível.");
  }
  const snapshotModule = await import(`@/data/ceap-${year}.json`);
  return snapshotModule.default as CeapSnapshot;
}

export async function getDashboardData(filters: DashboardFilters) {
  return aggregateDashboard(await loadSnapshot(filters.year), filters);
}

export async function getSnapshotDeputySummary(
  id: number,
  year: number,
  month?: number,
) {
  const snapshot = await loadSnapshot(year);
  const records = snapshot.records.filter(
    (record) => record.deputyId === id && (!month || record.month === month),
  );
  const monthly = new Map<number, number>();
  const categories = new Map<
    string,
    { amount: number; officialNames: Set<string> }
  >();
  let total = 0;
  for (const record of records) {
    total += record.amount;
    monthly.set(record.month, (monthly.get(record.month) ?? 0) + record.amount);
    const label = citizenCategory(record.officialCategory);
    const category = categories.get(label) ?? {
      amount: 0,
      officialNames: new Set<string>(),
    };
    category.amount += record.amount;
    category.officialNames.add(record.officialCategory);
    categories.set(label, category);
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
    suppliers: month
      ? []
      : (snapshot.suppliers ?? []).filter(
          (supplier) => supplier.deputyId === id,
        ),
  };
}
