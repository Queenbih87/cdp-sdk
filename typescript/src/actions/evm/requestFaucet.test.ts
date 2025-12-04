import { describe, expect, it, vi, beforeEach } from "vitest";
import { requestFaucet } from "./requestFaucet.js";
import type { CdpOpenApiClientType } from "../../openapi-client/index.js";
import type { Hex } from "../../types/misc.js";

describe("requestFaucet", () => {
  let mockClient: CdpOpenApiClientType;
  const mockAddress = "0x1234567890123456789012345678901234567890";
  const mockTxHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as Hex;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      requestEvmFaucet: vi.fn(),
    } as unknown as CdpOpenApiClientType;
  });

  it("should request faucet funds successfully for base-sepolia with ETH", async () => {
    (mockClient.requestEvmFaucet as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const result = await requestFaucet(mockClient, {
      address: mockAddress,
      network: "base-sepolia",
      token: "eth",
    });

    expect(mockClient.requestEvmFaucet).toHaveBeenCalledWith(
      {
        address: mockAddress,
        network: "base-sepolia",
        token: "eth",
      },
      undefined,
    );

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should request faucet funds for ethereum-sepolia with USDC", async () => {
    (mockClient.requestEvmFaucet as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const result = await requestFaucet(mockClient, {
      address: mockAddress,
      network: "ethereum-sepolia",
      token: "usdc",
    });

    expect(mockClient.requestEvmFaucet).toHaveBeenCalledWith(
      {
        address: mockAddress,
        network: "ethereum-sepolia",
        token: "usdc",
      },
      undefined,
    );

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should handle idempotency key", async () => {
    const idempotencyKey = "unique-key-12345";

    (mockClient.requestEvmFaucet as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const result = await requestFaucet(mockClient, {
      address: mockAddress,
      network: "base-sepolia",
      token: "eth",
      idempotencyKey,
    });

    expect(mockClient.requestEvmFaucet).toHaveBeenCalledWith(
      {
        address: mockAddress,
        network: "base-sepolia",
        token: "eth",
      },
      idempotencyKey,
    );

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should request EURC token", async () => {
    (mockClient.requestEvmFaucet as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const result = await requestFaucet(mockClient, {
      address: mockAddress,
      network: "base-sepolia",
      token: "eurc",
    });

    expect(mockClient.requestEvmFaucet).toHaveBeenCalledWith(
      {
        address: mockAddress,
        network: "base-sepolia",
        token: "eurc",
      },
      undefined,
    );

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should request CBBTC token", async () => {
    (mockClient.requestEvmFaucet as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const result = await requestFaucet(mockClient, {
      address: mockAddress,
      network: "base-sepolia",
      token: "cbbtc",
    });

    expect(mockClient.requestEvmFaucet).toHaveBeenCalledWith(
      {
        address: mockAddress,
        network: "base-sepolia",
        token: "cbbtc",
      },
      undefined,
    );

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should handle different address formats", async () => {
    const checksumAddress = "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12";

    (mockClient.requestEvmFaucet as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const result = await requestFaucet(mockClient, {
      address: checksumAddress,
      network: "ethereum-sepolia",
      token: "eth",
    });

    expect(mockClient.requestEvmFaucet).toHaveBeenCalledWith(
      {
        address: checksumAddress,
        network: "ethereum-sepolia",
        token: "eth",
      },
      undefined,
    );

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should return transaction hash as Hex type", async () => {
    const customTxHash = "0x123abc456def789012345678901234567890123456789012345678901234567890";

    (mockClient.requestEvmFaucet as any).mockResolvedValue({
      transactionHash: customTxHash,
    });

    const result = await requestFaucet(mockClient, {
      address: mockAddress,
      network: "base-sepolia",
      token: "usdc",
    });

    expect(result.transactionHash).toBe(customTxHash as Hex);
    expect(typeof result.transactionHash).toBe("string");
    expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]+$/);
  });
});