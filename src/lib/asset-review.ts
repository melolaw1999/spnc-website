export type AssetReviewStatus = "ADOPTED" | "PENDING" | "REJECTED";

export const assetAdopted = (status: AssetReviewStatus) => status === "ADOPTED";

export function assertVariantBelongsToProduct(productId: string, variantProductId: string) {
  if (productId !== variantProductId) throw new Error("SKU 与商品不匹配");
}
