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
    reputation_score: 50,
    staked_sats: 100,
  },
};

const mockFetch = jest.fn();
const mockRequireL402 = jest.fn();
const mockPayInvoice = jest.fn();
const mockRequestInvoice = jest.fn().mockResolvedValue({
  paymentRequest: "lnbc1mockinvoice",
});
const mockLnFetch = jest.fn().mockResolvedValue(undefined);
const mockVendorUpdate = jest.fn().mockResolvedValue({ error: null });
const mockUpdate = jest.fn().mockReturnValue({
  eq: mockVendorUpdate,
});

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
    from: jest.fn((table: string) => {
      if (table === "vendors") {
        return {
          update: mockUpdate,
        };
      }

      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockService,
              error: null,
            }),
          }),
        }),
      };
    }),
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
    mockVendorUpdate.mockResolvedValue({ error: null });
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

  it("returns vendor data and increases reputation after successful delivery", async () => {
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

    expect(mockVendorUpdate).toHaveBeenCalledWith("id", "vendor-1");
    expect(mockUpdate).toHaveBeenCalledWith({
      reputation_score: 51,
    });
  });

  it("slashes vendor stake and reputation when delivery fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "vendor down" }),
    });

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

    expect(response.status).toBe(502);

    const body = await response.json();
    expect(body).toEqual({
      status: "error",
      message:
        "Vendor failed to deliver. Vendor slashed. Automated refund pending.",
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      reputation_score: 45,
      staked_sats: 90,
    });
  });

  it("returns 404 when the service is not found", async () => {
    const supabase = (await import("../../../lib/supabase")).default;

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "vendors") {
        return {
          update: mockUpdate,
        };
      }

      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "not found" },
            }),
          }),
        }),
      };
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
