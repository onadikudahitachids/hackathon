const { test, expect } = require("@playwright/test");
const { createPartnerServiceTestContext } = require("../helpers/serviceTestFactory");

test.describe("partnerService.postToPartnerService", () => {
  test("adds authorization header for non-Team14 environments", async () => {
    // Arrange
    const postCalls = [];
    const fakeAxios = {
      post: async (...args) => {
        postCalls.push(args);
        return { status: 201, data: { ok: true } };
      },
    };
    const { partnerService, requestUrl } = createPartnerServiceTestContext({ env: "dev", fakeAxios });
    const payload = { partner: { customName: "District 1" } };
    const token = "token-123";

    // Act
    const response = await partnerService.postToPartnerService(requestUrl, payload, token);

    // Assert
    expect(response.status).toBe(201);
    expect(postCalls).toHaveLength(1);
    expect(postCalls[0][0]).toBe(requestUrl);
    expect(postCalls[0][2].headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer token-123",
    });
  });

  test("does not add authorization header in Team14", async () => {
    // Arrange
    const postCalls = [];
    const fakeAxios = {
      post: async (...args) => {
        postCalls.push(args);
        return { status: 200, data: { id: "abc" } };
      },
    };
    const { partnerService, requestUrl } = createPartnerServiceTestContext({ env: "Team14", fakeAxios });

    // Act
    await partnerService.postToPartnerService(requestUrl, { id: 1 }, "ignored-token");

    // Assert
    expect(postCalls[0][2].headers).toEqual({
      "Content-Type": "application/json",
    });
  });

  test("propagates upstream failures (edge case: network failure)", async () => {
    // Arrange
    const fakeAxios = {
      post: async () => {
        throw new Error("socket hang up");
      },
    };
    const { partnerService, requestUrl } = createPartnerServiceTestContext({ env: "qa", fakeAxios });

    // Act + Assert
    await expect(
      partnerService.postToPartnerService(requestUrl, { name: "x" }, "token-1"),
    ).rejects.toThrow("socket hang up");
  });
});
