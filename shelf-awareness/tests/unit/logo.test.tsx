import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/Logo";

describe("Logo", () => {
  it("renders the Shelf Awareness branding", () => {
    render(<Logo />);

    expect(screen.getByText("Shelf Awareness")).toBeInTheDocument();
    expect(screen.getByText("Medical Logistics Portal")).toBeInTheDocument();
  });

  it("omits the subtitle for the small variant", () => {
    render(<Logo size="small" />);

    expect(screen.getByText("Shelf Awareness")).toBeInTheDocument();
    expect(
      screen.queryByText("Medical Logistics Portal"),
    ).not.toBeInTheDocument();
  });
});
