import { fireEvent, render, screen } from "@testing-library/react";
import { useTheme } from "next-themes";
import { ThemeSwitcher } from "./ThemeSwitcher";

jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = useTheme as jest.Mock;

describe("ThemeSwitcher", () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({
      theme: "agora",
      setTheme: mockSetTheme,
    });
  });

  it("renders the current theme in the dropdown", () => {
    render(<ThemeSwitcher />);

    expect(screen.getByLabelText("Select theme")).toHaveValue("agora");
    expect(screen.getByRole("option", { name: "Agora" }).selected).toBe(true);
  });

  it("calls setTheme when a new theme is selected", () => {
    render(<ThemeSwitcher />);

    fireEvent.change(screen.getByLabelText("Select theme"), {
      target: { value: "dev3pack" },
    });

    expect(mockSetTheme).toHaveBeenCalledWith("dev3pack");
  });
});
