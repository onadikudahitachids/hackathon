function loadFreshWithMocks(targetPath, mocks) {
  const resolvedTarget = require.resolve(targetPath);
  const mockEntries = Object.entries(mocks || {}).map(([key, value]) => [require.resolve(key), value]);

  const originalCache = new Map();
  for (const [resolvedMock, mockValue] of mockEntries) {
    originalCache.set(resolvedMock, require.cache[resolvedMock]);
    require.cache[resolvedMock] = {
      id: resolvedMock,
      filename: resolvedMock,
      loaded: true,
      exports: mockValue,
    };
  }

  delete require.cache[resolvedTarget];
  const loadedModule = require(resolvedTarget);

  for (const [resolvedMock] of mockEntries) {
    const original = originalCache.get(resolvedMock);
    if (original) {
      require.cache[resolvedMock] = original;
    } else {
      delete require.cache[resolvedMock];
    }
  }

  return loadedModule;
}

module.exports = {
  loadFreshWithMocks,
};
