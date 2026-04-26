function createApiClient({ request, baseUrl, defaultHeaders = {} }) {
  async function send(method, path, options = {}) {
    const url = `${baseUrl}${path}`;
    const startedAt = Date.now();
    const response = await request[method](url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    const elapsedMs = Date.now() - startedAt;
    const textBody = await response.text();
    let jsonBody = null;
    try {
      jsonBody = textBody ? JSON.parse(textBody) : null;
    } catch (e) {
      jsonBody = null;
    }

    if (options.expectOk !== false && !response.ok()) {
      console.error(
        JSON.stringify(
          {
            message: "Request failed",
            method: method.toUpperCase(),
            url,
            requestData: options.data || null,
            status: response.status(),
            responseBody: jsonBody || textBody,
            elapsedMs,
          },
          null,
          2,
        ),
      );
    }

    return {
      status: response.status(),
      ok: response.ok(),
      headers: response.headers(),
      data: jsonBody,
      rawText: textBody,
      elapsedMs,
    };
  }

  return {
    get: (path, options) => send("get", path, options),
    post: (path, options) => send("post", path, options),
  };
}

module.exports = {
  createApiClient,
};
