import { afterEach, describe, expect, it, vi } from "vitest";
import { z, ZodError } from "zod";

import { handleError } from "@/lib/api/handle-error";
import {
  InternalError,
  RegistrationNotFoundError,
  UnauthorizedError,
} from "@/lib/errors/domain";

function makeZodError(): ZodError {
  const result = z.object({ email: z.string() }).safeParse({ email: 1 });
  if (result.success) throw new Error("expected parse failure");
  return result.error;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleError", () => {
  it("DomainError 子類 → 使用宣告的 status 與 code", async () => {
    const res = handleError(new UnauthorizedError("nope"));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(body.error).toBe("nope");
  });

  it("RegistrationNotFoundError → 404", async () => {
    const res = handleError(new RegistrationNotFoundError());
    expect(res.status).toBe(404);
  });

  it("InternalError 帶 cause → 500 並把原始錯誤寫進 server log", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const cause = new Error("db exploded");

    const res = handleError(new InternalError("update failed", cause));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(consoleSpy).toHaveBeenCalledWith("[api] internal error", cause);
    expect(JSON.stringify(body)).not.toContain("db exploded");
  });

  it("ZodError → 400 + VALIDATION_FAILED + flatten details", async () => {
    const res = handleError(makeZodError());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.code).toBe("VALIDATION_FAILED");
    expect(body.details).toBeDefined();
  });

  it("SyntaxError（malformed JSON body）→ 400 Invalid JSON body", async () => {
    const res = handleError(new SyntaxError("Unexpected token"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid JSON body");
  });

  it("未知錯誤 → 500 generic message，不外洩原始錯誤內容", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const res = handleError(new Error("secret internal detail"));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Internal server error");
    expect(JSON.stringify(body)).not.toContain("secret internal detail");
    expect(consoleSpy).toHaveBeenCalled();
  });
});
