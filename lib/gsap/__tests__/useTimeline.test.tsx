import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { type RefObject, type ReactNode } from "react";
import { ReducedMotionContext } from "@/stores/motion";
import { useTimeline } from "../useTimeline";

let capturedTimelineVars: Record<string, unknown> | null = null;
let capturedCleanup: (() => void) | undefined = undefined;

const mockTl = {
  kill: vi.fn(),
  play: vi.fn(),
  eventCallback: vi.fn(),
};

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    timeline: vi.fn((vars?: Record<string, unknown>) => {
      capturedTimelineVars = vars ?? null;
      return mockTl;
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

beforeEach(() => {
  capturedTimelineVars = null;
  capturedCleanup = undefined;
  document.body.style.overflow = "";
  vi.clearAllMocks();
});

describe("useTimeline", () => {
  describe("reduced motion 啟用時", () => {
    it("不建立 timeline，直接呼叫 control.onComplete", () => {
      const scope = createScopeRef();
      const animate = vi.fn();
      const onComplete = vi.fn();

      renderHook(
        () => useTimeline(scope, animate, { onComplete }),
        { wrapper: wrapper(true) }
      );

      expect(animate).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledOnce();
    });

    it("reduced motion 時不鎖滾動", () => {
      const scope = createScopeRef();

      renderHook(
        () => useTimeline(scope, vi.fn(), { lockScroll: true }),
        { wrapper: wrapper(true) }
      );

      expect(document.body.style.overflow).not.toBe("hidden");
    });
  });

  describe("正常動畫路徑", () => {
    it("呼叫 animate 並傳入 timeline 與 element", () => {
      const scope = createScopeRef();
      const el = scope.current!;
      const animate = vi.fn();

      renderHook(() => useTimeline(scope, animate), {
        wrapper: wrapper(false),
      });

      expect(animate).toHaveBeenCalledOnce();
      expect(animate).toHaveBeenCalledWith(mockTl, el);
    });

    it("control vars 傳遞給 gsap.timeline（排除 lockScroll）", () => {
      const scope = createScopeRef();
      const onUpdate = vi.fn();

      renderHook(
        () => useTimeline(scope, vi.fn(), {
          lockScroll: true,
          defaults: { duration: 0.5 },
          onUpdate,
        }),
        { wrapper: wrapper(false) }
      );

      expect(capturedTimelineVars).not.toHaveProperty("lockScroll");
      expect(capturedTimelineVars).toHaveProperty("defaults");
    });
  });

  describe("lockScroll", () => {
    it("啟用時鎖定 body overflow", () => {
      const scope = createScopeRef();

      renderHook(
        () => useTimeline(scope, vi.fn(), { lockScroll: true }),
        { wrapper: wrapper(false) }
      );

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("onComplete 時解鎖 body overflow", () => {
      const scope = createScopeRef();

      renderHook(
        () => useTimeline(scope, vi.fn(), { lockScroll: true }),
        { wrapper: wrapper(false) }
      );

      expect(document.body.style.overflow).toBe("hidden");
      const onComplete = capturedTimelineVars?.onComplete as () => void;
      onComplete();
      expect(document.body.style.overflow).toBe("");
    });

    it("cleanup 時解鎖 body overflow", () => {
      const scope = createScopeRef();

      renderHook(
        () => useTimeline(scope, vi.fn(), { lockScroll: true }),
        { wrapper: wrapper(false) }
      );

      expect(document.body.style.overflow).toBe("hidden");
      capturedCleanup?.();
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

  describe("onComplete 合併", () => {
    it("消費端 onComplete 在 lockScroll 解鎖後被呼叫", () => {
      const scope = createScopeRef();
      const userOnComplete = vi.fn();

      renderHook(
        () => useTimeline(scope, vi.fn(), {
          lockScroll: true,
          onComplete: userOnComplete,
        }),
        { wrapper: wrapper(false) }
      );

      const onComplete = capturedTimelineVars?.onComplete as () => void;
      onComplete();
      expect(document.body.style.overflow).toBe("");
      expect(userOnComplete).toHaveBeenCalledOnce();
    });
  });

  describe("cue", () => {
    it("無 paused：onComplete 時 dispatch CustomEvent", () => {
      const scope = createScopeRef();
      const handler = vi.fn();
      window.addEventListener("test-cue", handler);

      renderHook(
        () => useTimeline(scope, vi.fn(), undefined, "test-cue"),
        { wrapper: wrapper(false) }
      );

      const onComplete = capturedTimelineVars?.onComplete as () => void;
      onComplete();
      expect(handler).toHaveBeenCalledOnce();

      window.removeEventListener("test-cue", handler);
    });

    it("paused: true：收到 cue event 後呼叫 tl.play()", () => {
      const scope = createScopeRef();

      renderHook(
        () => useTimeline(scope, vi.fn(), { paused: true }, "test-cue"),
        { wrapper: wrapper(false) }
      );

      expect(mockTl.play).not.toHaveBeenCalled();
      window.dispatchEvent(new CustomEvent("test-cue"));
      expect(mockTl.play).toHaveBeenCalledOnce();
    });

    it("paused + cue：cleanup 時移除 listener", () => {
      const scope = createScopeRef();

      renderHook(
        () => useTimeline(scope, vi.fn(), { paused: true }, "cleanup-cue"),
        { wrapper: wrapper(false) }
      );

      capturedCleanup?.();
      mockTl.play.mockClear();
      window.dispatchEvent(new CustomEvent("cleanup-cue"));
      expect(mockTl.play).not.toHaveBeenCalled();
    });

    it("reduced motion + cue（發送端）：直接 dispatch event", () => {
      const scope = createScopeRef();
      const handler = vi.fn();
      window.addEventListener("rm-cue", handler);

      renderHook(
        () => useTimeline(scope, vi.fn(), undefined, "rm-cue"),
        { wrapper: wrapper(true) }
      );

      expect(handler).toHaveBeenCalledOnce();
      window.removeEventListener("rm-cue", handler);
    });
  });

  describe("scope 為 null 時", () => {
    it("不執行任何邏輯", () => {
      const scope: RefObject<HTMLElement | null> = { current: null };
      const animate = vi.fn();
      const onComplete = vi.fn();

      renderHook(
        () => useTimeline(scope, animate, { onComplete }),
        { wrapper: wrapper(false) }
      );

      expect(animate).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
    });
  });
});
