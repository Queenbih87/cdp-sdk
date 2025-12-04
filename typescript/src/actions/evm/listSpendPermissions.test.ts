import { describe, expect, it, vi, beforeEach } from "vitest";
import { listSpendPermissions } from "./listSpendPermissions.js";
import type { CdpOpenApiClient } from "../../openapi-client/index.js";
import type { Address, Hex } from "../../types/misc.js";

describe("listSpendPermissions", () => {
  let mockClient: typeof CdpOpenApiClient;
  const mockAddress = "0x1234567890123456789012345678901234567890" as Address;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      listSpendPermissions: vi.fn(),
    } as unknown as typeof CdpOpenApiClient;
  });

  it("should list spend permissions successfully", async () => {
    const mockResponse = {
      spendPermissions: [
        {
          permissionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          permission: {
            account: "0x1111111111111111111111111111111111111111",
            spender: "0x2222222222222222222222222222222222222222",
            token: "0x3333333333333333333333333333333333333333",
            allowance: "1000000000000000000",
            period: "86400",
            start: "1704067200",
            end: "1735689600",
            salt: "12345",
            extraData: "0x",
          },
        },
      ],
    };

    (mockClient.listSpendPermissions as any).mockResolvedValue(mockResponse);

    const result = await listSpendPermissions(mockClient, {
      address: mockAddress,
    });

    expect(mockClient.listSpendPermissions).toHaveBeenCalledWith(mockAddress, {
      pageSize: undefined,
      pageToken: undefined,
    });

    expect(result.spendPermissions).toHaveLength(1);
    expect(result.spendPermissions[0].permissionHash).toBe(
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as Hex,
    );
    expect(result.spendPermissions[0].permission.account).toBe(
      "0x1111111111111111111111111111111111111111" as Address,
    );
    expect(result.spendPermissions[0].permission.allowance).toBe(BigInt("1000000000000000000"));
    expect(result.spendPermissions[0].permission.period).toBe(86400);
    expect(result.spendPermissions[0].permission.start).toBe(1704067200);
    expect(result.spendPermissions[0].permission.end).toBe(1735689600);
    expect(result.spendPermissions[0].permission.salt).toBe(BigInt(12345));
  });

  it("should handle pagination with pageSize and pageToken", async () => {
    const mockResponse = {
      spendPermissions: [
        {
          permissionHash: "0xabc123",
          permission: {
            account: "0x1111111111111111111111111111111111111111",
            spender: "0x2222222222222222222222222222222222222222",
            token: "0x3333333333333333333333333333333333333333",
            allowance: "500000",
            period: "3600",
            start: "1704067200",
            end: "1735689600",
            salt: "999",
            extraData: "0xdeadbeef",
          },
        },
      ],
      nextPageToken: "next_page_token",
    };

    (mockClient.listSpendPermissions as any).mockResolvedValue(mockResponse);

    const result = await listSpendPermissions(mockClient, {
      address: mockAddress,
      pageSize: 10,
      pageToken: "current_page_token",
    });

    expect(mockClient.listSpendPermissions).toHaveBeenCalledWith(mockAddress, {
      pageSize: 10,
      pageToken: "current_page_token",
    });

    expect(result.spendPermissions).toHaveLength(1);
  });

  it("should handle empty spend permissions list", async () => {
    const mockResponse = {
      spendPermissions: [],
    };

    (mockClient.listSpendPermissions as any).mockResolvedValue(mockResponse);

    const result = await listSpendPermissions(mockClient, {
      address: mockAddress,
    });

    expect(result.spendPermissions).toHaveLength(0);
  });

  it("should handle multiple spend permissions", async () => {
    const mockResponse = {
      spendPermissions: [
        {
          permissionHash: "0xhash1",
          permission: {
            account: "0x1111111111111111111111111111111111111111",
            spender: "0x2222222222222222222222222222222222222222",
            token: "0x3333333333333333333333333333333333333333",
            allowance: "1000000",
            period: "86400",
            start: "1704067200",
            end: "1735689600",
            salt: "1",
            extraData: "0x",
          },
        },
        {
          permissionHash: "0xhash2",
          permission: {
            account: "0x4444444444444444444444444444444444444444",
            spender: "0x5555555555555555555555555555555555555555",
            token: "0x6666666666666666666666666666666666666666",
            allowance: "2000000",
            period: "172800",
            start: "1704153600",
            end: "1735776000",
            salt: "2",
            extraData: "0xabcd",
          },
        },
      ],
    };

    (mockClient.listSpendPermissions as any).mockResolvedValue(mockResponse);

    const result = await listSpendPermissions(mockClient, {
      address: mockAddress,
    });

    expect(result.spendPermissions).toHaveLength(2);
    expect(result.spendPermissions[0].permissionHash).toBe("0xhash1" as Hex);
    expect(result.spendPermissions[1].permissionHash).toBe("0xhash2" as Hex);
    expect(result.spendPermissions[0].permission.allowance).toBe(BigInt(1000000));
    expect(result.spendPermissions[1].permission.allowance).toBe(BigInt(2000000));
  });

  it("should correctly convert all numeric fields to proper types", async () => {
    const mockResponse = {
      spendPermissions: [
        {
          permissionHash: "0xtest",
          permission: {
            account: "0x1111111111111111111111111111111111111111",
            spender: "0x2222222222222222222222222222222222222222",
            token: "0x3333333333333333333333333333333333333333",
            allowance: "999999999999999999",
            period: "604800",
            start: "1704240000",
            end: "1735862400",
            salt: "999888777",
            extraData: "0x1234",
          },
        },
      ],
    };

    (mockClient.listSpendPermissions as any).mockResolvedValue(mockResponse);

    const result = await listSpendPermissions(mockClient, {
      address: mockAddress,
    });

    const permission = result.spendPermissions[0].permission;
    expect(typeof permission.allowance).toBe("bigint");
    expect(typeof permission.period).toBe("number");
    expect(typeof permission.start).toBe("number");
    expect(typeof permission.end).toBe("number");
    expect(typeof permission.salt).toBe("bigint");
    expect(permission.extraData).toMatch(/^0x/);
  });
});