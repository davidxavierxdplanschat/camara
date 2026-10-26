import { NextResponse } from "next/server";
import { z } from "zod";
import { getDeputy, getDeputyExpenseData } from "@/lib/services/deputies";

const idSchema = z.coerce.number().int().positive();
const filterSchema = z.object({
  ano: z.coerce.number().int().min(2008).max(2026),
  mes: z.coerce.number().int().min(1).max(12).optional(),
});
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = idSchema.safeParse((await params).id);
  const url = new URL(request.url);
  const filters = filterSchema.safeParse({
    ano: url.searchParams.get("ano") ?? 2026,
    mes: url.searchParams.get("mes") || undefined,
  });
  if (!id.success || !filters.success)
    return NextResponse.json(
      { error: "Parâmetros inválidos." },
      { status: 400 },
    );
  try {
    const [deputy, expenseData] = await Promise.all([
      getDeputy(id.data),
      getDeputyExpenseData(id.data, filters.data.ano, filters.data.mes),
    ]);
    return NextResponse.json({
      data: {
        deputy: {
          id: deputy.id,
          nome: deputy.ultimoStatus.nome,
          partido: deputy.ultimoStatus.siglaPartido,
          uf: deputy.ultimoStatus.siglaUf,
          foto: deputy.ultimoStatus.urlFoto,
        },
        summary: expenseData.summary,
        source: expenseData.source,
      },
    });
  } catch (error) {
    console.error("Falha no perfil do deputado", error);
    return NextResponse.json(
      { error: "Dados da Câmara indisponíveis." },
      { status: 503 },
    );
  }
}
