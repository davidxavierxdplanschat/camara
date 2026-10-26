import { ZodError, type z } from "zod";
import { CamaraApiError } from "@/lib/errors/camara-error";
import { createLimiter } from "./rate-limit";

const BASE_URL =
  process.env.CAMARA_API_BASE_URL ??
  "https://dadosabertos.camara.leg.br/api/v2";
const TIMEOUT_MS = Number(process.env.CAMARA_REQUEST_TIMEOUT_MS ?? 12_000);
const CONCURRENCY = Number(process.env.CAMARA_MAX_CONCURRENCY ?? 3);
const limit = createLimiter(CONCURRENCY);
const inFlight = new Map<string, Promise<unknown>>();

export interface RequestOptions {
  timeoutMs?: number;
  retries?: number;
  fetcher?: typeof fetch;
  revalidate?: number;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryDelay(response: Response | undefined, attempt: number) {
  const header = response?.headers.get("retry-after");
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds)) return Math.min(seconds * 1_000, 30_000);
    const dateDelay = Date.parse(header) - Date.now();
    if (dateDelay > 0) return Math.min(dateDelay, 30_000);
  }
  return Math.min(500 * 2 ** attempt + Math.random() * 250, 8_000);
}

export function camaraUrl(
  pathOrUrl: string,
  params?: Record<string, string | number | undefined>,
) {
  const url = new URL(
    pathOrUrl.startsWith("http")
      ? pathOrUrl
      : `${BASE_URL}/${pathOrUrl.replace(/^\//, "")}`,
  );
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "")
      url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export async function fetchCamara<T>(
  pathOrUrl: string,
  schema: z.ZodType<T>,
  params?: Record<string, string | number | undefined>,
  options: RequestOptions = {},
): Promise<T> {
  const url = camaraUrl(pathOrUrl, params);
  const existing = inFlight.get(url) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = limit(async () => {
    const retries = options.retries ?? 3;
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        options.timeoutMs ?? TIMEOUT_MS,
      );
      let response: Response | undefined;
      try {
        response = await (options.fetcher ?? fetch)(url, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
          next: { revalidate: options.revalidate ?? 3_600 },
        });
        if (!response.ok) {
          const retryable = response.status === 429 || response.status >= 500;
          if (!retryable || attempt === retries) {
            throw new CamaraApiError(
              `Câmara respondeu com HTTP ${response.status}.`,
              response.status,
              retryable,
            );
          }
          await wait(retryDelay(response, attempt));
          continue;
        }
        return schema.parse(await response.json());
      } catch (error) {
        lastError = error;
        if (error instanceof ZodError) {
          console.error("Resposta inesperada da Câmara", error.issues);
          throw new CamaraApiError(
            "A Câmara retornou dados em um formato inesperado.",
            undefined,
            false,
          );
        }
        if (error instanceof CamaraApiError && !error.retryable) throw error;
        if (attempt === retries) {
          const timedOut =
            error instanceof Error && error.name === "AbortError";
          throw new CamaraApiError(
            timedOut
              ? "A consulta à Câmara excedeu o tempo limite."
              : "Não foi possível consultar a Câmara.",
            undefined,
            true,
          );
        }
        await wait(retryDelay(response, attempt));
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError;
  });

  inFlight.set(url, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(url);
  }
}
