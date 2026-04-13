import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { type RefObject, type ReactNode } from "react";
import { ReducedMotionContext } from "@/stores/motion";
import { useTimeline } from "../useTimeline";

// ---------------------------------------------------------------------------
// GSAP mocks
// ---------------------------------------------------------------------------

let capturedOnComplete: (() => void) | null = null;
let capturedCleanup: (() => void) | undefined = undefined;

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    timeline: vi.fn((opts?: { onComplete?: () => void }) => {
      if (opts?.onComplete) capturedOnComplete = opts.onComplete;
      return { kill: vi.fn() };
    }),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn(
    (cb: () => void | (() => void), _opts?: { scope: unknown }) => {
      const result = cb();
      capturedCleanup = typeof result === "function" ? result : undefined;
    }
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createScopeRef(): RefObject<HTMLElement | null> {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return { current: el };
}

function wrapper(reduceMotion: boolean) {
  return function Wrapper(props: { children: ReactNode }) {
    return (
      <ReducedMotionContext value={reduceMotion}>
        {props.children}
      </ReducedMotionContext>
    );
  };
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

beforeEach(() => {
  capturedOnComplete = null;
  capturedCleanup = undefined;
  document.body.style.overflow = "";
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useTimeline", () => {
  // ---- reduced motion 路徑 ----

  describe("reduced motion 啟用時", () => {
    it("不建立 timeline，直接呼叫 onDone", () => {
      const scope = createScopeRef();
      const build = vi.fn();
      const onDone = vi.fn();

      renderHook(() => useTimeline(scope, build, { onDone }), {
        wrapper: wrapper(true),
      });

      expect(build).not.toHaveBeenCalled();
      expect(onDone).toHaveBeenCalledOnce();
    });

    it("hideOnDone 時隱藏元素", () => {
      const scope = createScopeRef();
      const el = scope.current!;

      renderHook(() => useTimeline(scope, vi.fn(), { hideOnDone: true }), {
        wrapper: wrapper(true),
      });

      expect(el.style.display).toBe("none");
      expect(el.getAttribute("aria-hidden")).toBe("true");
    });

    it("沒有 hideOnDone 時不動元素", () => {
      const scope = createScopeRef();
      const el = scope.current!;

      renderHook(() => useTimeline(scope, vi.fn()), { wrapper: wrapper(true) });

      expect(el.style.display).not.toBe("none");
      expect(el.hasAttribute("aria-hidden")).toBe(false);
    });
  });

  // ---- 正常動畫路徑 ----

  describe("正常動畫路徑", () => {
    it("呼叫 build 並傳入 timeline 與 element", () => {
      const scope = createScopeRef();
      const el = scope.current!;
      const build = vi.fn();

      renderHook(() => useTimeline(scope, build), { wrapper: wrapper(false) });

      expect(build).toHaveBeenCalledOnce();
      expect(build).toHaveBeenCalledWith(expect.anything(), el);
    });
  });

  // ---- scrollLock ----

  describe("scrollLock", () => {
    it("啟用時鎖定 body overflow", () => {
      const scope = createScopeRef();

      renderHook(() => useTimeline(scope, vi.fn(), { lockScroll: true }), {
        wrapper: wrapper(false),
      });

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("onComplete 時解鎖 body overflow", () => {
      const scope = createScopeRef();

      renderHook(() => useTimeline(scope, vi.fn(), { lockScroll: true }), {
        wrapper: wrapper(false),
      });

      expect(document.body.style.overflow).toBe("hidden");
      capturedOnComplete?.();
      expect(document.body.style.overflow).toBe("");
    });

    it("未啟用時不影響 body overflow", () => {
      const scope = createScopeRef();

      renderHook(() => useTimeline(scope, vi.fn()), {
        wrapper: wrapper(false),
      });

      expect(document.body.style.overflow).toBe("");
    });
  });

  // ---- hideOnDone（正常路徑） ----

  describe("hideOnDone（動畫完成後）", () => {
    it("onComplete 時隱藏元素", () => {
      const scope = createScopeRef();
      const el = scope.current!;

      renderHook(() => useTimeline(scope, vi.fn(), { hideOnDone: true }), {
        wrapper: wrapper(false),
      });

      expect(el.style.display).not.toBe("none");
      capturedOnComplete?.();
      expect(el.style.display).toBe("none");
      expect(el.getAttribute("aria-hidden")).toBe("true");
    });
  });

  // ---- onDone callback ----

  describe("onDone", () => {
    it("onComplete 時呼叫 onDone", () => {
      const scope = createScopeRef();
      const onDone = vi.fn();

      renderHook(() => useTimeline(scope, vi.fn(), { onDone }), {
        wrapper: wrapper(false),
      });

      expect(onDone).not.toHaveBeenCalled();
      capturedOnComplete?.();
      expect(onDone).toHaveBeenCalledOnce();
    });
  });

  // ---- cleanup ----

  describe("cleanup", () => {
    it("build 回傳的 cleanup 在 unmount 時被呼叫", () => {
      const scope = createScopeRef();
      const userCleanup = vi.fn();
      const build = vi.fn().mockReturnValue(userCleanup);

      renderHook(() => useTimeline(scope, build), { wrapper: wrapper(false) });

      capturedCleanup?.();
      expect(userCleanup).toHaveBeenCalledOnce();
    });

    it("lockScroll 的 cleanup 在 unmount 時解鎖 body", () => {
      const scope = createScopeRef();

      renderHook(() => useTimeline(scope, vi.fn(), { lockScroll: true }), {
        wrapper: wrapper(false),
      });

      expect(document.body.style.overflow).toBe("hidden");
      capturedCleanup?.();
      expect(document.body.style.overflow).toBe("");
    });
  });

  // ---- null scope ----

  describe("scope 為 null 時", () => {
    it("不執行任何邏輯", () => {
      const scope: RefObject<HTMLElement | null> = { current: null };
      const build = vi.fn();
      const onDone = vi.fn();

      renderHook(() => useTimeline(scope, build, { onDone }), {
        wrapper: wrapper(false),
      });

      expect(build).not.toHaveBeenCalled();
      expect(onDone).not.toHaveBeenCalled();
    });
  });
});
