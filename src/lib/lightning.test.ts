/** @jest-environment node */

const mockEnable = jest.fn().mockResolvedValue(undefined);
const mockMakeInvoice = jest.fn().mockResolvedValue({
  paymentRequest: "lnbc1mockinvoice",
  paymentHash: "abc123paymenthash",
});

jest.mock("@getalby/sdk", () => ({
  NostrWebLNProvider: jest.fn().mockImplementation(() => ({
    enable: mockEnable,
    makeInvoice: mockMakeInvoice,
  })),
}));

describe("generateInvoice", () => {
  beforeEach(() => {
    process.env.NWC_URL = "nostr+walletconnect://test";
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("returns a mock invoice string and payment hash", async () => {
    const { generateInvoice } = await import("./lightning");

    const result = await generateInvoice(10, "Agent API Call");

    expect(result).toEqual({
      paymentRequest: "lnbc1mockinvoice",
      paymentHash: "abc123paymenthash",
    });
    expect(mockEnable).toHaveBeenCalled();
    expect(mockMakeInvoice).toHaveBeenCalledWith({
      amount: 10,
      defaultMemo: "Agent API Call",
    });
  });
});
