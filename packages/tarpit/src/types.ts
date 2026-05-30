/**
 * Configuration options for customising the Bot Tarpit.
 */
export interface TarpitOptions {
  /**
   * Override the list of paths classified as bot probes.
   * If provided, the default BOT_PATHS will be completely replaced.
   */
  botPaths?: string[];

  /**
   * Add custom bot paths to the default list of BOT_PATHS.
   */
  additionalBotPaths?: string[];

  /**
   * List of lowercase substrings in the User-Agent header that identify malicious crawlers.
   * Default includes: 'sqlmap', 'nikto', 'nmap', 'dirbuster', 'gobuster', 'nuclei', 'masscan', 'zgrab'
   */
  badUserAgents?: string[];

  /**
   * List of lowercase substrings in the User-Agent header that should NEVER be trapped.
   * Default includes: 'googlebot', 'bingbot', 'yandexbot', 'duckduckgo', 'baiduspider', 'facebot', 'ia_archiver', 'twitterbot'
   */
  userAgentWhitelist?: string[];

  /**
   * If true, requests with matching bad User-Agent strings will be trapped immediately,
   * even if they hit a legitimate path.
   * @default false
   */
  enableUserAgentTrap?: boolean;

  /**
   * Size of chunk (in bytes) streamed to the bot during slow-drip responses.
   * Smaller chunks mean more roundtrips and more time wasted.
   * @default 3
   */
  slowDripChunkSize?: number;

  /**
   * Minimum delay (in milliseconds) between slow-drip chunks.
   * @default 100
   */
  slowDripMinDelay?: number;

  /**
   * Maximum delay (in milliseconds) between slow-drip chunks.
   * @default 500
   */
  slowDripMaxDelay?: number;

  /**
   * Distribution of delays between chunks.
   * - 'constant': Exactly slowDripMinDelay.
   * - 'random': Uniformly distributed between min and max delay.
   * - 'exponential': Multiplies delay progressively over the connection lifetime to simulate timeouts.
   * @default 'random'
   */
  slowDripMode?: 'constant' | 'random' | 'exponential';

  /**
   * Enable serving highly compressed recursive GZIP bombs to clients accepting gzip/deflate encodings.
   * Overloads scanner client memory and CPU.
   * @default true
   */
  enableGzipBomb?: boolean;

  /**
   * Decompressed payload target size (in MB) for the compression bomb.
   * @default 10
   */
  gzipBombSizeMb?: number;

  /**
   * The environment binding name of the D1 Database used for logging.
   * @default 'TARPIT_DB'
   */
  d1BindingName?: string;
}

/**
 * Interface for the internal logging structure.
 */
export interface TarpitLogEntry {
  site: string;
  type: string;
  path: string;
  method: string;
  country: string;
  ip: string;
  ua: string;
  data: string;
}

/**
 * Cloudflare Worker environment shape.
 */
export interface Env {
  [key: string]: any;
}
export type Context = {
  waitUntil: (promise: Promise<any>) => void;
};
