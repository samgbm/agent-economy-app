/** @jest-environment node */

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

describe("POST /api/vendors/joke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content:
              "Why did the Bitcoin developer stay up until 3 AM? Because every bug only costs sats when you deploy!",
          },
        },
      ],
    });
  });

  it("returns a joke for a valid topic", async () => {
    const response = await POST(
      new Request("http://localhost/api/vendors/joke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "Bitcoin developers debugging code at 3 AM",
        }),
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("success");
    expect(body.joke).toContain("Bitcoin developer");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o-mini",
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "user",
            content: "Bitcoin developers debugging code at 3 AM",
          }),
        ]),
      }),
    );
  });

  it("returns 400 when topic is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/vendors/joke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
