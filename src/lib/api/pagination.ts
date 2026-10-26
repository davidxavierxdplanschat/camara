import type { z } from "zod";
import type { ApiListResponse } from "./types";
import { fetchCamara, type RequestOptions } from "./camara-client";

export async function fetchAllPages<T>(
  initialPath: string,
  schema: z.ZodType<ApiListResponse<T>>,
  params: Record<string, string | number | undefined> = {},
  options: RequestOptions & { maxPages?: number } = {},
) {
  const maxPages =
    options.maxPages ?? Number(process.env.CAMARA_MAX_PAGES ?? 30);
  const items: T[] = [];
  const visited = new Set<string>();
  let next: string | undefined = initialPath;
  let currentParams: Record<string, string | number | undefined> = {
    ...params,
    itens: 100,
  };

  for (let page = 0; next && page < maxPages; page++) {
    const result: ApiListResponse<T> = await fetchCamara(
      next,
      schema,
      currentParams,
      options,
    );
    items.push(...result.dados);
    const href: string | undefined = result.links.find(
      (link) => link.rel.toLowerCase() === "next",
    )?.href;
    if (!href || visited.has(href)) break;
    visited.add(href);
    next = href;
    currentParams = {};
  }

  return items;
}
