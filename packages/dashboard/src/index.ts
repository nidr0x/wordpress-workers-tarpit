import { getDashboardHtml } from "./ui.js";

export interface Env {
  TARPIT_DB: {
    prepare: (query: string) => any;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/stats") {
      return handleApiStats(env);
    }

    if (url.pathname === "/api/recent") {
      return handleApiRecent(env, url);
    }

    if (url.pathname === "/api/sites") {
      return handleApiSites(env);
    }

    // Serve HTML dashboard
    return new Response(getDashboardHtml(), {
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  },
};

async function handleApiStats(env: Env): Promise<Response> {
  if (!env.TARPIT_DB || typeof env.TARPIT_DB.prepare !== "function") {
    return Response.json(
      { error: "TARPIT_DB binding not configured or available." },
      { status: 500 }
    );
  }

  try {
    const queries = await Promise.all([
      env.TARPIT_DB.prepare("SELECT COUNT(*) as total FROM tarpit_log").first("total"),
      env.TARPIT_DB.prepare("SELECT COUNT(DISTINCT ip) as unique_ips FROM tarpit_log").first("unique_ips"),
      env.TARPIT_DB.prepare("SELECT COUNT(DISTINCT site) as sites FROM tarpit_log").first("sites"),
      env.TARPIT_DB.prepare("SELECT type, COUNT(*) as count FROM tarpit_log GROUP BY type ORDER BY count DESC").all(),
      env.TARPIT_DB.prepare("SELECT DATE(ts) as day, COUNT(*) as count FROM tarpit_log WHERE ts >= datetime('now', '-30 days') GROUP BY DATE(ts) ORDER BY day").all(),
      env.TARPIT_DB.prepare("SELECT site, COUNT(*) as count FROM tarpit_log GROUP BY site ORDER BY count DESC LIMIT 20").all(),
      env.TARPIT_DB.prepare("SELECT ip, COUNT(*) as count FROM tarpit_log GROUP BY ip ORDER BY count DESC LIMIT 20").all(),
      env.TARPIT_DB.prepare("SELECT path, COUNT(*) as count FROM tarpit_log GROUP BY path ORDER BY count DESC LIMIT 20").all(),
      env.TARPIT_DB.prepare(`
        SELECT
          SUM(CASE WHEN type IN ('env','git','xmlrpc','wp-probe','probe') THEN 15
                    WHEN type = 'login' THEN 12
                    WHEN type = 'login-submit' THEN 10
                    WHEN type = 'admin' THEN 5
                    ELSE 8 END) as wasted_seconds
        FROM tarpit_log
      `).first("wasted_seconds"),
      env.TARPIT_DB.prepare("SELECT COUNT(*) as today FROM tarpit_log WHERE ts >= datetime('now', '-24 hours')").first("today"),
      env.TARPIT_DB.prepare("SELECT MIN(ts) as first_log FROM tarpit_log").first("first_log"),
      env.TARPIT_DB.prepare("SELECT country, COUNT(*) as count FROM tarpit_log GROUP BY country ORDER BY count DESC LIMIT 15").all(),
      env.TARPIT_DB.prepare("SELECT data FROM tarpit_log WHERE type = 'login-submit' ORDER BY id DESC LIMIT 500").all()
    ]);

    // Parse and redact credentials securely on the server side
    const credCounts: Record<string, number> = {};
    const credRows = (queries[12]?.results || []) as Array<{ data: string }>;
    
    credRows.forEach((row) => {
      try {
        const parsed = JSON.parse(row.data);
        const u = (parsed.u || "").substring(0, 30);
        const p = (parsed.p || "");
        if (u || p) {
          const redactedPassword = p.length > 2 
            ? p.substring(0, 2) + "*".repeat(Math.min(p.length - 2, 8)) 
            : "*".repeat(p.length || 4);
          
          const key = JSON.stringify({ u, p: redactedPassword });
          credCounts[key] = (credCounts[key] || 0) + 1;
        }
      } catch {
        // Suppress JSON parse errors
      }
    });

    const credentialsList = Object.entries(credCounts)
      .map(([k, count]) => {
        const parsed = JSON.parse(k);
        return { username: parsed.u, password: parsed.p, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return Response.json({
      total: queries[0] ?? 0,
      unique_ips: queries[1] ?? 0,
      sites: queries[2] ?? 0,
      by_type: queries[3]?.results || [],
      by_day: queries[4]?.results || [],
      top_sites: queries[5]?.results || [],
      top_ips: queries[6]?.results || [],
      top_paths: queries[7]?.results || [],
      wasted_seconds: queries[8] ?? 0,
      today: queries[9] ?? 0,
      first_log: queries[10] ?? null,
      by_country: queries[11]?.results || [],
      credentials: credentialsList
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function handleApiRecent(env: Env, url: URL): Promise<Response> {
  if (!env.TARPIT_DB || typeof env.TARPIT_DB.prepare !== "function") {
    return Response.json({ error: "TARPIT_DB binding not configured." }, { status: 500 });
  }

  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
  const site = url.searchParams.get("site");

  try {
    let results;
    if (site) {
      results = await env.TARPIT_DB.prepare(
        "SELECT * FROM tarpit_log WHERE site = ? ORDER BY ts DESC LIMIT ?"
      )
        .bind(site, limit)
        .all();
    } else {
      results = await env.TARPIT_DB.prepare(
        "SELECT * FROM tarpit_log ORDER BY ts DESC LIMIT ?"
      )
        .bind(limit)
        .all();
    }
    return Response.json(results?.results || []);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function handleApiSites(env: Env): Promise<Response> {
  if (!env.TARPIT_DB || typeof env.TARPIT_DB.prepare !== "function") {
    return Response.json({ error: "TARPIT_DB binding not configured." }, { status: 500 });
  }

  try {
    const results = await env.TARPIT_DB.prepare(`
      SELECT site, COUNT(*) as total,
             COUNT(DISTINCT ip) as unique_ips,
             MAX(ts) as last_hit
      FROM tarpit_log GROUP BY site ORDER BY total DESC
    `).all();
    return Response.json(results?.results || []);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
