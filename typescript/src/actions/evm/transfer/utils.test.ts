import { describe, expect, it } from "vitest";
import { getErc20Address } from "./utils.js";

describe("transfer utils", () => {
  describe("getErc20Address", () => {
    it("should return USDC address for base network", () => {
      const address = getErc20Address("usdc", "base");
      expect(address).toBe("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
    });

    it("should return USDC address for base-sepolia network", () => {
      const address = getErc20Address("usdc", "base-sepolia");
      expect(address).toBe("0x036CbD53842c5426634e7929541eC2318f3dCF7e");
    });

    it("should return the input address if token is not in the map", () => {
      const customAddress = "0x1234567890123456789012345678901234567890";
      const address = getErc20Address(customAddress, "base");
      expect(address).toBe(customAddress);
    });

    it("should return the input address for unknown token symbol", () => {
      const unknownToken = "UNKNOWN";
      const address = getErc20Address(unknownToken, "base");
      expect(address).toBe(unknownToken);
    });

    it("should handle lowercase token symbols", () => {
      const address = getErc20Address("usdc", "base");
      expect(address).toBe("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
    });

    it("should return contract address as-is when not found in map", () => {
      const contractAddress = "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12";
      const resultBase = getErc20Address(contractAddress, "base");
      const resultBaseSepolia = getErc20Address(contractAddress, "base-sepolia");

      expect(resultBase).toBe(contractAddress);
      expect(resultBaseSepolia).toBe(contractAddress);
    });

    it("should distinguish between networks correctly", () => {
      const baseAddress = getErc20Address("usdc", "base");
      const baseSepoliaAddress = getErc20Address("usdc", "base-sepolia");

      expect(baseAddress).not.toBe(baseSepoliaAddress);
      expect(baseAddress).toBe("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
      expect(baseSepoliaAddress).toBe("0x036CbD53842c5426634e7929541eC2318f3dCF7e");
    });
  });
});