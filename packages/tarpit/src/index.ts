import { TarpitOptions, Env, Context, TarpitLogEntry } from "./types.js";
import { classifyBotRequest } from "./config.js";
import { slowDripResponse } from "./handlers/drip.js";
import { compressionBombResponse, acceptsCompression } from "./handlers/bomb.js";
import { wpLoginPage, wpAdminPage, fakeEnvContent } from "./handlers/wordpress.js";

/**
 * Logs a trapped bot attempt into the bound D1 database asynchronously.
 */
async function logAttempt(
  env: Env,
  type: string,
  path: string,
  data: Record<string, any>,
  request: Request,
  options: TarpitOptions
): Promise<void> {
  const dbBinding = options.d1BindingName ?? "TARPIT_DB";
  const db = env[dbBinding];
  if (!db || typeof db.prepare !== "function") {
    return; // D1 database not bound or unavailable
  }

  try {
    const url = new URL(request.url);
    const host = url.hostname;
    const method = request.method;
    const country = request.headers.get("cf-ipcountry") || "XX";
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const ua = request.headers.get("user-agent") || "";
    const redactedData = JSON.stringify(data).substring(0, 500);

    await db.prepare(
      `INSERT INTO tarpit_log (site, type, path, method, country, ip, ua, data, ts)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      host,
      type,
      path.substring(0, 250),
      method,
      country,
      ip,
      ua.substring(0, 300),
      redactedData
    ).run();
  } catch (e) {
    // Fail silently (e.g. database schema is not initialized yet)
  }
}

/**
 * Main bot trap handler. Call this at the very top of your Worker's fetch handler.
 * Returns a Response if the request is identified as a bot probe,
 * or null if it's a legitimate user request.
 *
 * @param request The incoming Request object
 * @param env The environment bindings (e.g., env.TARPIT_DB)
 * @param ctx The ExecutionContext (used for async non-blocking logs via waitUntil)
 * @param options Custom options to override defaults
 */
export function tarpit(
  request: Request,
  env: Env,
  ctx?: Context,
  options: TarpitOptions = {}
): Response | null {
  const { isBot, type } = classifyBotRequest(request, options);
  if (!isBot) {
    return null; // Let legitimate traffic pass through
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const host = url.hostname;
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const useBomb = options.enableGzipBomb !== false && acceptsCompression(request) !== null;

  // 1. WordPress Login Form (GET wp-login.php)
  if (path === "/wp-login.php" || path === "/wp-login.php/") {
    if (request.method === "GET") {
      const logPromise = logAttempt(env, type, path, {}, request, options);
      if (ctx?.waitUntil) ctx.waitUntil(logPromise);

      return new Response(wpLoginPage(host), {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          "X-Powered-By": "PHP/8.2.13",
          "Server": "Apache/2.4.57",
        },
      });
    }
  }

  // 2. WP AJAX credentials capture (POST admin-ajax.php)
  if (path === "/wp-admin/admin-ajax.php" && request.method === "POST") {
    // Read credentials asynchronously and log
    const logPromise = (async () => {
      let credentials = {};
      try {
        credentials = await request.json() as Record<string, any>;
      } catch {
        // No valid JSON sent
      }
      await logAttempt(env, "login-submit", path, credentials, request, options);
    })();

    if (ctx?.waitUntil) ctx.waitUntil(logPromise);

    return slowDripResponse(
      '{"success":false,"data":{"message":"Invalid username or password."}}',
      "application/json",
      options
    );
  }

  // 3. WordPress Admin Maze (/wp-admin/*)
  if (path.startsWith("/wp-admin")) {
    const logPromise = logAttempt(env, "admin", path, {}, request, options);
    if (ctx?.waitUntil) ctx.waitUntil(logPromise);

    return new Response(wpAdminPage(path, host), {
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "X-Powered-By": "PHP/8.2.13",
        "Server": "Apache/2.4.57",
      },
    });
  }

  // 4. .env Probes (/.env*)
  if (path.startsWith("/.env")) {
    const logPromise = logAttempt(env, "env", path, {}, request, options);
    if (ctx?.waitUntil) ctx.waitUntil(logPromise);

    if (useBomb) {
      return compressionBombResponse(request, options);
    }
    return slowDripResponse(fakeEnvContent(), "text/plain", options);
  }

  // 5. Git Probes (/.git*)
  if (path.startsWith("/.git")) {
    const logPromise = logAttempt(env, "git", path, {}, request, options);
    if (ctx?.waitUntil) ctx.waitUntil(logPromise);

    if (useBomb) {
      return compressionBombResponse(request, options);
    }
    const fakeGitConfig = `[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n[remote "origin"]\n\turl = git@github.com:internal/production-app-repo.git\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n[branch "main"]\n\tremote = origin\n\tmerge = refs/heads/main\n`;
    return slowDripResponse(fakeGitConfig, "text/plain", options);
  }

  // 6. XML-RPC XML requests (/xmlrpc.php)
  if (path === "/xmlrpc.php") {
    const logPromise = logAttempt(env, "xmlrpc", path, {}, request, options);
    if (ctx?.waitUntil) ctx.waitUntil(logPromise);

    const fakeXmlFault = `<?xml version="1.0" encoding="UTF-8"?>\n<methodResponse>\n  <fault>\n    <value>\n      <struct>\n        <member><name>faultCode</name><value><int>403</int></value></member>\n        <member><name>faultString</name><value><string>XML-RPC services are disabled on this site.</string></value></member>\n      </struct>\n    </value>\n  </fault>\n</methodResponse>`;
    return slowDripResponse(fakeXmlFault, "text/xml", options);
  }

  // 7. Generic WordPress Probes
  if (path.startsWith("/wp-")) {
    const logPromise = logAttempt(env, "wp-probe", path, {}, request, options);
    if (ctx?.waitUntil) ctx.waitUntil(logPromise);

    if (useBomb) {
      return compressionBombResponse(request, options);
    }
    const fakeWpProbe = `<!DOCTYPE html><html><head><title>Loading...</title></head><body><p>Please wait...</p></body></html>`;
    return slowDripResponse(fakeWpProbe, "text/html", options);
  }

  // 8. General Database, Admin, Backups, Shell Probes
  const logPromise = logAttempt(env, type, path, {}, request, options);
  if (ctx?.waitUntil) ctx.waitUntil(logPromise);

  if (useBomb) {
    return compressionBombResponse(request, options);
  }

  const accessDeniedMsg = `Access denied.\n\nThis incident has been logged and reported.\nYour IP: ${ip}\n`;
  return slowDripResponse(accessDeniedMsg, "text/plain", options);
}
