const { test, expect } = require("@playwright/test");
const { startMockApiServer } = require("../helpers/mockApiServer");
const { setupApiTestContext, createClient, getBearerToken } = require("../helpers/apiTestContext");
const { buildUserPayload } = require("../helpers/dataFactory");
const { assertStatusAndError, assertSuccessUserResponse } = require("../helpers/assertions");

test.describe("API contract and edge cases", () => {
  let api;
  let baseUrl;
  let authTokenUrl;

  test.beforeAll(async () => {
    // Arrange
    const context = await setupApiTestContext(startMockApiServer);
    api = context.api;
    baseUrl = context.baseUrl;
    authTokenUrl = context.authTokenUrl;
  });

  test.afterAll(async () => {
    await api.close();
  });

  test("GET /health returns service metadata", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);

    // Act
    const response = await client.get("/health");

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.objectContaining({
        status: "ok",
        uptime: expect.any(Number),
      }),
    );
  });

  test("POST /users returns 422 when email is missing", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);
    const invalidPayload = { name: "NoEmail User" };

    // Act
    const response = await client.post("/users", {
      data: invalidPayload,
      expectOk: false,
    });

    // Assert
    assertStatusAndError(response, 422, "email_required");
  });

  test("POST /users creates user for valid payload", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);
    const payload = buildUserPayload();

    // Act
    const response = await client.post("/users", { data: payload });

    // Assert
    assertSuccessUserResponse(response, payload);
    expect(response.data.email.includes("@")).toBeTruthy();
  });

  test("POST /users returns 422 for invalid email format", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);

    // Act
    const response = await client.post("/users", {
      data: { name: "Invalid Email", email: "invalid-email" },
      expectOk: false,
    });

    // Assert
    assertStatusAndError(response, 422, "email_invalid_format");
  });

  test("GET secure endpoint returns 401 without token", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);

    // Act
    const response = await client.get("/secure/resource", { expectOk: false });

    // Assert
    assertStatusAndError(response, 401, "missing_token");
  });

  test("GET secure endpoint returns 403 with invalid token", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);

    // Act
    const response = await client.get("/secure/resource", {
      headers: { Authorization: "Bearer wrong-token" },
      expectOk: false,
    });

    // Assert
    assertStatusAndError(response, 403, "invalid_token");
  });

  test("GET secure endpoint succeeds with fetched auth token", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);
    const bearerToken = await getBearerToken(request, authTokenUrl);

    // Act
    const response = await client.get("/secure/resource", {
      headers: { Authorization: bearerToken },
    });

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      role: "admin",
      scope: "read:secure",
    });
  });

  test("GET empty endpoint returns 204 and no body", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);

    // Act
    const response = await client.get("/empty");

    // Assert
    expect(response.status).toBe(204);
    expect(response.rawText).toBe("");
  });

  test("GET unknown endpoint returns 404 (edge case: route typo)", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);

    // Act
    const response = await client.get("/missing-endpoint", { expectOk: false });

    // Assert
    assertStatusAndError(response, 404, "not_found");
  });

  test("GET /users/timeout supports timeout handling (slow backend)", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);

    // Act
    const response = await client.get("/users/timeout", { timeout: 3000 });

    // Assert
    expect(response.status).toBe(200);
    expect(response.elapsedMs).toBeGreaterThanOrEqual(1400);
    expect(response.data.status).toBe("late");
  });

  test("GET /rate-limit returns 429 after threshold", async ({ request }) => {
    // Arrange
    const client = createClient(request, baseUrl);

    // Act
    const first = await client.get("/rate-limit");
    const second = await client.get("/rate-limit");
    const third = await client.get("/rate-limit", { expectOk: false });

    // Assert
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
    expect(third.data.error).toBe("too_many_requests");
    expect(third.headers["retry-after"]).toBe("1");
  });
});
