/** @jest-environment node */

jest.mock("../../../lib/supabase", () => ({
  __esModule: true,
  default: {
    from: jest.fn((table: string) => {
      if (table === "app_settings") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { demo_mode: false },
              }),
            }),
          }),
        };
      }

      return {
        select: jest.fn(),
      };
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

import { POST } from "./route";

describe("POST /api/vendor-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: "Vendor analysis complete.",
          },
        },
      ],
    });
  });

  it("returns LLM analysis for a valid payload without L402", async () => {
    const response = await POST(
      new Request("http://localhost/api/vendor-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "analyze market trends" }),
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      analysis: "Vendor analysis complete.",
      queryProcessed: "analyze market trends",
    });

    expect(mockCreate).toHaveBeenCalled();
  });

  it("returns 400 when query is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/vendor-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
