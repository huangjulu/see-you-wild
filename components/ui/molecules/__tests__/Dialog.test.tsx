import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Dialog from "../Dialog";

describe("Dialog slot 分類", () => {
  it("子元件順序打亂，DOM 結構不受影響", () => {
    const { container } = render(
      <Dialog title="確認">
        <Dialog.OutlineButton>取消</Dialog.OutlineButton>
        <Dialog.Loader />
        <p>自訂內容</p>
        <Dialog.DangerButton>刪除</Dialog.DangerButton>
      </Dialog>
    );

    expect(screen.getByText("確認")).toBeInTheDocument();
    expect(screen.getByText("自訂內容")).toBeInTheDocument();
    expect(container.querySelector("svg.animate-spin")).not.toBeNull();
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(2);
  });

  it("只傳 buttons 不傳其他 slot，不冒出空節點", () => {
    const { container } = render(
      <Dialog>
        <Dialog.PrimaryButton>送出</Dialog.PrimaryButton>
      </Dialog>
    );

    expect(container.querySelector("svg.animate-spin")).toBeNull();
    expect(screen.getByText("送出")).toBeInTheDocument();
  });

  it("同 slot 多個元件維持傳入順序", () => {
    const { container } = render(
      <Dialog>
        <Dialog.OutlineButton>第一</Dialog.OutlineButton>
        <Dialog.DangerButton>第二</Dialog.DangerButton>
        <Dialog.PrimaryButton>第三</Dialog.PrimaryButton>
      </Dialog>
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons[0]?.textContent).toBe("第一");
    expect(buttons[1]?.textContent).toBe("第二");
    expect(buttons[2]?.textContent).toBe("第三");
  });

  it("空 children 不產生殘留 DOM", () => {
    const { container } = render(<Dialog title="空的" />);
    expect(screen.getByText("空的")).toBeInTheDocument();
    expect(container.querySelectorAll("button").length).toBe(0);
  });

  it("純文字 node 歸入 children slot", () => {
    render(
      <Dialog title="提示">
        純文字內容
        <Dialog.PrimaryButton>確定</Dialog.PrimaryButton>
      </Dialog>
    );

    expect(screen.getByText("純文字內容")).toBeInTheDocument();
    expect(screen.getByText("確定")).toBeInTheDocument();
  });

  it("title + message + 所有 slot 同時存在", () => {
    const { container } = render(
      <Dialog title="完整測試" message="這是說明">
        <Dialog.Loader />
        <p>自訂段落</p>
        <Dialog.DangerButton>刪除</Dialog.DangerButton>
        <Dialog.OutlineButton>取消</Dialog.OutlineButton>
      </Dialog>
    );

    expect(screen.getByText("完整測試")).toBeInTheDocument();
    expect(screen.getByText("這是說明")).toBeInTheDocument();
    expect(screen.getByText("自訂段落")).toBeInTheDocument();
    expect(container.querySelector("svg.animate-spin")).not.toBeNull();
    expect(container.querySelectorAll("button").length).toBe(2);
  });

  it("Loader 夾在 Button 之間，各 slot 不互相汙染", () => {
    const { container } = render(
      <Dialog>
        <Dialog.DangerButton>刪除</Dialog.DangerButton>
        <Dialog.Loader />
        <Dialog.OutlineButton>取消</Dialog.OutlineButton>
      </Dialog>
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(2);
    expect(container.querySelector("svg.animate-spin")).not.toBeNull();
  });
});
