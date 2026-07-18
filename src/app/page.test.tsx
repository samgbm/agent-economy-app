import { render, screen } from "@testing-library/react";
import Home from "./page";

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
  it("renders the dashboard hero and transaction feed", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /agent economy api dashboard/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("revenue-tracker")).toBeInTheDocument();
    expect(screen.getByTestId("transaction-feed")).toBeInTheDocument();
    expect(screen.getByTestId("bounty-board")).toBeInTheDocument();
  });
});
