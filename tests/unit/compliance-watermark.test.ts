import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { applyComplianceWatermark } from "@/lib/compliance-watermark";

describe("合规文件强制水印", () => {
  it("为 PDF 每页写入水印后仍可正常打开", async () => {
    const source = await PDFDocument.create();
    source.addPage([595, 842]);
    const input = await source.save();
    const result = await applyComplianceWatermark(new File([input], "report.pdf", { type: "application/pdf" }));
    const output = await PDFDocument.load(result.bytes);

    expect(result.contentType).toBe("application/pdf");
    expect(result.extension).toBe("pdf");
    expect(output.getPageCount()).toBe(1);
    expect(result.bytes.byteLength).toBeGreaterThan(input.byteLength);
  });

  it("为图片平铺水印并保留原始尺寸", async () => {
    const input = await sharp({ create: { width: 900, height: 1200, channels: 3, background: "#f3f3f3" } }).jpeg().toBuffer();
    const result = await applyComplianceWatermark(new File([input], "declaration.jpg", { type: "image/jpeg" }));
    const metadata = await sharp(result.bytes).metadata();

    expect(result.contentType).toBe("image/jpeg");
    expect(metadata.width).toBe(900);
    expect(metadata.height).toBe(1200);
    expect(result.bytes.byteLength).toBeGreaterThan(0);
  });
});
