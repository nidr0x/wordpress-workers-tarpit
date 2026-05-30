# WordPress Workers Tarpit

This package blocks and traps malicious bots or vulnerability scanners searching for sensitive endpoints on your Cloudflare Workers site (like `/wp-login.php`, `/.env`, or `/.git/config`). Instead of returning a fast 404, it traps them by streaming responses extremely slowly or sending compressed data that overloads their memory.

## How it works

Legitimate traffic (including whitelisted search engines like Googlebot) passes through untouched. When a request matches a known bot path or a bad user-agent, the trap triggers:

*   **GZIP Bomb**: If the scanner accepts gzip/deflate, we stream compressed zero-bytes. On the bot's side, this expands to 10MB+ in memory, which usually crashes the scanner script or freezes its process.
*   **Slow Drip**: If they don't accept compression, we stream the response extremely slowly (e.g. 3 bytes every ~250ms). This hangs the connection and wastes the scanner's time.
*   **Fake Panels**: Accessing `/wp-admin` fakes a realistic admin dashboard with infinite navigation loops. Probing `/wp-login.php` fakes a real WordPress login page that intercepts form submissions, adds random delays of 5 to 15 seconds, and returns randomized error messages.

---

## Installation

Install the library package:

```bash
npm install wordpress-workers-tarpit
```

---

## Usage

Call the trap handler at the top of your Worker's `fetch` handler:

```typescript
import { tarpit } from "wordpress-workers-tarpit";

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    // Check if the request is a bot probe and trap it if so
    const trap = tarpit(request, env, ctx, {
      enableGzipBomb: true,
      slowDripMode: "exponential"
    });
    
    if (trap) return trap;

    // Your normal website logic goes here
    return new Response("Hello World");
  }
};
```

---

## Settings

You can customize the trap behavior by passing an options object:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `botPaths` | `string[]` | *Default list* | Replaces the default target paths list. |
| `additionalBotPaths` | `string[]` | `[]` | Appends custom paths to the bot list. |
| `badUserAgents` | `string[]` | *Default list* | Custom substrings for blocking known scanners (e.g., `sqlmap`). |
| `userAgentWhitelist` | `string[]` | *Default list* | User-agents that should never be trapped (e.g., `googlebot`). |
| `enableUserAgentTrap` | `boolean` | `false` | If true, blocks bad user-agents immediately on all pages. |
| `slowDripChunkSize` | `number` | `3` | Number of bytes to send at a time in slow drip. |
| `slowDripMinDelay` | `number` | `100` | Minimum delay (ms) between sent chunks. |
| `slowDripMaxDelay` | `number` | `500` | Maximum delay (ms) between sent chunks. |
| `slowDripMode` | `'constant'\|'random'\|'exponential'` | `'random'` | Delay distribution ('exponential' gets slower over time). |
| `enableGzipBomb` | `boolean` | `true` | Serves a compression bomb to bots accepting gzip/deflate. |
| `gzipBombSizeMb` | `number` | `10` | Size of the decompressed zeros payload in MB. |
| `d1BindingName` | `string` | `'TARPIT_DB'` | The binding name in your env for D1 logging database. |

---

## Telemetry & Logging (Optional)

If you bind a Cloudflare D1 database, the tarpit will log all blocked scans in the background.

### 1. Database Setup
Create the database and apply the schema:
```bash
npx wrangler d1 create tarpit-logs
npx wrangler d1 execute tarpit-logs --remote --file=schema.sql
```

### 2. Configure Wrangler
Add the binding to your `wrangler.jsonc` (or `wrangler.toml`):
```jsonc
"d1_databases": [
  {
    "binding": "TARPIT_DB",
    "database_name": "tarpit-logs",
    "database_id": "<your-database-id-here>"
  }
]
```

---

## Analytics Dashboard

The project includes an optional, standalone analytics dashboard Worker. It queries the logs database to show total trapped requests, unique IPs, countries (via Cloudflare's GeoIP headers), and redacted lists of passwords bots tried on your fake login form.

To deploy it:
1.  Go to `packages/dashboard`.
2.  Open `wrangler.jsonc` and paste your D1 `database_id`.
3.  Run `npx wrangler deploy`.

---

## FAQ

#### Will this affect real users or search ranking?
No. The trap only triggers on paths real users never visit (like `/wp-login.php` or `/.env`). Legitimate search crawlers (like Googlebot) are whitelisted, meaning they won't get stuck.

#### Does the GZIP bomb use high server memory?
No. We generate zero-bytes inside a streaming generator in 64KB increments. The Worker uses almost no RAM, but the bot is forced to expand the compressed stream to 10MB+ in its memory, which crashes the scanner client.

#### Does the slow-drip exhaust Worker CPU time?
No. Delays use asynchronous timers (`setTimeout` inside the readable stream). The connection is held open on the Cloudflare edge, meaning your Worker isn't billed for CPU cycles during the wait time.
