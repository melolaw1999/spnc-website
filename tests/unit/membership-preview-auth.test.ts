import { describe, expect, it } from "vitest";
import {
  createMembershipPreviewToken,
  sanitizeMembershipPreviewNextPath,
  verifyMembershipPreviewPassword,
  verifyMembershipPreviewToken,
} from "@/lib/membership-preview-auth";

describe("membership preview access", () => {
  const secret = "test-secret";

  it("accepts only the configured invitation password", async () => {
    await expect(verifyMembershipPreviewPassword("88886666", "88886666", secret)).resolves.toBe(true);
    await expect(verifyMembershipPreviewPassword("88886665", "88886666", secret)).resolves.toBe(false);
  });

  it("creates a signed token that expires", async () => {
    const token = await createMembershipPreviewToken(secret, 1_000, 60);
    await expect(verifyMembershipPreviewToken(token, secret, 60_999)).resolves.toBe(true);
    await expect(verifyMembershipPreviewToken(token, secret, 61_000)).resolves.toBe(false);
    await expect(verifyMembershipPreviewToken(`${token}tampered`, secret, 2_000)).resolves.toBe(false);
  });

  it("allows only membership preview destinations", () => {
    expect(sanitizeMembershipPreviewNextPath("/membership/claim?from=menu")).toBe("/membership/claim?from=menu");
    expect(sanitizeMembershipPreviewNextPath("/admin/membership")).toBe("/admin/membership");
    expect(sanitizeMembershipPreviewNextPath("https://example.com")).toBe("/membership");
    expect(sanitizeMembershipPreviewNextPath("//example.com")).toBe("/membership");
  });
});
