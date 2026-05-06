import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Heading from "../Heading";

describe("Heading", () => {
  it("renders correct heading level h1", () => {
    render(<Heading.H1>Title</Heading.H1>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Title"
    );
  });

  it("renders correct heading level h2", () => {
    render(<Heading.H2>Subtitle</Heading.H2>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Subtitle"
    );
  });

  it("renders correct heading level h3", () => {
    render(<Heading.H3>Section</Heading.H3>);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Section"
    );
  });

  it("renders children", () => {
    render(<Heading.H2>Hello World</Heading.H2>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("applies typo-heading class", () => {
    render(<Heading.H1>Styled</Heading.H1>);
    expect(screen.getByRole("heading").className).toContain("typo-heading");
  });

  it("forwards id prop", () => {
    render(<Heading.H2 id="test-id">ID</Heading.H2>);
    expect(screen.getByRole("heading")).toHaveAttribute("id", "test-id");
  });
});
