import { citizenCategory } from "@/config/expense-categories";
import type { CeapSnapshot, DashboardData, DashboardFilters } from "./types";

function add(map: Map<string, number>, key: string, amount: number) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

export function aggregateDashboard(
  snapshot: CeapSnapshot,
  filters: DashboardFilters,
): DashboardData {
  const filtered = snapshot.records.filter(
    (record) =>
      (!filters.month || record.month === filters.month) &&
      (!filters.party || record.party === filters.party) &&
      (!filters.uf || record.uf === filters.uf),
  );
  const deputies = new Map<
    number,
    { name: string; party: string; uf: string; amount: number }
  >();
  const categories = new Map<string, number>();
  const officialNames = new Map<string, Set<string>>();
  let total = 0;

  for (const record of filtered) {
    total += record.amount;
    const deputy = deputies.get(record.deputyId) ?? {
      name: record.deputyName,
      party: record.party,
      uf: record.uf,
      amount: 0,
    };
    deputy.amount += record.amount;
    deputies.set(record.deputyId, deputy);
    const category = citizenCategory(record.officialCategory);
    add(categories, category, record.amount);
    const names = officialNames.get(category) ?? new Set<string>();
    names.add(record.officialCategory);
    officialNames.set(category, names);
  }

  const sortedCategories = [...categories.entries()].sort(
    (a, b) => b[1] - a[1],
  );
  const major = sortedCategories.filter(
    ([, amount]) => total === 0 || amount / total >= 0.03,
  );
  const small = sortedCategories.filter(
    ([, amount]) => total > 0 && amount / total < 0.03,
  );
  if (small.length) {
    major.push([
      "Outras despesas",
      small.reduce((sum, [, amount]) => sum + amount, 0),
    ]);
  }

  return {
    filters,
    total,
    deputyCount: deputies.size,
    averagePerDeputy: deputies.size ? total / deputies.size : 0,
    leadingCategory: sortedCategories[0]?.[0] ?? "Sem despesas no período",
    topDeputies: [...deputies.entries()]
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5)
      .map(([id, deputy]) => ({
        id,
        name: deputy.name,
        party: deputy.party,
        uf: deputy.uf,
        amount: deputy.amount,
        photoUrl: `https://www.camara.leg.br/internet/deputado/bandep/${id}.jpg`,
      })),
    categories: major.map(([label, amount]) => ({
      label,
      amount,
      percentage: total ? (amount / total) * 100 : 0,
      officialNames:
        label === "Outras despesas"
          ? small.flatMap(([smallLabel]) => [
              ...(officialNames.get(smallLabel) ?? []),
            ])
          : [...(officialNames.get(label) ?? [])],
    })),
    parties: [
      ...new Set(
        snapshot.records.map((record) => record.party).filter(Boolean),
      ),
    ].sort(),
    states: [
      ...new Set(snapshot.records.map((record) => record.uf).filter(Boolean)),
    ].sort(),
    sourceUrl: snapshot.sourceUrl,
    updatedAt: snapshot.generatedAt,
    partial: false,
  };
}
