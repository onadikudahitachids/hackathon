const http = require("http");

async function startMockApiServer() {
  const requestCounts = {
    rateLimit: 0,
  };

  const server = http.createServer((req, res) => {
    if (req.url === "/auth/token" && req.method === "POST") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          access_token: "mock-token",
          expires_in: 60,
          token_type: "Bearer",
        }),
      );
      return;
    }

    if (req.url === "/health" && req.method === "GET") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok", uptime: 1234 }));
      return;
    }

    if (req.url === "/users" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        let parsed;
        try {
          parsed = body ? JSON.parse(body) : {};
        } catch (e) {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: "invalid_json" }));
          return;
        }

        if (!parsed.email) {
          res.writeHead(422, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: "email_required" }));
          return;
        }

        if (typeof parsed.email !== "string" || !parsed.email.includes("@")) {
          res.writeHead(422, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: "email_invalid_format" }));
          return;
        }

        res.writeHead(201, { "content-type": "application/json" });
        res.end(JSON.stringify({ id: "u-1", ...parsed }));
      });
      return;
    }

    if (req.url === "/secure/resource" && req.method === "GET") {
      const authHeader = req.headers.authorization || "";
      if (!authHeader) {
        res.writeHead(401, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "missing_token" }));
        return;
      }
      if (authHeader !== "Bearer mock-token") {
        res.writeHead(403, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "invalid_token" }));
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ role: "admin", scope: "read:secure" }));
      return;
    }

    if (req.url === "/empty" && req.method === "GET") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/rate-limit" && req.method === "GET") {
      requestCounts.rateLimit += 1;
      if (requestCounts.rateLimit > 2) {
        res.writeHead(429, { "content-type": "application/json", "retry-after": "1" });
        res.end(JSON.stringify({ error: "too_many_requests" }));
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ message: "ok", count: requestCounts.rateLimit }));
      return;
    }

    if (req.url === "/users/timeout" && req.method === "GET") {
      setTimeout(() => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ status: "late" }));
      }, 1500);
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: () => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

module.exports = {
  startMockApiServer,
};
