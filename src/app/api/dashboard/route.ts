import { NextResponse } from "next/server";
import { z } from "zod";
import { getDashboardData, AVAILABLE_YEARS } from "@/lib/data/dashboard-data";

const schema = z.object({
  year: z.coerce
    .number()
    .refine((value) => (AVAILABLE_YEARS as readonly number[]).includes(value)),
  month: z.coerce.number().min(1).max(12).optional(),
  party: z.string().max(20).optional(),
  uf: z.string().length(2).optional(),
});
export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = schema.safeParse({
    year: url.searchParams.get("ano") ?? AVAILABLE_YEARS[0],
    month: url.searchParams.get("mes") || undefined,
    party: url.searchParams.get("partido") || undefined,
    uf: url.searchParams.get("uf") || undefined,
  });
  if (!parsed.success)
    return NextResponse.json({ error: "Filtros inválidos." }, { status: 400 });
  const { year, month, party, uf } = parsed.data;
  return NextResponse.json({
    data: await getDashboardData({ year, month, party, uf }),
  });
}
