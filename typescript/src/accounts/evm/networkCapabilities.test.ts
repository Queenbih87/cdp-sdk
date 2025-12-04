import { describe, expect, it } from "vitest";
import {
  NETWORK_CAPABILITIES,
  getNetworksSupportingMethod,
  isMethodSupportedOnNetwork,
} from "./networkCapabilities.js";

describe("networkCapabilities", () => {
  describe("NETWORK_CAPABILITIES", () => {
    it("should have base network with correct capabilities", () => {
      expect(NETWORK_CAPABILITIES.base.listTokenBalances).toBe(true);
      expect(NETWORK_CAPABILITIES.base.requestFaucet).toBe(false);
      expect(NETWORK_CAPABILITIES.base.quoteFund).toBe(true);
      expect(NETWORK_CAPABILITIES.base.fund).toBe(true);
      expect(NETWORK_CAPABILITIES.base.transfer).toBe(true);
      expect(NETWORK_CAPABILITIES.base.sendTransaction).toBe(true);
      expect(NETWORK_CAPABILITIES.base.quoteSwap).toBe(true);
      expect(NETWORK_CAPABILITIES.base.swap).toBe(true);
      expect(NETWORK_CAPABILITIES.base.useSpendPermission).toBe(true);
    });

    it("should have base-sepolia network with correct capabilities", () => {
      expect(NETWORK_CAPABILITIES["base-sepolia"].listTokenBalances).toBe(true);
      expect(NETWORK_CAPABILITIES["base-sepolia"].requestFaucet).toBe(true);
      expect(NETWORK_CAPABILITIES["base-sepolia"].quoteFund).toBe(false);
      expect(NETWORK_CAPABILITIES["base-sepolia"].fund).toBe(false);
      expect(NETWORK_CAPABILITIES["base-sepolia"].transfer).toBe(true);
      expect(NETWORK_CAPABILITIES["base-sepolia"].sendTransaction).toBe(true);
      expect(NETWORK_CAPABILITIES["base-sepolia"].quoteSwap).toBe(false);
      expect(NETWORK_CAPABILITIES["base-sepolia"].swap).toBe(false);
    });

    it("should have ethereum network with correct capabilities", () => {
      expect(NETWORK_CAPABILITIES.ethereum.listTokenBalances).toBe(true);
      expect(NETWORK_CAPABILITIES.ethereum.requestFaucet).toBe(false);
      expect(NETWORK_CAPABILITIES.ethereum.quoteFund).toBe(false);
      expect(NETWORK_CAPABILITIES.ethereum.fund).toBe(false);
      expect(NETWORK_CAPABILITIES.ethereum.transfer).toBe(true);
      expect(NETWORK_CAPABILITIES.ethereum.sendTransaction).toBe(true);
      expect(NETWORK_CAPABILITIES.ethereum.quoteSwap).toBe(true);
      expect(NETWORK_CAPABILITIES.ethereum.swap).toBe(true);
    });

    it("should have all networks defined", () => {
      const expectedNetworks = [
        "base",
        "base-sepolia",
        "ethereum",
        "ethereum-sepolia",
        "ethereum-hoodi",
        "optimism",
        "optimism-sepolia",
        "arbitrum",
        "arbitrum-sepolia",
        "avalanche",
        "binance",
        "polygon",
        "zora",
      ];

      expectedNetworks.forEach(network => {
        expect(NETWORK_CAPABILITIES[network]).toBeDefined();
      });
    });

    it("should have sendTransaction available on all networks", () => {
      Object.keys(NETWORK_CAPABILITIES).forEach(network => {
        expect(NETWORK_CAPABILITIES[network].sendTransaction).toBe(true);
      });
    });
  });

  describe("getNetworksSupportingMethod", () => {
    it("should return networks that support listTokenBalances", () => {
      const networks = getNetworksSupportingMethod("listTokenBalances");

      expect(networks).toContain("base");
      expect(networks).toContain("base-sepolia");
      expect(networks).toContain("ethereum");
      expect(networks).not.toContain("ethereum-sepolia");
    });

    it("should return networks that support requestFaucet", () => {
      const networks = getNetworksSupportingMethod("requestFaucet");

      expect(networks).toContain("base-sepolia");
      expect(networks).toContain("ethereum-sepolia");
      expect(networks).toContain("ethereum-hoodi");
      expect(networks).not.toContain("base");
      expect(networks).not.toContain("ethereum");
    });

    it("should return networks that support quoteFund", () => {
      const networks = getNetworksSupportingMethod("quoteFund");

      expect(networks).toContain("base");
      expect(networks).not.toContain("base-sepolia");
      expect(networks).not.toContain("ethereum");
    });

    it("should return networks that support fund", () => {
      const networks = getNetworksSupportingMethod("fund");

      expect(networks).toContain("base");
      expect(networks).not.toContain("base-sepolia");
      expect(networks).not.toContain("ethereum");
    });

    it("should return networks that support transfer", () => {
      const networks = getNetworksSupportingMethod("transfer");

      expect(networks).toContain("base");
      expect(networks).toContain("base-sepolia");
      expect(networks).toContain("ethereum");
      expect(networks).toContain("ethereum-sepolia");
      expect(networks).not.toContain("ethereum-hoodi");
      expect(networks).not.toContain("optimism");
    });

    it("should return all networks for sendTransaction", () => {
      const networks = getNetworksSupportingMethod("sendTransaction");

      expect(networks.length).toBeGreaterThan(0);
      expect(networks).toContain("base");
      expect(networks).toContain("base-sepolia");
      expect(networks).toContain("ethereum");
      expect(networks).toContain("ethereum-sepolia");
      expect(networks).toContain("ethereum-hoodi");
      expect(networks).toContain("optimism");
      expect(networks).toContain("arbitrum");
      expect(networks).toContain("polygon");
    });

    it("should return networks that support quoteSwap", () => {
      const networks = getNetworksSupportingMethod("quoteSwap");

      expect(networks).toContain("base");
      expect(networks).toContain("ethereum");
      expect(networks).toContain("optimism");
      expect(networks).toContain("arbitrum");
      expect(networks).not.toContain("base-sepolia");
      expect(networks).not.toContain("ethereum-sepolia");
    });

    it("should return networks that support swap", () => {
      const networks = getNetworksSupportingMethod("swap");

      expect(networks).toContain("base");
      expect(networks).toContain("ethereum");
      expect(networks).toContain("optimism");
      expect(networks).toContain("arbitrum");
      expect(networks).not.toContain("base-sepolia");
      expect(networks).not.toContain("polygon");
    });

    it("should return networks that support useSpendPermission", () => {
      const networks = getNetworksSupportingMethod("useSpendPermission");

      expect(networks).toContain("base");
      expect(networks).toContain("base-sepolia");
      expect(networks).toContain("ethereum");
      expect(networks).toContain("ethereum-sepolia");
      expect(networks).toContain("optimism");
      expect(networks).toContain("arbitrum");
      expect(networks).not.toContain("ethereum-hoodi");
    });
  });

  describe("isMethodSupportedOnNetwork", () => {
    it("should return true for supported method on network", () => {
      expect(isMethodSupportedOnNetwork("listTokenBalances", "base")).toBe(true);
      expect(isMethodSupportedOnNetwork("requestFaucet", "base-sepolia")).toBe(true);
      expect(isMethodSupportedOnNetwork("quoteSwap", "ethereum")).toBe(true);
      expect(isMethodSupportedOnNetwork("sendTransaction", "arbitrum")).toBe(true);
    });

    it("should return false for unsupported method on network", () => {
      expect(isMethodSupportedOnNetwork("requestFaucet", "base")).toBe(false);
      expect(isMethodSupportedOnNetwork("quoteFund", "ethereum")).toBe(false);
      expect(isMethodSupportedOnNetwork("quoteSwap", "base-sepolia")).toBe(false);
      expect(isMethodSupportedOnNetwork("transfer", "ethereum-hoodi")).toBe(false);
    });

    it("should return false for unknown network", () => {
      expect(isMethodSupportedOnNetwork("listTokenBalances", "unknown-network")).toBe(false);
      expect(isMethodSupportedOnNetwork("sendTransaction", "fake-chain")).toBe(false);
    });

    it("should handle all method types", () => {
      const methods = [
        "listTokenBalances",
        "requestFaucet",
        "quoteFund",
        "fund",
        "waitForFundOperationReceipt",
        "transfer",
        "sendTransaction",
        "quoteSwap",
        "swap",
        "useSpendPermission",
      ] as const;

      methods.forEach(method => {
        const result = isMethodSupportedOnNetwork(method, "base");
        expect(typeof result).toBe("boolean");
      });
    });
  });
});