import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/email/send-registration-email", () => ({
  sendRegistrationEmail: vi.fn(),
}));

vi.mock("@/lib/email/send-admin-notification", () => ({
  sendAdminNotification: vi.fn(),
}));

import { sendAdminNotification } from "@/lib/email/send-admin-notification";
import { sendRegistrationEmail } from "@/lib/email/send-registration-email";
import { createRegistrationNotifier } from "@/lib/services/notifier";
import { makeEvent, makeRegistration } from "@/lib/test-utils/fixtures";

const baseEvent = makeEvent({ title: "宜蘭一日遊" });
const baseRegistration = makeRegistration({
  id: "reg-1",
  name: "張小明",
  email: "user@example.com",
  expires_at: "2026-05-01T00:00:00Z",
});

const baseContext = {
  registration: baseRegistration,
  event: baseEvent,
  baseUrl: "https://seeyouwild.com",
};

describe("createRegistrationNotifier", () => {
  let originalAdminEmail: string | undefined;

  beforeEach(() => {
    originalAdminEmail = process.env.ADMIN_EMAIL;
    vi.clearAllMocks();
    vi.mocked(sendRegistrationEmail).mockResolvedValue(undefined);
    vi.mocked(sendAdminNotification).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    if (originalAdminEmail === undefined) {
      delete process.env.ADMIN_EMAIL;
    } else {
      process.env.ADMIN_EMAIL = originalAdminEmail;
    }
  });

  it("兩個 channel 都成功時 notifyAll 完成不 throw", async () => {
    const notifier = createRegistrationNotifier(baseContext);
    await expect(notifier.notifyAll()).resolves.toBeUndefined();
    expect(sendRegistrationEmail).toHaveBeenCalledTimes(1);
    expect(sendAdminNotification).toHaveBeenCalledTimes(1);
  });

  it("customer email 失敗時 admin 仍會送出，notifyAll 不 throw", async () => {
    vi.mocked(sendRegistrationEmail).mockRejectedValueOnce(
      new Error("smtp down")
    );
    const notifier = createRegistrationNotifier(baseContext);
    await expect(notifier.notifyAll()).resolves.toBeUndefined();
    expect(sendAdminNotification).toHaveBeenCalledTimes(1);
  });

  it("admin email 失敗時 customer 仍會送出，notifyAll 不 throw", async () => {
    vi.mocked(sendAdminNotification).mockRejectedValueOnce(
      new Error("admin smtp down")
    );
    const notifier = createRegistrationNotifier(baseContext);
    await expect(notifier.notifyAll()).resolves.toBeUndefined();
    expect(sendRegistrationEmail).toHaveBeenCalledTimes(1);
  });

  it("兩個 channel 都失敗時 notifyAll 仍 resolve（allSettled 語意）", async () => {
    vi.mocked(sendRegistrationEmail).mockRejectedValueOnce(new Error("a"));
    vi.mocked(sendAdminNotification).mockRejectedValueOnce(new Error("b"));
    const notifier = createRegistrationNotifier(baseContext);
    await expect(notifier.notifyAll()).resolves.toBeUndefined();
  });

  it("sendRegistrationEmail 收到的 to 等於 registration.email", async () => {
    const notifier = createRegistrationNotifier(baseContext);
    await notifier.notifyAll();
    expect(sendRegistrationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "user@example.com" })
    );
  });

  it("ADMIN_EMAIL env 未設時，sendAdminNotification 收到 fallback 值", async () => {
    delete process.env.ADMIN_EMAIL;
    const notifier = createRegistrationNotifier(baseContext);
    await notifier.notifyAll();
    expect(sendAdminNotification).toHaveBeenCalledWith(
      expect.objectContaining({ adminEmail: "admin@seeyouwild.com" })
    );
  });

  it("ADMIN_EMAIL env 有設時，sendAdminNotification 收到該值", async () => {
    vi.stubEnv("ADMIN_EMAIL", "ops@company.com");
    const notifier = createRegistrationNotifier(baseContext);
    await notifier.notifyAll();
    expect(sendAdminNotification).toHaveBeenCalledWith(
      expect.objectContaining({ adminEmail: "ops@company.com" })
    );
  });

  it("adminUrl 指向後台儀表板 baseUrl/admin", async () => {
    const notifier = createRegistrationNotifier(baseContext);
    await notifier.notifyAll();
    expect(sendAdminNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUrl: "https://seeyouwild.com/admin",
      })
    );
  });
});
