import { TarpitOptions } from "./types.js";

export const DEFAULT_BOT_PATHS = [
  "/wp-login.php", "/wp-admin", "/wp-admin/", "/wp-includes/", "/wp-content/",
  "/wp-config.php", "/wp-config.bak", "/wp-json/", "/xmlrpc.php",
  "/.env", "/.env.bak", "/.env.local", "/.env.production", "/.env.example",
  "/.env.test", "/.env.dev", "/.env.development",
  "/.git/config", "/.git/HEAD", "/.DS_Store",
  "/.aws/credentials", "/.kube/config",
  "/admin/", "/administrator/", "/admin.php", "/login", "/login.php",
  "/phpmyadmin/", "/pma/", "/myadmin/",
  "/config.php", "/configuration.php", "/settings.php", "/config.json",
  "/backup.sql", "/dump.sql", "/database.sql", "/db.sql",
  "/backup.zip", "/backup.tar.gz", "/backup.tar", "/archive.zip", "/site.zip",
  "/server-status", "/server-info", "/.htaccess", "/.htpasswd",
  "/cgi-bin/", "/shell.php", "/cmd.php", "/eval.php",
  "/vendor/phpunit/", "/solr/", "/actuator/", "/api/v1/debug",
  "/actuator/health", "/actuator/env", "/actuator/prometheus",
  "/docker-compose.yml", "/docker-compose.yaml",
  "/wp-includes/wlwmanifest.xml", "/api/swagger-ui.html", "/swagger-ui/",
  "/v2/api-docs", "/wordpress/", "/blog/wp-login.php", "/user/login"
];

export const DEFAULT_BAD_USER_AGENTS = [
  "sqlmap", "nikto", "nmap", "dirbuster", "gobuster", "nuclei",
  "masscan", "zgrab", "python-requests", "curldetect", "mj12bot",
  "semrushbot", "ahrefsbot", "dotbot", "rogerbot"
];

export const DEFAULT_USER_AGENT_WHITELIST = [
  "googlebot", "bingbot", "yandexbot", "duckduckgo", "baiduspider",
  "facebot", "ia_archiver", "twitterbot", "linkedinbot", "google-hosted"
];

/**
 * Checks if a request matches a bot signature or target path.
 * Returns the classification type if it's a bot request, or null if legitimate.
 */
export function classifyBotRequest(
  request: Request,
  options: TarpitOptions
): { isBot: boolean; type: string } {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();
  const ua = (request.headers.get("user-agent") || "").toLowerCase();

  // 1. Check user-agent whitelist to avoid trapping real search engine bots
  const whitelisted = (options.userAgentWhitelist || DEFAULT_USER_AGENT_WHITELIST).some(
    (w) => ua.includes(w)
  );
  if (whitelisted) {
    return { isBot: false, type: "" };
  }

  // 2. User agent checks
  const badUaList = options.badUserAgents || DEFAULT_BAD_USER_AGENTS;
  const isBadUa = badUaList.some((b) => ua.includes(b));

  if (isBadUa && options.enableUserAgentTrap) {
    return { isBot: true, type: "bad-user-agent" };
  }

  // 3. Bot path matches
  const paths = options.botPaths || DEFAULT_BOT_PATHS;
  const additionalPaths = options.additionalBotPaths || [];
  const allBotPaths = [...paths, ...additionalPaths];

  // Specific prefix checks
  const matchesPath = allBotPaths.some(
    (p) => path === p.toLowerCase() || path.startsWith(p.toLowerCase())
  );

  // WordPress specific patterns
  const isWp = path.startsWith("/wp-");

  // Generic SQL, backup, shell probes that should always be intercepted
  const isGenericProbe =
    path.endsWith(".sql") ||
    path.endsWith(".bak") ||
    path.endsWith(".tgz") ||
    path.endsWith(".tar.gz") ||
    path.includes("phpmyadmin") ||
    path.includes("shell.php") ||
    path.includes("cmd.php") ||
    path.includes("eval.php");

  if (matchesPath || isWp || isBadUa || isGenericProbe) {
    // Determine granular type for D1 logging
    if (path === "/wp-login.php" || path === "/wp-login.php/") {
      return { isBot: true, type: "login" };
    }
    if (path === "/wp-admin/admin-ajax.php") {
      return { isBot: true, type: "ajax" };
    }
    if (path.startsWith("/wp-admin")) {
      return { isBot: true, type: "admin" };
    }
    if (path.startsWith("/.env")) {
      return { isBot: true, type: "env" };
    }
    if (path.startsWith("/.git")) {
      return { isBot: true, type: "git" };
    }
    if (path === "/xmlrpc.php") {
      return { isBot: true, type: "xmlrpc" };
    }
    if (isWp) {
      return { isBot: true, type: "wp-probe" };
    }
    if (isBadUa) {
      return { isBot: true, type: "bad-user-agent" };
    }

    // Generic SQL, backup, shell, admin probes
    if (
      path.endsWith(".sql") ||
      path.endsWith(".bak") ||
      path.endsWith(".zip") ||
      path.endsWith(".tar.gz") ||
      path.includes("config") ||
      path.includes("admin") ||
      path.includes("phpmyadmin") ||
      path.includes("shell") ||
      path.includes("eval")
    ) {
      return { isBot: true, type: "probe" };
    }

    return { isBot: true, type: "other" };
  }

  return { isBot: false, type: "" };
}
