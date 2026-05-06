import { renderHook } from "@testing-library/react";
import { type ReactNode, type RefObject } from "react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { ReducedMotionContext } from "@/stores/motion";

import { useTween } from "../useTween";

// ---------------------------------------------------------------------------
// GSAP mocks
// ---------------------------------------------------------------------------

const mockFromTo = vi.fn();
const mockTo = vi.fn();
const mockToArray = vi.fn(
  (selector: string, scope: HTMLElement): HTMLElement[] => {
    return Array.from(scope.querySelectorAll(selector));
  }
);

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    fromTo: (...args: unknown[]) => mockFromTo(...args),
    to: (...args: unknown[]) => mockTo(...args),
    utils: {
      toArray: (selector: string, scope: HTMLElement) =>
        mockToArray(selector, scope),
    },
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn(
    (cb: () => void | (() => void), _opts?: { scope: unknown }) => {
      cb();
    }
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createScopeRef(innerHTML?: string): RefObject<HTMLElement | null> {
  const el = document.createElement("div");
  if (innerHTML) el.innerHTML = innerHTML;
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
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useTween", () => {
  // ---- reduced motion ----

  describe("reduced motion 啟用時", () => {
    it("不執行任何動畫", () => {
      const scope = createScopeRef();

      renderHook(() => useTween(scope, { from: { opacity: 0 } }), {
        wrapper: wrapper(true),
      });

      expect(mockFromTo).not.toHaveBeenCalled();
      expect(mockTo).not.toHaveBeenCalled();
    });
  });

  // ---- null scope ----

  describe("scope 為 null 時", () => {
    it("不執行任何動畫", () => {
      const scope: RefObject<HTMLElement | null> = { current: null };

      renderHook(() => useTween(scope, { from: { opacity: 0 } }), {
        wrapper: wrapper(false),
      });

      expect(mockFromTo).not.toHaveBeenCalled();
      expect(mockTo).not.toHaveBeenCalled();
    });
  });

  // ---- 單元素 ----

  describe("單元素（無 selector）", () => {
    it("有 from + to 時呼叫 gsap.fromTo", () => {
      const scope = createScopeRef();
      const from = { opacity: 0, y: 40 };
      const to = { opacity: 1, y: 0 };

      renderHook(() => useTween(scope, { from, to }), {
        wrapper: wrapper(false),
      });

      expect(mockFromTo).toHaveBeenCalledOnce();
      expect(mockFromTo).toHaveBeenCalledWith(scope.current, from, to);
    });

    it("只有 to 時呼叫 gsap.to", () => {
      const scope = createScopeRef();
      const to = { opacity: 1 };

      renderHook(() => useTween(scope, { to }), {
        wrapper: wrapper(false),
      });

      expect(mockTo).toHaveBeenCalledOnce();
      expect(mockTo).toHaveBeenCalledWith(scope.current, to);
      expect(mockFromTo).not.toHaveBeenCalled();
    });

    it("只有 from 時呼叫 gsap.fromTo（to 為空物件）", () => {
      const scope = createScopeRef();
      const from = { opacity: 0 };

      renderHook(() => useTween(scope, { from }), {
        wrapper: wrapper(false),
      });

      expect(mockFromTo).toHaveBeenCalledOnce();
      expect(mockFromTo).toHaveBeenCalledWith(scope.current, from, {});
    });
  });

  // ---- 多元素（selector） ----

  describe("多元素（有 selector）", () => {
    it("用 gsap.utils.toArray 查找元素並逐一動畫", () => {
      const scope = createScopeRef(
        '<p class="item">A</p><p class="item">B</p><p class="item">C</p>'
      );
      const from = { opacity: 0 };
      const to = { opacity: 1 };

      renderHook(() => useTween(scope, { from, to, selector: ".item" }), {
        wrapper: wrapper(false),
      });

      expect(mockToArray).toHaveBeenCalledWith(".item", scope.current);
      expect(mockFromTo).toHaveBeenCalledTimes(3);
    });

    it("selector 無匹配時不呼叫動畫", () => {
      const scope = createScopeRef("<p>nothing</p>");

      renderHook(
        () =>
          useTween(scope, {
            from: { opacity: 0 },
            selector: ".nonexistent",
          }),
        { wrapper: wrapper(false) }
      );

      expect(mockToArray).toHaveBeenCalledWith(".nonexistent", scope.current);
      expect(mockFromTo).not.toHaveBeenCalled();
    });
  });

  // ---- stagger batching ----

  describe("stagger batching", () => {
    it("有 stagger + selector 時用單一 gsap.fromTo 呼叫（array）", () => {
      const scope = createScopeRef(
        '<div class="card">1</div><div class="card">2</div><div class="card">3</div>'
      );
      const from = { opacity: 0, y: 40 };
      const to = { opacity: 1, y: 0, stagger: 0.1 };

      renderHook(() => useTween(scope, { from, to, selector: ".card" }), {
        wrapper: wrapper(false),
      });

      // 應該只呼叫一次，傳入 array
      expect(mockFromTo).toHaveBeenCalledOnce();
      const callTarget = (mockFromTo as Mock).mock.calls[0][0];
      expect(Array.isArray(callTarget)).toBe(true);
      expect(callTarget).toHaveLength(3);
    });

    it("沒有 stagger 時維持逐一呼叫", () => {
      const scope = createScopeRef(
        '<div class="card">1</div><div class="card">2</div>'
      );
      const from = { opacity: 0 };
      const to = { opacity: 1 };

      renderHook(() => useTween(scope, { from, to, selector: ".card" }), {
        wrapper: wrapper(false),
      });

      expect(mockFromTo).toHaveBeenCalledTimes(2);
    });
  });

  // ---- 無 config ----

  describe("無 config 時", () => {
    it("不執行任何動畫", () => {
      const scope = createScopeRef();

      renderHook(() => useTween(scope), {
        wrapper: wrapper(false),
      });

      expect(mockFromTo).not.toHaveBeenCalled();
      expect(mockTo).not.toHaveBeenCalled();
    });
  });
});
