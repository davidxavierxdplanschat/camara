import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getDeputy, getDeputyExpenseData } from "@/lib/services/deputies";
import { CamaraApiError } from "@/lib/errors/camara-error";
import { formatCurrency } from "@/lib/formatters/currency";
import {
  MonthlyExpenseChart,
  DeputyCategoryChart,
} from "@/components/charts/deputy-expense-charts";

const CURRENT_YEAR = 2026;
const paramsSchema = z.coerce.number().int().positive();
const filterSchema = z.object({
  ano: z.coerce.number().int().min(2008).max(CURRENT_YEAR).catch(CURRENT_YEAR),
  mes: z.preprocess(
    (value) => (value === "" || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).max(12).optional().catch(undefined),
  ),
});
const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

async function safeGetDeputy(id: number) {
  try {
    return await getDeputy(id);
  } catch (error) {
    if (error instanceof CamaraApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const parsed = paramsSchema.safeParse((await params).id);
  if (!parsed.success) return { title: "Deputado não encontrado" };
  try {
    const deputy = await safeGetDeputy(parsed.data);
    return {
      title: deputy.ultimoStatus.nome,
      description: `Consulte as despesas da Cota Parlamentar de ${deputy.ultimoStatus.nome}.`,
    };
  } catch {
    return { title: "Perfil do deputado" };
  }
}

export default async function DeputyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const id = paramsSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const rawFilters = await searchParams;
  const filters = filterSchema.parse({
    ano: rawFilters.ano ?? CURRENT_YEAR,
    mes: rawFilters.mes,
  });
  const [deputy, expenseData] = await Promise.all([
    safeGetDeputy(id.data),
    getDeputyExpenseData(id.data, filters.ano, filters.mes),
  ]);
  const { summary } = expenseData;
  const status = deputy.ultimoStatus;
  const officialProfile = `https://www.camara.leg.br/deputados/${id.data}`;
  return (
    <div className="container-app py-8 sm:py-12">
      <nav
        aria-label="Navegação estrutural"
        className="mb-6 text-sm text-[var(--muted)]"
      >
        <Link className="font-bold text-[var(--brand)] underline" href="/">
          Início
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{status.nome}</span>
      </nav>
      <header className="card overflow-hidden">
        <div className="h-3 bg-[var(--brand)]" />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-8">
          <Image
            className="size-28 rounded-2xl border border-[var(--line)] object-cover"
            src={status.urlFoto}
            width={160}
            height={160}
            preload
            alt={`Foto oficial de ${status.nome}`}
          />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Perfil parlamentar</p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">
              {status.nome}
            </h1>
            <p className="mt-2 text-lg text-[var(--muted)]">
              {status.siglaPartido} · {status.siglaUf}
            </p>
            <a
              className="mt-3 inline-flex font-bold text-[var(--brand)] underline underline-offset-4"
              href={officialProfile}
            >
              Ver perfil oficial na Câmara
            </a>
          </div>
          <div className="rounded-xl bg-[var(--paper)] p-5 sm:min-w-64">
            <span className="block text-sm font-bold text-[var(--muted)]">
              Total no período
            </span>
            <strong className="mt-1 block text-3xl">
              {formatCurrency(summary.total)}
            </strong>
            <span className="mt-1 block text-xs text-[var(--muted)]">
              Valor líquido publicado
            </span>
          </div>
        </div>
      </header>
      <form
        className="card mt-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-end"
        method="get"
      >
        <label className="flex-1 text-sm font-bold">
          Ano
          <select
            className="field mt-1 font-normal"
            name="ano"
            defaultValue={filters.ano}
          >
            {Array.from(
              { length: CURRENT_YEAR - 2007 },
              (_, index) => CURRENT_YEAR - index,
            ).map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-sm font-bold">
          Mês
          <select
            className="field mt-1 font-normal"
            name="mes"
            defaultValue={filters.mes ?? ""}
          >
            <option value="">Todos os meses</option>
            {months.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </label>
        <button className="button-primary" type="submit">
          Atualizar período
        </button>
      </form>
      <p className="mt-3 text-sm text-[var(--muted)]" aria-live="polite">
        Fonte deste resumo:{" "}
        {expenseData.source === "annual-file"
          ? "arquivo anual oficial da CEAP"
          : "API oficial da Câmara"}
        .
      </p>
      {summary.total === 0 ? (
        <div
          className="card mt-6 p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <h2 className="text-xl font-black">Nenhuma despesa encontrada</h2>
          <p className="mt-2 text-[var(--muted)]">
            Não há registros publicados para este deputado no período
            selecionado.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
          <section
            className="card min-w-0 p-5 sm:p-7"
            aria-labelledby="monthly-title"
          >
            <p className="eyebrow">Ao longo do ano</p>
            <h2 id="monthly-title" className="mt-1 text-2xl font-black">
              Evolução mensal
            </h2>
            <MonthlyExpenseChart data={summary.monthly} />
          </section>
          <section
            className="card min-w-0 p-5 sm:p-7"
            aria-labelledby="category-title"
          >
            <p className="eyebrow">Composição</p>
            <h2 id="category-title" className="mt-1 text-2xl font-black">
              Gastos por categoria
            </h2>
            <DeputyCategoryChart data={summary.categories} />
          </section>
        </div>
      )}
      {summary.suppliers.length > 0 && (
        <section
          className="card mt-6 p-5 sm:p-7"
          aria-labelledby="suppliers-title"
        >
          <p className="eyebrow">Fornecedores informados</p>
          <h2 id="suppliers-title" className="mt-1 text-2xl font-black">
            Maiores valores no período
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Agrupados pelo nome publicado nos registros oficiais.
          </p>
          <ol className="mt-4 grid gap-2 md:grid-cols-2">
            {summary.suppliers.map((supplier, index) => (
              <li
                className="flex justify-between gap-4 rounded-lg border border-[var(--line)] p-3"
                key={supplier.name}
              >
                <span>
                  <span className="mr-2 text-[var(--muted)]">{index + 1}.</span>
                  {supplier.name}
                </span>
                <strong className="whitespace-nowrap">
                  {formatCurrency(supplier.amount)}
                </strong>
              </li>
            ))}
          </ol>
        </section>
      )}
      <aside className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-5 text-sky-950">
        <h2 className="font-black">O que é a Cota Parlamentar?</h2>
        <p className="mt-2 text-sm">
          A CEAP custeia despesas vinculadas ao exercício do mandato, dentro das
          regras da Câmara. Os números mostrados aqui são registros publicados
          pela própria instituição; isoladamente, um valor não indica
          irregularidade.
        </p>
      </aside>
    </div>
  );
}
