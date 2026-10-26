import { NextResponse } from "next/server";
import { z } from "zod";
import { searchDeputies } from "@/lib/services/deputies";

const querySchema = z.string().trim().min(2).max(80);
export async function GET(request: Request) {
  const parsed = querySchema.safeParse(
    new URL(request.url).searchParams.get("nome"),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Informe entre 2 e 80 caracteres." },
      { status: 400 },
    );
  try {
    return NextResponse.json({ data: await searchDeputies(parsed.data) });
  } catch (error) {
    console.error("Falha na busca de deputados", error);
    return NextResponse.json(
      { error: "A busca da Câmara está indisponível." },
      { status: 503 },
    );
  }
}
