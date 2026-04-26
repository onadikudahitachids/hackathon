const { expect } = require("@playwright/test");

function assertStatusAndError(response, expectedStatus, expectedError) {
  expect(response.status).toBe(expectedStatus);
  expect(response.data).toEqual(
    expect.objectContaining({
      error: expectedError,
    }),
  );
}

function assertSuccessUserResponse(response, payload) {
  expect(response.status).toBe(201);
  expect(response.data).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      name: payload.name,
      email: payload.email,
    }),
  );
}

module.exports = {
  assertStatusAndError,
  assertSuccessUserResponse,
};
