function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildUserPayload() {
  const suffix = uniqueSuffix();
  return {
    name: `Test User ${suffix}`,
    email: `user.${suffix}@mail.test`,
  };
}

module.exports = {
  buildUserPayload,
};
