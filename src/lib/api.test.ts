import { describe, it, expect, vi, afterEach } from "vitest";
import * as api from "./api";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("api client", () => {
  it("uses the same-origin proxy base path (CORS-safe)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ network_state: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    await api.fetchNetworkStatus(14);

    expect(fetchMock).toHaveBeenCalledWith("/api/backend/network-status?hour=14");
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(api.fetchHealth()).rejects.toThrow();
  });

  it("sends JSON bodies for mutations", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await api.resolveIncident("MOCK-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/backend/incidents/MOCK-1/resolve",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
