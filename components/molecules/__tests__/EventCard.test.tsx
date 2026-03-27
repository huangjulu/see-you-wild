import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import EventCard from "../EventCard";

// Mock next/image to render a plain img tag
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const baseProps = {
  tag: "限定企劃",
  title: "野營私廚",
  subtitle: "營火晚宴",
  date: "03/14-15",
  description: "在星空下享受私廚料理。",
  cta: "立即預約",
  ctaUrl: "https://example.com",
  image: "/images/event.jpg",
  imageAlt: "Event image",
  variant: "solid" as const,
};

describe("EventCard", () => {
  it("renders event title", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.getByText("野營私廚")).toBeInTheDocument();
  });

  it("renders date", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.getByText("03/14-15")).toBeInTheDocument();
  });

  it("renders tag", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.getByText("限定企劃")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.getByText("在星空下享受私廚料理。")).toBeInTheDocument();
  });

  it("renders CTA button with correct link", () => {
    render(<EventCard {...baseProps} />);
    const cta = screen.getByRole("button", { name: /立即預約/ });
    expect(cta).toHaveAttribute("href", "https://example.com");
  });

  it("applies md:flex-row-reverse when reverse=true", () => {
    const { container } = render(<EventCard {...baseProps} reverse />);
    const article = container.querySelector("article");
    expect(article?.className).toContain("md:flex-row-reverse");
  });

  it("does not apply md:flex-row-reverse when reverse=false", () => {
    const { container } = render(<EventCard {...baseProps} reverse={false} />);
    const article = container.querySelector("article");
    expect(article?.className).not.toContain("md:flex-row-reverse");
    expect(article?.className).toContain("md:flex-row");
  });
});
