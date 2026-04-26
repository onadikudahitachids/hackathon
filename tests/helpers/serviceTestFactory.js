const path = require("path");
const { createTempConfig, withArgvConfig } = require("./testConfig");
const { loadFreshWithMocks } = require("./moduleLoader");
const { getBaseUrl, getAuthTokenUrl } = require("./env");

const axiosPath = path.join(process.cwd(), "utils", "axios.js");

function createPartnerServiceTestContext({ env = "dev", fakeAxios }) {
  const partnerServicePath = path.join(process.cwd(), "services", "services", "partnerService.js");
  const configPath = createTempConfig({ env });
  const partnerService = withArgvConfig(configPath, () =>
    loadFreshWithMocks(partnerServicePath, { [axiosPath]: fakeAxios }),
  );
  const requestUrl = `${getBaseUrl("http://127.0.0.1:3000")}/partners`;
  return { partnerService, requestUrl };
}

function createPyronServiceTestContext({ fakeAxios, configOverrides = {} }) {
  const pyronServicePath = path.join(process.cwd(), "services", "services", "pyronService.js");
  const pyronService = loadFreshWithMocks(pyronServicePath, { [axiosPath]: fakeAxios });
  const config = {
    pyron: {
      clientId: "cid",
      clientSecret: "secret",
      tokenUrl: getAuthTokenUrl("http://127.0.0.1:3000/auth/token"),
      ...(configOverrides.pyron || {}),
    },
  };
  return { pyronService, config };
}

module.exports = {
  createPartnerServiceTestContext,
  createPyronServiceTestContext,
};
