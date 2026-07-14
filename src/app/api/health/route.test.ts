/** @jest-environment node */

import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns ok status with a 200 response", async () => {
    const response = await GET(new Request("http://localhost/api/health"));

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({ status: "ok" });
  });
});
