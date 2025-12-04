import { describe, expect, it, vi, beforeEach } from "vitest";
import { sendTransaction } from "./sendTransaction.js";
import { serializeTransaction } from "viem";
import type { CdpOpenApiClientType } from "../../openapi-client/index.js";
import type { Address, Hex } from "../../types/misc.js";

vi.mock("viem", async () => {
  const actual = await vi.importActual("viem");
  return {
    ...actual,
    serializeTransaction: vi.fn(),
  };
});

describe("sendTransaction", () => {
  let mockClient: CdpOpenApiClientType;
  const mockAddress = "0x1234567890123456789012345678901234567890" as Address;
  const mockTxHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" as Hex;
  const mockNetwork = "base" as const;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      sendEvmTransaction: vi.fn(),
    } as unknown as CdpOpenApiClientType;
  });

  it("should send a raw transaction as hex string", async () => {
    const rawTransaction =
      "0x02f8b00182039484773594e8f9b95bd1cbecb1e33b8e4e39e0e7bc844f4f5374a8" as Hex;

    (mockClient.sendEvmTransaction as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const result = await sendTransaction(mockClient, {
      address: mockAddress,
      transaction: rawTransaction,
      network: mockNetwork,
    });

    expect(mockClient.sendEvmTransaction).toHaveBeenCalledWith(
      mockAddress,
      {
        transaction: rawTransaction,
        network: mockNetwork,
      },
      undefined,
    );

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should serialize and send an EIP-1559 transaction object", async () => {
    const serializedTx = "0x02f8b001820394847735..." as Hex;
    (serializeTransaction as any).mockReturnValue(serializedTx);

    (mockClient.sendEvmTransaction as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const transactionObject = {
      to: "0x9876543210987654321098765432109876543210" as Address,
      value: BigInt("1000000000000000000"),
      data: "0x" as Hex,
      nonce: 5,
      maxFeePerGas: BigInt("2000000000"),
      maxPriorityFeePerGas: BigInt("1000000000"),
      gas: BigInt("21000"),
      chainId: 8453,
    };

    const result = await sendTransaction(mockClient, {
      address: mockAddress,
      transaction: transactionObject,
      network: mockNetwork,
    });

    expect(serializeTransaction).toHaveBeenCalledWith({
      ...transactionObject,
      chainId: 1,
      type: "eip1559",
    });

    expect(mockClient.sendEvmTransaction).toHaveBeenCalledWith(
      mockAddress,
      {
        transaction: serializedTx,
        network: mockNetwork,
      },
      undefined,
    );

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should handle idempotency key", async () => {
    const rawTransaction = "0x02f8b00182039484773594..." as Hex;
    const idempotencyKey = "unique-key-123";

    (mockClient.sendEvmTransaction as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const result = await sendTransaction(mockClient, {
      address: mockAddress,
      transaction: rawTransaction,
      network: mockNetwork,
      idempotencyKey,
    });

    expect(mockClient.sendEvmTransaction).toHaveBeenCalledWith(
      mockAddress,
      {
        transaction: rawTransaction,
        network: mockNetwork,
      },
      idempotencyKey,
    );

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should work with different networks", async () => {
    const networks = ["base", "base-sepolia", "ethereum", "ethereum-sepolia"] as const;
    const rawTransaction = "0x02f8b00182..." as Hex;

    for (const network of networks) {
      (mockClient.sendEvmTransaction as any).mockResolvedValue({
        transactionHash: mockTxHash,
      });

      await sendTransaction(mockClient, {
        address: mockAddress,
        transaction: rawTransaction,
        network,
      });

      expect(mockClient.sendEvmTransaction).toHaveBeenCalledWith(
        mockAddress,
        {
          transaction: rawTransaction,
          network,
        },
        undefined,
      );
    }
  });

  it("should handle transaction with contract interaction data", async () => {
    const serializedTx = "0x02f8b001820394..." as Hex;
    (serializeTransaction as any).mockReturnValue(serializedTx);

    (mockClient.sendEvmTransaction as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const transactionObject = {
      to: "0x9876543210987654321098765432109876543210" as Address,
      value: BigInt("0"),
      data: "0x095ea7b3000000000000000000000000000000000000000000000000000000000000dead" as Hex,
      nonce: 10,
      maxFeePerGas: BigInt("3000000000"),
      maxPriorityFeePerGas: BigInt("1500000000"),
      gas: BigInt("100000"),
    };

    const result = await sendTransaction(mockClient, {
      address: mockAddress,
      transaction: transactionObject,
      network: mockNetwork,
    });

    expect(serializeTransaction).toHaveBeenCalledWith({
      ...transactionObject,
      chainId: 1,
      type: "eip1559",
    });

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should handle zero value transactions", async () => {
    const serializedTx = "0x02f8..." as Hex;
    (serializeTransaction as any).mockReturnValue(serializedTx);

    (mockClient.sendEvmTransaction as any).mockResolvedValue({
      transactionHash: mockTxHash,
    });

    const transactionObject = {
      to: "0x9876543210987654321098765432109876543210" as Address,
      value: BigInt("0"),
      data: "0x" as Hex,
      nonce: 0,
      maxFeePerGas: BigInt("2000000000"),
      maxPriorityFeePerGas: BigInt("1000000000"),
      gas: BigInt("21000"),
    };

    const result = await sendTransaction(mockClient, {
      address: mockAddress,
      transaction: transactionObject,
      network: mockNetwork,
    });

    expect(result.transactionHash).toBe(mockTxHash);
  });

  it("should return transaction hash with correct Hex type", async () => {
    const rawTransaction = "0x02f8b00182..." as Hex;
    const customTxHash = "0x999888777666555444333222111000999888777666555444333222111000abcd" as Hex;

    (mockClient.sendEvmTransaction as any).mockResolvedValue({
      transactionHash: customTxHash,
    });

    const result = await sendTransaction(mockClient, {
      address: mockAddress,
      transaction: rawTransaction,
      network: mockNetwork,
    });

    expect(result.transactionHash).toBe(customTxHash);
    expect(typeof result.transactionHash).toBe("string");
    expect(result.transactionHash).toMatch(/^0x[a-fA-F0-9]+$/);
  });
});