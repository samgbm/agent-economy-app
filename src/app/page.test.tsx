import { fireEvent, render, screen } from "@testing-library/react";
import Home from "./page";

jest.mock("../components/DemoToggle", () => ({
  DemoToggle: () => <div data-testid="demo-toggle" />,
}));

jest.mock("../components/ThemeSwitcher", () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

jest.mock("../components/SidebarFilter", () => ({
  SidebarFilter: () => <div data-testid="sidebar-filter" />,
}));

jest.mock("../components/RevenueTracker", () => ({
  RevenueTracker: () => <div data-testid="revenue-tracker" />,
}));

jest.mock("../components/BountyBoard", () => ({
  BountyBoard: () => <div data-testid="bounty-board" />,
}));

jest.mock("../components/TransactionFeed", () => ({
  TransactionFeed: () => <div data-testid="transaction-feed" />,
}));

describe("Home page", () => {
  it("renders the dashboard hero and marketplace home by default", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /agent economy api dashboard/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/marketplace services loading/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-filter")).toBeInTheDocument();
    expect(screen.getByTestId("revenue-tracker")).toBeInTheDocument();
    expect(screen.getByTestId("demo-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("theme-switcher")).toBeInTheDocument();
    expect(screen.queryByTestId("transaction-feed")).not.toBeInTheDocument();
    expect(screen.queryByTestId("bounty-board")).not.toBeInTheDocument();
  });

  it("shows live transactions when the transactions tab is selected", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /live transactions/i }));

    expect(screen.getByTestId("revenue-tracker")).toBeInTheDocument();
    expect(screen.getByTestId("transaction-feed")).toBeInTheDocument();
    expect(screen.queryByTestId("bounty-board")).not.toBeInTheDocument();
  });

  it("shows the bounty board when the bounties tab is selected", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: /bounty board/i }));

    expect(screen.getByTestId("bounty-board")).toBeInTheDocument();
    expect(screen.queryByTestId("transaction-feed")).not.toBeInTheDocument();
  });
});
