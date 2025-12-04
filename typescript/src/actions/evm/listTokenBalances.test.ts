import { describe, expect, it, vi, beforeEach } from "vitest";
import { listTokenBalances } from "./listTokenBalances.js";
import type { CdpOpenApiClientType } from "../../openapi-client/index.js";
import type { Address } from "../../types/misc.js";

describe("listTokenBalances", () => {
  let mockClient: CdpOpenApiClientType;
  const mockAddress = "0x1234567890123456789012345678901234567890" as Address;
  const mockNetwork = "base" as const;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      listDataTokenBalances: vi.fn(),
    } as unknown as CdpOpenApiClientType;
  });

  it("should list token balances successfully", async () => {
    const mockResponse = {
      balances: [
        {
          token: {
            network: "base",
            contractAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            symbol: "ETH",
            name: "Ether",
          },
          amount: {
            amount: "1000000000000000000",
            decimals: 18,
          },
        },
        {
          token: {
            network: "base",
            contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            symbol: "USDC",
            name: "USD Coin",
          },
          amount: {
            amount: "1000000",
            decimals: 6,
          },
        },
      ],
    };

    (mockClient.listDataTokenBalances as any).mockResolvedValue(mockResponse);

    const result = await listTokenBalances(mockClient, {
      address: mockAddress,
      network: mockNetwork,
    });

    expect(mockClient.listDataTokenBalances).toHaveBeenCalledWith(mockNetwork, mockAddress, {
      pageSize: undefined,
      pageToken: undefined,
    });

    expect(result.balances).toHaveLength(2);
    expect(result.balances[0].token.symbol).toBe("ETH");
    expect(result.balances[0].token.name).toBe("Ether");
    expect(result.balances[0].amount.amount).toBe(BigInt("1000000000000000000"));
    expect(result.balances[0].amount.decimals).toBe(18);
    expect(result.balances[1].token.symbol).toBe("USDC");
    expect(result.balances[1].amount.amount).toBe(BigInt("1000000"));
    expect(result.balances[1].amount.decimals).toBe(6);
  });

  it("should handle pagination parameters", async () => {
    const mockResponse = {
      balances: [
        {
          token: {
            network: "base",
            contractAddress: "0x1234567890123456789012345678901234567890",
          },
          amount: {
            amount: "500000",
            decimals: 18,
          },
        },
      ],
      nextPageToken: "next_token_here",
    };

    (mockClient.listDataTokenBalances as any).mockResolvedValue(mockResponse);

    const result = await listTokenBalances(mockClient, {
      address: mockAddress,
      network: mockNetwork,
      pageSize: 20,
      pageToken: "current_token",
    });

    expect(mockClient.listDataTokenBalances).toHaveBeenCalledWith(mockNetwork, mockAddress, {
      pageSize: 20,
      pageToken: "current_token",
    });

    expect(result.nextPageToken).toBe("next_token_here");
  });

  it("should handle empty balances list", async () => {
    const mockResponse = {
      balances: [],
    };

    (mockClient.listDataTokenBalances as any).mockResolvedValue(mockResponse);

    const result = await listTokenBalances(mockClient, {
      address: mockAddress,
      network: mockNetwork,
    });

    expect(result.balances).toHaveLength(0);
    expect(result.nextPageToken).toBeUndefined();
  });

  it("should handle tokens without symbol and name", async () => {
    const mockResponse = {
      balances: [
        {
          token: {
            network: "base",
            contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
          },
          amount: {
            amount: "999999999",
            decimals: 8,
          },
        },
      ],
    };

    (mockClient.listDataTokenBalances as any).mockResolvedValue(mockResponse);

    const result = await listTokenBalances(mockClient, {
      address: mockAddress,
      network: mockNetwork,
    });

    expect(result.balances[0].token.symbol).toBeUndefined();
    expect(result.balances[0].token.name).toBeUndefined();
    expect(result.balances[0].token.contractAddress).toBe(
      "0xabcdef1234567890abcdef1234567890abcdef12" as Address,
    );
  });

  it("should convert amount to BigInt correctly for large values", async () => {
    const mockResponse = {
      balances: [
        {
          token: {
            network: "base",
            contractAddress: "0x1234567890123456789012345678901234567890",
          },
          amount: {
            amount: "999999999999999999999999",
            decimals: 18,
          },
        },
      ],
    };

    (mockClient.listDataTokenBalances as any).mockResolvedValue(mockResponse);

    const result = await listTokenBalances(mockClient, {
      address: mockAddress,
      network: mockNetwork,
    });

    expect(result.balances[0].amount.amount).toBe(BigInt("999999999999999999999999"));
    expect(typeof result.balances[0].amount.amount).toBe("bigint");
  });

  it("should handle different networks correctly", async () => {
    const networks = ["base", "base-sepolia", "ethereum"] as const;

    for (const network of networks) {
      const mockResponse = {
        balances: [
          {
            token: {
              network,
              contractAddress: "0x1234567890123456789012345678901234567890",
            },
            amount: {
              amount: "1000",
              decimals: 18,
            },
          },
        ],
      };

      (mockClient.listDataTokenBalances as any).mockResolvedValue(mockResponse);

      const result = await listTokenBalances(mockClient, {
        address: mockAddress,
        network,
      });

      expect(mockClient.listDataTokenBalances).toHaveBeenCalledWith(network, mockAddress, {
        pageSize: undefined,
        pageToken: undefined,
      });

      expect(result.balances[0].token.network).toBe(network);
    }
  });

  it("should return nextPageToken when available", async () => {
    const mockResponse = {
      balances: [
        {
          token: {
            network: "base",
            contractAddress: "0x1234567890123456789012345678901234567890",
          },
          amount: {
            amount: "100",
            decimals: 18,
          },
        },
      ],
      nextPageToken: "pagination_token_abc123",
    };

    (mockClient.listDataTokenBalances as any).mockResolvedValue(mockResponse);

    const result = await listTokenBalances(mockClient, {
      address: mockAddress,
      network: mockNetwork,
    });

    expect(result.nextPageToken).toBe("pagination_token_abc123");
  });
});