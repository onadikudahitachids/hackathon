const { createApiClient } = require("./request");
const { fetchAuthToken, clearAuthCache } = require("./auth");
const { getBaseUrl, getAuthTokenUrl } = require("./env");

async function setupApiTestContext(startMockApiServer) {
  const api = await startMockApiServer();
  const baseUrl = getBaseUrl(api.baseUrl);
  const authTokenUrl = getAuthTokenUrl(`${api.baseUrl}/auth/token`);
  clearAuthCache();
  return { api, baseUrl, authTokenUrl };
}

function createClient(request, baseUrl) {
  return createApiClient({ request, baseUrl });
}

async function getBearerToken(request, tokenUrl) {
  const token = await fetchAuthToken({ request, tokenUrl });
  return `Bearer ${token}`;
}

module.exports = {
  setupApiTestContext,
  createClient,
  getBearerToken,
};
