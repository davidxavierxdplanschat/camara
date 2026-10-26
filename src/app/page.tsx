import { z } from "zod";
import { getDashboardData, AVAILABLE_YEARS } from "@/lib/data/dashboard-data";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { DashboardFilters } from "@/components/filters/dashboard-filters";
import { TopDeputiesChart } from "@/components/charts/top-deputies-chart";
import { CategoryDonut } from "@/components/charts/category-donut";
import { DeputySearch } from "@/components/deputies/deputy-search";
import { branding } from "@/config/branding";

const filtersSchema = z.object({
  ano: z.coerce
    .number()
    .int()
    .refine((value) => (AVAILABLE_YEARS as readonly number[]).includes(value))
    .catch(AVAILABLE_YEARS[0]),
  mes: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).max(12).optional().catch(undefined),
  ),
  partido: z
    .string()
    .trim()
    .max(20)
    .regex(/^[\p{L}\d.+-]+$/u)
    .optional()
    .catch(undefined),
  uf: z.string().trim().length(2).toUpperCase().optional().catch(undefined),
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = filtersSchema.parse({
    ano: params.ano ?? AVAILABLE_YEARS[0],
    mes: params.mes,
    partido: params.partido,
    uf: params.uf,
  });
  const data = await getDashboardData({
    year: parsed.ano,
    month: parsed.mes,
    party: parsed.partido,
    uf: parsed.uf,
  });
  const period = parsed.mes
    ? `${String(parsed.mes).padStart(2, "0")}/${parsed.ano}`
    : `ano de ${parsed.ano}`;
  return (
    <>
      <section className="overflow-hidden bg-[var(--ink)] py-12 text-white sm:py-16">
        <div className="container-app">
          <p className="eyebrow !text-amber-300">Dados públicos, explicados</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            Para onde vai a Cota Parlamentar?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-200">
            Veja despesas publicadas pela Câmara dos Deputados, com filtros
            simples e contexto para entender os números.
          </p>
          <p className="mt-5 max-w-2xl rounded-lg border border-white/20 bg-white/8 p-3 text-sm text-slate-200">
            Projeto independente. Não representa oficialmente a Câmara dos
            Deputados e não emite avaliações sobre os registros.
          </p>
        </div>
      </section>
      <div className="container-app space-y-8 py-8 sm:py-12">
        <DashboardFilters data={data} />
        <SummaryCards data={data} />
        <section className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[1.35fr_.85fr]">
          <article className="card min-w-0 p-5 sm:p-7">
            <p className="eyebrow">Comparação</p>
            <h2 className="mt-1 text-2xl font-black">
              Maiores despesas no período
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Top 5 entre os registros que atendem aos filtros. Selecione um
              nome para abrir o perfil.
            </p>
            <TopDeputiesChart deputies={data.topDeputies} />
          </article>
          <article className="card min-w-0 p-5 sm:p-7">
            <p className="eyebrow">Distribuição</p>
            <h2 className="mt-1 text-2xl font-black">
              Onde o recurso foi usado
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Categorias abaixo de 3% são agrupadas para facilitar a leitura.
            </p>
            <CategoryDonut categories={data.categories} />
          </article>
        </section>
        <DeputySearch />
        <section
          className="card p-5 sm:p-7"
          aria-labelledby="transparency-title"
        >
          <p className="eyebrow">Transparência</p>
          <h2 id="transparency-title" className="mt-1 text-2xl font-black">
            Sobre estes dados
          </h2>
          <div className="mt-4 grid gap-5 text-sm sm:grid-cols-3">
            <div>
              <strong className="block">Origem oficial</strong>
              <p className="mt-1 text-[var(--muted)]">
                Portal de Dados Abertos da Câmara dos Deputados.
              </p>
            </div>
            <div>
              <strong className="block">Período consultado</strong>
              <p className="mt-1 text-[var(--muted)]">{period}</p>
            </div>
            <div>
              <strong className="block">Retrato atualizado em</strong>
              <p className="mt-1 text-[var(--muted)]">
                <time dateTime={data.updatedAt}>
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "long",
                    timeStyle: "short",
                    timeZone: "America/Sao_Paulo",
                  }).format(new Date(data.updatedAt))}
                </time>
              </p>
            </div>
          </div>
          <p className="mt-5 text-[var(--muted)]">
            Os valores representam registros de despesas líquidas publicados
            pela Câmara. Atualizações e correções posteriores na fonte podem
            alterar os totais.
          </p>
          <a
            className="mt-4 inline-flex font-bold text-[var(--brand)] underline underline-offset-4"
            href={data.sourceUrl}
          >
            Consultar o arquivo oficial usado
          </a>
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          <a
            className="inline-flex font-bold text-[var(--brand)] underline underline-offset-4"
            href={branding.officialSourceUrl}
          >
            Portal oficial
          </a>
        </section>
      </div>
    </>
  );
}
