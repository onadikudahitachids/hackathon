function getBaseUrl(fallback) {
  return process.env.BASE_URL || fallback;
}

function getAuthTokenUrl(fallback) {
  return process.env.AUTH_TOKEN_URL || fallback;
}

module.exports = {
  getBaseUrl,
  getAuthTokenUrl,
};
