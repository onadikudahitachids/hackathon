const { test, expect } = require("@playwright/test");
const { createPyronServiceTestContext } = require("../helpers/serviceTestFactory");

test.describe("pyronService.getPyronToken", () => {
  test("fetches token once and caches it for repeated calls", async () => {
    // Arrange
    let callCount = 0;
    const fakeAxios = {
      post: async () => {
        callCount += 1;
        return { data: { access_token: "cached-token" } };
      },
    };
    const { pyronService, config } = createPyronServiceTestContext({ fakeAxios });

    // Act
    const token1 = await pyronService.getPyronToken(config);
    const token2 = await pyronService.getPyronToken(config);

    // Assert
    expect(token1).toBe("cached-token");
    expect(token2).toBe("cached-token");
    expect(callCount).toBe(1);
  });

  test("returns empty string when provider response has no access token", async () => {
    // Arrange
    const fakeAxios = {
      post: async () => ({ data: {} }),
    };
    const { pyronService, config } = createPyronServiceTestContext({ fakeAxios });

    // Act
    const token = await pyronService.getPyronToken(config);

    // Assert
    expect(token).toBe("");
  });

  test("throws error on auth endpoint failures (edge case: 401/invalid credentials)", async () => {
    // Arrange
    const fakeAxios = {
      post: async () => {
        throw new Error("401 Unauthorized");
      },
    };
    const { pyronService, config } = createPyronServiceTestContext({ fakeAxios });

    // Act + Assert
    await expect(pyronService.getPyronToken(config)).rejects.toThrow("401 Unauthorized");
  });
});
