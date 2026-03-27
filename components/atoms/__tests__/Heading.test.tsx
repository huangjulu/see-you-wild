import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Heading from "../Heading";

describe("Heading", () => {
  it("renders correct heading level h1", () => {
    render(<Heading level="h1">Title</Heading>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Title");
  });

  it("renders correct heading level h2", () => {
    render(<Heading level="h2">Subtitle</Heading>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Subtitle");
  });

  it("renders correct heading level h3", () => {
    render(<Heading level="h3">Section</Heading>);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Section");
  });

  it("renders children", () => {
    render(<Heading level="h2">Hello World</Heading>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("applies font-serif class", () => {
    render(<Heading level="h1">Styled</Heading>);
    expect(screen.getByRole("heading").className).toContain("font-serif");
  });

  it("forwards id prop", () => {
    render(<Heading level="h2" id="test-id">ID</Heading>);
    expect(screen.getByRole("heading")).toHaveAttribute("id", "test-id");
  });
});
