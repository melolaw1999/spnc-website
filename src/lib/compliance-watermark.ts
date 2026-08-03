import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

const watermarkPath = path.join(process.cwd(), "public/assets/compliance/compliance-watermark.png");

export type WatermarkedDocument = {
  bytes: Uint8Array;
  contentType: string;
  extension: "pdf" | "jpg" | "png" | "webp";
};

async function watermarkPdf(input: Uint8Array): Promise<WatermarkedDocument> {
  const document = await PDFDocument.load(input, { ignoreEncryption: false });
  if (document.isEncrypted) throw new Error("加密 PDF 暂不支持，请先移除打开密码。");
  const watermarkBytes = await readFile(watermarkPath);
  const watermark = await document.embedPng(watermarkBytes);
  const sourceRatio = watermark.height / watermark.width;

  document.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const markWidth = Math.min(width * 0.82, 560);
    const markHeight = markWidth * sourceRatio;
    const x = (width - markWidth) / 2;
    const rows = height > 720 ? [0.16, 0.48, 0.8] : [0.25, 0.68];
    rows.forEach((position) => page.drawImage(watermark, {
      x,
      y: Math.max(8, height * position - markHeight / 2),
      width: markWidth,
      height: markHeight,
      opacity: 0.82,
    }));
  });

  return {
    bytes: await document.save({ useObjectStreams: true }),
    contentType: "application/pdf",
    extension: "pdf",
  };
}

async function watermarkImage(input: Uint8Array, contentType: string): Promise<WatermarkedDocument> {
  const source = sharp(input, { failOn: "error" }).rotate();
  const metadata = await source.metadata();
  const width = metadata.width ?? 1600;
  const watermarkWidth = Math.max(460, Math.min(1100, Math.round(width * 0.62)));
  const watermark = await sharp(watermarkPath).resize({ width: watermarkWidth }).png().toBuffer();
  const output = source.composite([{ input: watermark, tile: true, blend: "over" }]);

  if (contentType === "image/png") {
    return { bytes: await output.png({ compressionLevel: 8 }).toBuffer(), contentType, extension: "png" };
  }
  if (contentType === "image/webp") {
    return { bytes: await output.webp({ quality: 92 }).toBuffer(), contentType, extension: "webp" };
  }
  return { bytes: await output.jpeg({ quality: 92, mozjpeg: true }).toBuffer(), contentType: "image/jpeg", extension: "jpg" };
}

export async function applyComplianceWatermark(file: File): Promise<WatermarkedDocument> {
  const input = new Uint8Array(await file.arrayBuffer());
  if (file.type === "application/pdf") return watermarkPdf(input);
  if (["image/jpeg", "image/png", "image/webp"].includes(file.type)) return watermarkImage(input, file.type);
  throw new Error("文件只支持 PDF、JPG、PNG 或 WebP。");
}
