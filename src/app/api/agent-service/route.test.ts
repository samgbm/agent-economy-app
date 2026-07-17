/** @jest-environment node */

jest.mock("../../../lib/l402", () => ({
  requireL402: jest.fn().mockResolvedValue("test-preimage-hex"),
}));

jest.mock("../../../lib/supabase", () => ({
  __esModule: true,
  default: {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

import { requireL402 } from "../../../lib/l402";
import { POST } from "./route";

const mockRequireL402 = requireL402 as jest.Mock;

describe("POST /api/agent-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireL402.mockResolvedValue("test-preimage-hex");
  });

  it("returns 200 with mock premium data for a valid request", async () => {
    const response = await POST(
      new Request("http://localhost/api/agent-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "analyze market" }),
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      status: "success",
      data: {
        analysis: "Market is bullish based on recent node deployments.",
        queryProcessed: "analyze market",
      },
    });
  });

  it("returns 400 when the query field is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/agent-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBeDefined();
  });
});
