import { createWriteStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { parse } from "csv-parse";
import unzipper from "unzipper";
import type {
  CeapAggregateRecord,
  CeapSnapshot,
} from "../src/lib/aggregations/types";

async function main() {
  const yearArgument = process.argv
    .find((argument) => argument.startsWith("--year="))
    ?.split("=")[1];
  const yearIndex = process.argv.indexOf("--year");
  const year = Number(
    yearArgument ??
      (yearIndex >= 0 ? process.argv[yearIndex + 1] : new Date().getFullYear()),
  );
  if (
    !Number.isInteger(year) ||
    year < 2008 ||
    year > new Date().getFullYear()
  ) {
    throw new Error("Use --year AAAA, entre 2008 e o ano atual.");
  }

  const sourceUrl = `https://www.camara.leg.br/cotas/Ano-${year}.csv.zip`;
  const temporaryFile = path.join(
    tmpdir(),
    `cota-clara-ceap-${year}-${process.pid}.zip`,
  );
  const outputDirectory = path.join(process.cwd(), "src", "data");
  const outputFile = path.join(outputDirectory, `ceap-${year}.json`);

  console.log(`Baixando arquivo oficial de ${year}...`);
  const response = await fetch(sourceUrl, {
    headers: { "User-Agent": "Cota-Clara/0.1 (dados públicos)" },
  });
  if (!response.ok || !response.body)
    throw new Error(`Download falhou com HTTP ${response.status}.`);
  await pipeline(
    Readable.fromWeb(response.body as never),
    createWriteStream(temporaryFile),
  );

  const aggregate = new Map<string, CeapAggregateRecord>();
  const supplierTotals = new Map<
    string,
    { deputyId: number; name: string; amount: number }
  >();
  const zip = await unzipper.Open.file(temporaryFile);
  const csvEntry = zip.files.find((file) =>
    file.path.toLowerCase().endsWith(".csv"),
  );
  if (!csvEntry) throw new Error("O ZIP oficial não contém um arquivo CSV.");

  console.log("Agregando registros por deputado, mês e categoria...");
  const parser = csvEntry.stream().pipe(
    parse({
      columns: true,
      delimiter: ";",
      bom: true,
      relax_column_count: true,
      skip_empty_lines: true,
    }),
  );

  for await (const raw of parser) {
    const row = raw as Record<string, string>;
    const deputyId = Number(row.ideCadastro);
    const month = Number(row.numMes);
    const amount = Number(String(row.vlrLiquido ?? "0").replace(",", "."));
    if (
      !Number.isInteger(deputyId) ||
      deputyId <= 0 ||
      !Number.isInteger(month) ||
      !Number.isFinite(amount)
    )
      continue;
    const officialCategory =
      String(row.txtDescricao ?? "").trim() || "Categoria não informada";
    const key = `${deputyId}|${month}|${officialCategory}`;
    const current = aggregate.get(key) ?? {
      deputyId,
      deputyName: String(row.txNomeParlamentar ?? "Nome não informado").trim(),
      party: String(row.sgPartido ?? "").trim(),
      uf: String(row.sgUF ?? "").trim(),
      month,
      officialCategory,
      amount: 0,
    };
    current.amount += amount;
    aggregate.set(key, current);
    const supplier = String(row.txtFornecedor ?? "").trim();
    if (supplier) {
      const supplierKey = `${deputyId}|${supplier}`;
      const supplierTotal = supplierTotals.get(supplierKey) ?? {
        deputyId,
        name: supplier,
        amount: 0,
      };
      supplierTotal.amount += amount;
      supplierTotals.set(supplierKey, supplierTotal);
    }
  }

  const suppliersByDeputy = new Map<
    number,
    Array<{ deputyId: number; name: string; amount: number }>
  >();
  for (const supplier of supplierTotals.values()) {
    const values = suppliersByDeputy.get(supplier.deputyId) ?? [];
    values.push(supplier);
    suppliersByDeputy.set(supplier.deputyId, values);
  }

  const snapshot: CeapSnapshot = {
    year,
    generatedAt: new Date().toISOString(),
    sourceUrl,
    records: [...aggregate.values()].map((record) => ({
      ...record,
      amount: Math.round(record.amount * 100) / 100,
    })),
    suppliers: [...suppliersByDeputy.values()].flatMap((values) =>
      values
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8)
        .map((supplier) => ({
          ...supplier,
          amount: Math.round(supplier.amount * 100) / 100,
        })),
    ),
  };

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputFile, JSON.stringify(snapshot));
  await rm(temporaryFile, { force: true });
  console.log(
    `Gerado ${outputFile} com ${snapshot.records.length} agregações.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
