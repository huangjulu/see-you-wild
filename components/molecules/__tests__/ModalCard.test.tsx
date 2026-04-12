import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ModalCard from "../ModalCard";

describe("ModalCard slot 分類", () => {
  it("Header/Main/Footer 順序打亂，DOM 維持 header→main→footer", () => {
    const { container } = render(
      <ModalCard>
        <ModalCard.Footer>
          <ModalCard.Footer.ConfirmButton>確定</ModalCard.Footer.ConfirmButton>
        </ModalCard.Footer>
        <ModalCard.Main>主要內容</ModalCard.Main>
        <ModalCard.Header title="標題" />
      </ModalCard>
    );

    const children = container.firstElementChild?.children;
    expect(children).toBeDefined();
    expect(children![0]?.querySelector("header")).not.toBeNull();
    expect(children![1]?.querySelector("main")).not.toBeNull();
    expect(children![2]?.querySelector("footer")).not.toBeNull();
  });

  it("只傳 Header + Main，不產生 footer 空節點", () => {
    const { container } = render(
      <ModalCard>
        <ModalCard.Header title="標題" />
        <ModalCard.Main>內容</ModalCard.Main>
      </ModalCard>
    );

    expect(screen.getByText("標題")).toBeInTheDocument();
    expect(screen.getByText("內容")).toBeInTheDocument();
    expect(container.querySelector("footer")).toBeNull();
  });

  it("只傳 Main，Header 和 Footer 都不存在", () => {
    const { container } = render(
      <ModalCard>
        <ModalCard.Main>獨立內容</ModalCard.Main>
      </ModalCard>
    );

    expect(screen.getByText("獨立內容")).toBeInTheDocument();
    expect(container.querySelector("header")).toBeNull();
    expect(container.querySelector("footer")).toBeNull();
  });

  it("Header 巢狀 CloseButton，渲染在 header 內", () => {
    const { container } = render(
      <ModalCard>
        <ModalCard.Header title="帶關閉按鈕">
          <ModalCard.Header.CloseButton />
        </ModalCard.Header>
        <ModalCard.Main>內容</ModalCard.Main>
      </ModalCard>
    );

    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    expect(header!.querySelector("button")).not.toBeNull();
  });

  it("Footer 巢狀 BackButton + CancelButton + ConfirmButton", () => {
    const { container } = render(
      <ModalCard>
        <ModalCard.Main>內容</ModalCard.Main>
        <ModalCard.Footer>
          <ModalCard.Footer.BackButton>返回</ModalCard.Footer.BackButton>
          <ModalCard.Footer.CancelButton>取消</ModalCard.Footer.CancelButton>
          <ModalCard.Footer.ConfirmButton>確認</ModalCard.Footer.ConfirmButton>
        </ModalCard.Footer>
      </ModalCard>
    );

    expect(screen.getByText("返回")).toBeInTheDocument();
    expect(screen.getByText("取消")).toBeInTheDocument();
    expect(screen.getByText("確認")).toBeInTheDocument();

    const footer = container.querySelector("footer");
    const buttons = footer!.querySelectorAll("button");
    expect(buttons.length).toBe(3);
  });

  it("Footer 只傳 ConfirmButton，無 BackButton 和 CancelButton", () => {
    const { container } = render(
      <ModalCard>
        <ModalCard.Main>內容</ModalCard.Main>
        <ModalCard.Footer>
          <ModalCard.Footer.ConfirmButton>送出</ModalCard.Footer.ConfirmButton>
        </ModalCard.Footer>
      </ModalCard>
    );

    const footer = container.querySelector("footer");
    const buttons = footer!.querySelectorAll("button");
    expect(buttons.length).toBe(1);
    expect(buttons[0]?.textContent).toBe("送出");
  });

  it("Footer 按鈕順序打亂，DOM 維持 back 在左側", () => {
    const { container } = render(
      <ModalCard>
        <ModalCard.Main>內容</ModalCard.Main>
        <ModalCard.Footer>
          <ModalCard.Footer.ConfirmButton>確認</ModalCard.Footer.ConfirmButton>
          <ModalCard.Footer.BackButton>返回</ModalCard.Footer.BackButton>
          <ModalCard.Footer.CancelButton>取消</ModalCard.Footer.CancelButton>
        </ModalCard.Footer>
      </ModalCard>
    );

    const footer = container.querySelector("footer");
    expect(footer).not.toBeNull();
    const firstChild = footer!.children[0];
    expect(firstChild?.textContent).toContain("返回");
  });

  it("Header 帶 title + description", () => {
    render(
      <ModalCard>
        <ModalCard.Header title="主標題" description="副標題說明" />
        <ModalCard.Main>內容</ModalCard.Main>
      </ModalCard>
    );

    expect(screen.getByText("主標題")).toBeInTheDocument();
    expect(screen.getByText("副標題說明")).toBeInTheDocument();
  });

  it("Header 傳入自訂 children 取代 title/description", () => {
    render(
      <ModalCard>
        <ModalCard.Header>
          <span>完全自訂</span>
        </ModalCard.Header>
        <ModalCard.Main>內容</ModalCard.Main>
      </ModalCard>
    );

    expect(screen.getByText("完全自訂")).toBeInTheDocument();
  });

  it("Footer 傳入自訂 children 取代按鈕 layout", () => {
    render(
      <ModalCard>
        <ModalCard.Main>內容</ModalCard.Main>
        <ModalCard.Footer>
          <span>自訂 footer</span>
        </ModalCard.Footer>
      </ModalCard>
    );

    expect(screen.getByText("自訂 footer")).toBeInTheDocument();
  });

  it("完整組合：所有 slot 同時存在", () => {
    const { container } = render(
      <ModalCard>
        <ModalCard.Header title="完整">
          <ModalCard.Header.CloseButton />
        </ModalCard.Header>
        <ModalCard.Main>主區</ModalCard.Main>
        <ModalCard.Footer>
          <ModalCard.Footer.BackButton />
          <ModalCard.Footer.CancelButton />
          <ModalCard.Footer.ConfirmButton />
        </ModalCard.Footer>
      </ModalCard>
    );

    expect(container.querySelector("header")).not.toBeNull();
    expect(container.querySelector("main")).not.toBeNull();
    expect(container.querySelector("footer")).not.toBeNull();
    expect(container.querySelectorAll("button").length).toBe(4);
  });
});
