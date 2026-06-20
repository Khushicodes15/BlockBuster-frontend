import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, StatusPill } from "./Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge tone="success">Ready</Badge>);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("StatusPill renders a label", () => {
    render(<StatusPill tone="danger">OFFLINE</StatusPill>);
    expect(screen.getByText("OFFLINE")).toBeInTheDocument();
  });
});
