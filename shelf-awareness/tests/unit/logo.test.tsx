import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/Logo";

describe("Logo", () => {
  it("renders the Shelf Awareness branding", () => {
    render(<Logo />);

    expect(screen.getByText("Shelf Awareness")).toBeInTheDocument();
    expect(screen.getByText("Medical Logistics Portal")).toBeInTheDocument();
  });
});
