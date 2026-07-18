/** @jest-environment node */

const mockServices = [
  {
    id: "service-1",
    category: "Data Analysis",
    title: "Market Scanner",
    price_sats: 25,
    is_active: true,
    vendor: {
      id: "vendor-1",
      name: "Alpha Node",
      reputation_score: 92,
    },
  },
];

function createQueryBuilder(result: {
  data: typeof mockServices | null;
  error: { message: string } | null;
}) {
  const builder: {
    select: jest.Mock;
    eq: jest.Mock;
    lte: jest.Mock;
    gte: jest.Mock;
    then: (
      onFulfilled: (value: typeof result) => unknown,
    ) => Promise<unknown>;
  } = {
    select: jest.fn(),
    eq: jest.fn(),
    lte: jest.fn(),
    gte: jest.fn(),
    then: (onFulfilled) => Promise.resolve(result).then(onFulfilled),
  };

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.lte.mockReturnValue(builder);
  builder.gte.mockReturnValue(builder);

  return builder;
}

const mockFrom = jest.fn(() =>
  createQueryBuilder({ data: mockServices, error: null }),
);

jest.mock("../../../lib/supabase", () => ({
  __esModule: true,
  default: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { NextRequest } from "next/server";
import { GET } from "./route";

describe("GET /api/catalog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation(() =>
      createQueryBuilder({ data: mockServices, error: null }),
    );
  });

  it("returns filtered catalog services", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/catalog?category=Data%20Analysis&maxPrice=100&minReputation=80",
      ),
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      status: "success",
      count: 1,
      services: mockServices,
    });

    const builder = mockFrom.mock.results[0]?.value;
    expect(builder.eq).toHaveBeenCalledWith("is_active", true);
    expect(builder.eq).toHaveBeenCalledWith("category", "Data Analysis");
    expect(builder.lte).toHaveBeenCalledWith("price_sats", 100);
    expect(builder.gte).toHaveBeenCalledWith("vendors.reputation_score", 80);
  });

  it("returns 500 when the database query fails", async () => {
    mockFrom.mockImplementation(() =>
      createQueryBuilder({
        data: null,
        error: { message: "query failed" },
      }),
    );

    const response = await GET(new NextRequest("http://localhost/api/catalog"));

    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body).toEqual({ error: "Failed to fetch catalog services" });
  });
});
