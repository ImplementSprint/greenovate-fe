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

  it("supports column layout, custom subtitles, and the huge size variant", () => {
    const { container } = render(
      <Logo
        size="huge"
        layout="col"
        customSubtitle="Cold Chain Command Center"
      />,
    );

    expect(
      screen.getByText("Cold Chain Command Center"),
    ).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveClass("h-36", "w-36");
    expect(container.firstChild).toHaveClass("flex-col");
  });

  it("hides the subtitle when showSubtitle is false", () => {
    render(<Logo size="large" showSubtitle={false} />);

    expect(
      screen.queryByText("Medical Logistics Portal"),
    ).not.toBeInTheDocument();
  });
});
