/** @jest-environment node */

const mockService = {
  id: "service-1",
  title: "Market Scanner",
  price_sats: 10,
  endpoint_url: "http://vendor.local/api/analyze",
  vendor: {
    id: "vendor-1",
    name: "Alpha Node",
    lightning_address: "vendor@getalby.com",
  },
};

const mockFetch = jest.fn();
const mockRequireL402 = jest.fn();
const mockPayInvoice = jest.fn();
const mockRequestInvoice = jest.fn().mockResolvedValue({
  paymentRequest: "lnbc1mockinvoice",
});
const mockLnFetch = jest.fn().mockResolvedValue(undefined);

jest.mock("../../../lib/l402", () => ({
  requireL402: (...args: unknown[]) => mockRequireL402(...args),
}));

jest.mock("@getalby/lightning-tools/lnurl", () => ({
  LightningAddress: jest.fn().mockImplementation(() => ({
    fetch: mockLnFetch,
    requestInvoice: mockRequestInvoice,
  })),
}));

jest.mock("@getalby/sdk", () => ({
  NWCClient: jest.fn().mockImplementation(() => ({
    payInvoice: mockPayInvoice,
  })),
}));

jest.mock("../../../lib/supabase", () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockService,
            error: null,
          }),
        }),
      }),
    })),
  },
}));

global.fetch = mockFetch as unknown as typeof fetch;

import { NextResponse } from "next/server";
import { POST } from "./route";

describe("POST /api/router", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireL402.mockResolvedValue("test-preimage-hex");
    mockPayInvoice.mockResolvedValue({ preimage: "vendor-preimage" });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: "vendor-success" }),
    });
  });

  it("returns 402 when L402 payment is required", async () => {
    mockRequireL402.mockResolvedValue(new NextResponse(null, { status: 402 }));

    const response = await POST(
      new Request("http://localhost/api/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service-1",
          payload: { query: "analyze" },
        }),
      }),
    );

    expect(response.status).toBe(402);
    expect(mockPayInvoice).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns vendor data after payment, payout, and proxying", async () => {
    const response = await POST(
      new Request("http://localhost/api/router", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "L402 macaroon:test:preimage",
        },
        body: JSON.stringify({
          service_id: "service-1",
          payload: { query: "analyze" },
        }),
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      status: "success",
      data: { result: "vendor-success" },
    });

    expect(mockRequireL402).toHaveBeenCalledWith(
      10,
      "Marketplace: Market Scanner",
      expect.any(Request),
    );
    expect(mockRequestInvoice).toHaveBeenCalledWith({ satoshi: 8 });
    expect(mockPayInvoice).toHaveBeenCalledWith({
      invoice: "lnbc1mockinvoice",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "http://vendor.local/api/analyze",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "analyze" }),
      }),
    );
  });

  it("returns 404 when the service is not found", async () => {
    const supabase = (await import("../../../lib/supabase")).default;

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "not found" },
          }),
        }),
      }),
    });

    const response = await POST(
      new Request("http://localhost/api/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "missing-service",
          payload: {},
        }),
      }),
    );

    expect(response.status).toBe(404);
  });
});
