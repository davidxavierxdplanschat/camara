export interface CeapAggregateRecord {
  deputyId: number;
  deputyName: string;
  party: string;
  uf: string;
  month: number;
  officialCategory: string;
  amount: number;
}

export interface CeapSnapshot {
  year: number;
  generatedAt: string;
  sourceUrl: string;
  records: CeapAggregateRecord[];
  suppliers?: Array<{
    deputyId: number;
    name: string;
    amount: number;
  }>;
}

export interface DashboardFilters {
  year: number;
  month?: number;
  party?: string;
  uf?: string;
}

export interface DashboardData {
  filters: DashboardFilters;
  total: number;
  deputyCount: number;
  averagePerDeputy: number;
  leadingCategory: string;
  topDeputies: Array<{
    id: number;
    name: string;
    party: string;
    uf: string;
    photoUrl: string;
    amount: number;
  }>;
  categories: Array<{
    label: string;
    amount: number;
    percentage: number;
    officialNames: string[];
  }>;
  parties: string[];
  states: string[];
  sourceUrl: string;
  updatedAt: string;
  partial: boolean;
}
