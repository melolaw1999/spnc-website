import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/security";
import { assetAdopted, assertVariantBelongsToProduct } from "@/lib/asset-review";

const schema = z.object({
  assetId: z.string(),
  status: z.enum(["ADOPTED", "PENDING", "REJECTED"]),
  productId: z.string().optional(),
  variantId: z.string().nullable().optional(),
  role: z.enum(["PRIMARY", "FRONT", "BACK", "NUTRITION", "DETAIL", "VERSION"]).optional(),
});

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const input = schema.parse(await req.json());
    await db.$transaction(async (tx) => {
      if (input.variantId) {
        const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: input.variantId } });
        if (!input.productId) throw new Error("绑定 SKU 时必须选择商品");
        assertVariantBelongsToProduct(input.productId, variant.productId);
      }
      const asset = await tx.asset.update({
        where: { id: input.assetId },
        data: { reviewStatus: input.status, adopted: assetAdopted(input.status) },
      });

      if (input.productId && input.role) {
        if (input.role === "PRIMARY") {
          await tx.productImage.deleteMany({
            where: { productId: input.productId, variantId: input.variantId ?? null, role: "PRIMARY" },
          });
        }
        const existing = await tx.productImage.findFirst({
          where: {
            productId: input.productId,
            variantId: input.variantId ?? null,
            assetId: input.assetId,
            role: input.role,
          },
        });
        const imageData = {
          productId: input.productId,
          variantId: input.variantId ?? null,
          assetId: input.assetId,
          role: input.role,
          altText: `${asset.guessedBrand} ${asset.guessedProduct} ${asset.guessedSize || ""} ${asset.guessedFlavor || ""}`.trim(),
          sortOrder: 0,
          sourceType: "LOCAL_COPY",
          confirmed: false,
        };
        if (existing) await tx.productImage.update({ where: { id: existing.id }, data: imageData });
        else await tx.productImage.create({ data: imageData });
      }

      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: input.productId ? "BIND_ASSET" : "REVIEW_ASSET",
          targetType: "Asset",
          targetId: input.assetId,
          detail: JSON.stringify({ status: input.status, productId: input.productId, variantId: input.variantId, role: input.role }),
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "操作失败" }, { status: 403 });
  }
}
