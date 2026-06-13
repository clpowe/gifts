import type { GiftResponse } from "~~/server/utils/gifts";

export type ResolvedProduct = {
  url: string | null;
  // Phase 2 (PA-API) fills these; Phase 1 leaves undefined
  asin?: string;
  productTitle?: string;
  productPrice?: string;
  productImage?: string;
  source: "search" | "paapi";
};

type GiftIdeaWithLink = GiftResponse["giftIdeas"][number] & {
  productUrl: string | null;
  asin?: string;
  productTitle?: string;
  productPrice?: string;
  productImage?: string;
};

function amazonSearchUrl(query: string, tag?: string): string {
  const params = new URLSearchParams({ k: query });
  if (tag) params.set("tag", tag);
  return `https://www.amazon.com/s?${params.toString()}`;
}

/**
 * Resolve a single gift idea's search query to a product link.
 *
 * Phase 1: deterministic Amazon search URL (no API, always valid).
 * Phase 2: swap the body for a PA-API lookup that returns a real ASIN,
 * price, image, and /dp/ link. Signature stays the same — callers and
 * UI don't change.
 */

export async function resolveProduct(
  searchQuery: string,
  opts: { tag?: string } = {},
): Promise<ResolvedProduct> {
  const query = searchQuery.trim();
  if (!query) {
    return { url: null, source: "search" };
  }
  // --- Phase 2 hook: when PA-API is approved, call it here and return
  //     { url: dpLink, asin, productTitle, productPrice, productImage, source: "paapi" }
  //     Fall through to search URL on miss/error.
  return { url: amazonSearchUrl(query, opts.tag), source: "search" };
}

/** Attach productUrl (+ optional PA-API fields) to every idea. */
export async function attachProductLinks(
  ideas: GiftResponse["giftIdeas"],
  opts: { tag?: string } = {},
): Promise<GiftIdeaWithLink[]> {
  return Promise.all(
    ideas.map(async (idea) => {
      const resolved = await resolveProduct(idea.searchQuery, opts);
      return {
        ...idea,
        productUrl: resolved.url,
        asin: resolved.asin,
        productTitle: resolved.productTitle,
        productPrice: resolved.productPrice,
        productImage: resolved.productImage,
      };
    }),
  );
}
