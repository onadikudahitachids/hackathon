let cachedToken = null;
let tokenExpiresAt = 0;

function clearAuthCache() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

async function fetchAuthToken({
  request,
  tokenUrl,
  clientId = process.env.CLIENT_ID || "test-client",
  clientSecret = process.env.CLIENT_SECRET || "test-secret",
  maxRetries = 2,
}) {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await request.post(tokenUrl, {
        data: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        },
      });
      const payload = await response.json();
      if (response.status() !== 200 || !payload.access_token) {
        throw new Error(`Token fetch failed with status ${response.status()}`);
      }

      cachedToken = payload.access_token;
      const expiresInSec = Number(payload.expires_in || 300);
      tokenExpiresAt = Date.now() + Math.max(1, expiresInSec - 10) * 1000;
      return cachedToken;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

module.exports = {
  fetchAuthToken,
  clearAuthCache,
};
