import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getBaseNodeRpcUrl } from "./getBaseNodeRpcUrl.js";
import { generateJwt } from "../../auth/utils/jwt.js";
import * as cdpApiClient from "../../openapi-client/cdpApiClient.js";

vi.mock("../../auth/utils/jwt.js");

describe("getBaseNodeRpcUrl", () => {
  const mockApiKeyId = "test-api-key-id";
  const mockApiKeySecret = "test-api-key-secret";
  const mockBasePath = "https://api.cdp.coinbase.com/platform";
  const mockTokenId = "token-123-abc";
  const mockJwt = "mock.jwt.token";

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return base node RPC URL for base network", async () => {
    vi.spyOn(cdpApiClient, "config", "get").mockReturnValue({
      apiKeyId: mockApiKeyId,
      apiKeySecret: mockApiKeySecret,
      basePath: mockBasePath,
    } as any);

    (generateJwt as any).mockResolvedValue(mockJwt);
    (global.fetch as any).mockResolvedValue({
      json: async () => ({ id: mockTokenId }),
    });

    const result = await getBaseNodeRpcUrl("base");

    expect(generateJwt).toHaveBeenCalledWith({
      apiKeyId: mockApiKeyId,
      apiKeySecret: mockApiKeySecret,
      requestMethod: "GET",
      requestHost: "api.cdp.coinbase.com",
      requestPath: "/apikeys/v1/tokens/active",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.cdp.coinbase.com/apikeys/v1/tokens/active",
      {
        headers: {
          Authorization: `Bearer ${mockJwt}`,
          "Content-Type": "application/json",
        },
      },
    );

    expect(result).toBe("https://api.cdp.coinbase.com/rpc/v1/base/token-123-abc");
  });

  it("should return base node RPC URL for base-sepolia network", async () => {
    vi.spyOn(cdpApiClient, "config", "get").mockReturnValue({
      apiKeyId: mockApiKeyId,
      apiKeySecret: mockApiKeySecret,
      basePath: mockBasePath,
    } as any);

    (generateJwt as any).mockResolvedValue(mockJwt);
    (global.fetch as any).mockResolvedValue({
      json: async () => ({ id: mockTokenId }),
    });

    const result = await getBaseNodeRpcUrl("base-sepolia");

    expect(result).toBe("https://api.cdp.coinbase.com/rpc/v1/base-sepolia/token-123-abc");
  });

  it("should return undefined when config is not available", async () => {
    vi.spyOn(cdpApiClient, "config", "get").mockReturnValue(undefined);

    const result = await getBaseNodeRpcUrl("base");

    expect(result).toBeUndefined();
    expect(generateJwt).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should return undefined when JWT generation fails", async () => {
    vi.spyOn(cdpApiClient, "config", "get").mockReturnValue({
      apiKeyId: mockApiKeyId,
      apiKeySecret: mockApiKeySecret,
      basePath: mockBasePath,
    } as any);

    (generateJwt as any).mockRejectedValue(new Error("JWT generation failed"));

    const result = await getBaseNodeRpcUrl("base");

    expect(result).toBeUndefined();
  });

  it("should return undefined when fetch fails", async () => {
    vi.spyOn(cdpApiClient, "config", "get").mockReturnValue({
      apiKeyId: mockApiKeyId,
      apiKeySecret: mockApiKeySecret,
      basePath: mockBasePath,
    } as any);

    (generateJwt as any).mockResolvedValue(mockJwt);
    (global.fetch as any).mockRejectedValue(new Error("Network error"));

    const result = await getBaseNodeRpcUrl("base");

    expect(result).toBeUndefined();
  });

  it("should return undefined when JSON parsing fails", async () => {
    vi.spyOn(cdpApiClient, "config", "get").mockReturnValue({
      apiKeyId: mockApiKeyId,
      apiKeySecret: mockApiKeySecret,
      basePath: mockBasePath,
    } as any);

    (generateJwt as any).mockResolvedValue(mockJwt);
    (global.fetch as any).mockResolvedValue({
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    const result = await getBaseNodeRpcUrl("base");

    expect(result).toBeUndefined();
  });

  it("should handle basePath without trailing slash", async () => {
    vi.spyOn(cdpApiClient, "config", "get").mockReturnValue({
      apiKeyId: mockApiKeyId,
      apiKeySecret: mockApiKeySecret,
      basePath: "https://api.cdp.coinbase.com/platform",
    } as any);

    (generateJwt as any).mockResolvedValue(mockJwt);
    (global.fetch as any).mockResolvedValue({
      json: async () => ({ id: mockTokenId }),
    });

    const result = await getBaseNodeRpcUrl("base");

    expect(result).toBe("https://api.cdp.coinbase.com/rpc/v1/base/token-123-abc");
  });
});