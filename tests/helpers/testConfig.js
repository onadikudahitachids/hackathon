const path = require("path");
const fs = require("fs");

function createTempConfig(options = {}) {
  const baseConfig = {
    env: "Team14",
    pyron: {
      clientId: "cid",
      clientSecret: "secret",
      tokenUrl: "https://auth.local/token",
      coloGatewayUrl: "https://gateway.local",
    },
    scriptConfig: {
      EDITED_BY_LABEL: "onboarding-script",
    },
  };

  const merged = {
    ...baseConfig,
    ...options,
    pyron: { ...baseConfig.pyron, ...(options.pyron || {}) },
    scriptConfig: { ...baseConfig.scriptConfig, ...(options.scriptConfig || {}) },
  };

  const filename = `test-config-${Date.now()}-${Math.random().toString(36).slice(2)}.yml`;
  const filePath = path.join(process.cwd(), ".tmp", filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const yamlText = [
    `env: ${merged.env}`,
    "pyron:",
    `  clientId: ${merged.pyron.clientId}`,
    `  clientSecret: ${merged.pyron.clientSecret}`,
    `  tokenUrl: ${merged.pyron.tokenUrl}`,
    `  coloGatewayUrl: ${merged.pyron.coloGatewayUrl}`,
    "scriptConfig:",
    `  EDITED_BY_LABEL: ${merged.scriptConfig.EDITED_BY_LABEL}`,
  ].join("\n");

  fs.writeFileSync(filePath, yamlText, "utf8");
  return filePath;
}

function withArgvConfig(configPath, fn) {
  const originalArgv = [...process.argv];
  process.argv[2] = configPath;
  try {
    return fn();
  } finally {
    process.argv = originalArgv;
  }
}

module.exports = {
  createTempConfig,
  withArgvConfig,
};
