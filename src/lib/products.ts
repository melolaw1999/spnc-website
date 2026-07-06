import { catalog, getCatalogProduct } from "@/data/catalog";

export const getProducts = async () => catalog;
export const getProduct = async (slug: string) => getCatalogProduct(slug) ?? null;
