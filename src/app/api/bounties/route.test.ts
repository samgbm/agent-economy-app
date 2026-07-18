/** @jest-environment node */

jest.mock("../../../lib/supabase", () => ({
  __esModule: true,
  default: {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

import supabase from "../../../lib/supabase";
import { POST } from "./route";

const mockInsert = supabase.from("bounties").insert as jest.Mock;

describe("POST /api/bounties", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("returns 200 when a bounty is posted successfully", async () => {
    const response = await POST(
      new Request("http://localhost/api/bounties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_description: "Solve this CAPTCHA to unlock the target website.",
          bounty_sats: 50,
        }),
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      status: "success",
      message: "Bounty posted",
    });

    expect(mockInsert).toHaveBeenCalledWith({
      task_description: "Solve this CAPTCHA to unlock the target website.",
      bounty_sats: 50,
      status: "open",
    });
  });

  it("returns 500 when the database insert fails", async () => {
    mockInsert.mockResolvedValue({
      error: { message: "insert failed" },
    });

    const response = await POST(
      new Request("http://localhost/api/bounties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_description: "Verify a document",
          bounty_sats: 25,
        }),
      }),
    );

    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body).toEqual({ error: "Failed to post bounty" });
  });
});
