import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/r2/storage", () => ({
  uploadEventImage: vi.fn(),
}));

vi.mock("@/lib/supabase/storage", () => ({
  uploadEventImage: vi.fn(),
}));

vi.mock("@/lib/email/send-storage-alert-email", () => ({
  sendStorageAlertEmail: vi.fn(),
}));

import { sendStorageAlertEmail } from "@/lib/email/send-storage-alert-email";
import { uploadEventImage as r2Upload } from "@/lib/r2/storage";
import { uploadImage } from "@/lib/storage/upload-image";
import { uploadEventImage as supabaseUpload } from "@/lib/supabase/storage";

const testBuffer = Buffer.from("fake-image");
const testFilename = "photo.jpg";
const testContentType = "image/jpeg";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("uploadImage", () => {
  it("R2 成功時回傳 R2 URL，不觸發 fallback", async () => {
    vi.mocked(r2Upload).mockResolvedValue("https://r2.example.com/photo.jpg");

    const result = await uploadImage(testBuffer, testFilename, testContentType);

    expect(result).toBe("https://r2.example.com/photo.jpg");
    expect(r2Upload).toHaveBeenCalledWith(
      testBuffer,
      testFilename,
      testContentType
    );
    expect(supabaseUpload).not.toHaveBeenCalled();
    expect(sendStorageAlertEmail).not.toHaveBeenCalled();
  });

  it("R2 失敗時 fallback 到 Supabase 並發 warning email", async () => {
    vi.mocked(r2Upload).mockRejectedValue(new Error("R2 connection timeout"));
    vi.mocked(supabaseUpload).mockResolvedValue(
      "https://supabase.example.com/photo.jpg"
    );
    // Resolvable promise — email succeeds silently
    vi.mocked(sendStorageAlertEmail).mockResolvedValue(undefined);

    const result = await uploadImage(testBuffer, testFilename, testContentType);

    expect(result).toBe("https://supabase.example.com/photo.jpg");
    expect(supabaseUpload).toHaveBeenCalledWith(
      testBuffer,
      testFilename,
      testContentType
    );
    expect(sendStorageAlertEmail).toHaveBeenCalledWith({
      level: "warning",
      filename: testFilename,
      r2Error: "R2 connection timeout",
    });
  });

  it("R2 和 Supabase 都失敗時發 critical email 並 throw", async () => {
    vi.mocked(r2Upload).mockRejectedValue(new Error("R2 down"));
    vi.mocked(supabaseUpload).mockRejectedValue(new Error("Supabase down"));
    vi.mocked(sendStorageAlertEmail).mockResolvedValue(undefined);

    await expect(
      uploadImage(testBuffer, testFilename, testContentType)
    ).rejects.toThrow("All storage backends failed");

    expect(sendStorageAlertEmail).toHaveBeenCalledWith({
      level: "critical",
      filename: testFilename,
      r2Error: "R2 down",
      supabaseError: "Supabase down",
    });
  });

  it("warning email 發送失敗不影響上傳結果", async () => {
    vi.mocked(r2Upload).mockRejectedValue(new Error("R2 error"));
    vi.mocked(supabaseUpload).mockResolvedValue(
      "https://supabase.example.com/photo.jpg"
    );
    vi.mocked(sendStorageAlertEmail).mockRejectedValue(
      new Error("Resend unavailable")
    );

    const result = await uploadImage(testBuffer, testFilename, testContentType);

    expect(result).toBe("https://supabase.example.com/photo.jpg");
  });

  it("critical email 發送失敗不影響 throw 行為", async () => {
    vi.mocked(r2Upload).mockRejectedValue(new Error("R2 down"));
    vi.mocked(supabaseUpload).mockRejectedValue(new Error("Supabase down"));
    vi.mocked(sendStorageAlertEmail).mockRejectedValue(new Error("Email down"));

    await expect(
      uploadImage(testBuffer, testFilename, testContentType)
    ).rejects.toThrow("All storage backends failed");
  });
});
