/** @jest-environment node */

import { POST } from "./route";

describe("POST /api/agent-service", () => {
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
