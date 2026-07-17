/** @jest-environment node */

const mockRateLimit = jest.fn();

jest.mock("../../../lib/ratelimit", () => ({
  ratelimit: {
    limit: (...args: unknown[]) => mockRateLimit(...args),
  },
}));

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

const mockCreate = jest.fn();

jest.mock("openai", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: (...args: unknown[]) => mockCreate(...args),
      },
    },
  })),
}));

import { requireL402 } from "../../../lib/l402";
import { POST } from "./route";

const mockRequireL402 = requireL402 as jest.Mock;

describe("POST /api/agent-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 10_000,
    });
    mockRequireL402.mockResolvedValue("test-preimage-hex");
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: "Markets show strong momentum in Lightning infrastructure.",
          },
        },
      ],
    });
  });

  it("returns 200 with LLM analysis for a valid request", async () => {
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
        analysis: "Markets show strong momentum in Lightning infrastructure.",
        queryProcessed: "analyze market",
      },
    });

    expect(mockCreate).toHaveBeenCalledWith({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert financial and market analyst agent. Provide concise, actionable insights based on the user's query.",
        },
        {
          role: "user",
          content: "analyze market",
        },
      ],
    });
  });

  it("returns 429 when the rate limit is exceeded", async () => {
    mockRateLimit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 10_000,
    });

    const response = await POST(
      new Request("http://localhost/api/agent-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.10",
        },
        body: JSON.stringify({ query: "analyze market" }),
      }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");

    const body = await response.json();
    expect(body).toEqual({
      error: "Rate limit exceeded. Please slow down.",
    });
    expect(mockRateLimit).toHaveBeenCalledWith("203.0.113.10");
    expect(mockRequireL402).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
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
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
