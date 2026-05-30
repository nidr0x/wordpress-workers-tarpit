import { TarpitOptions } from "../types.js";

/**
 * Creates a streaming Response that slowly drips chunks of content to the client.
 * This holds the connection open, consuming bot resources while using virtually zero Worker CPU.
 */
export function slowDripResponse(
  content: string,
  contentType: string = "text/plain",
  options: TarpitOptions = {}
): Response {
  const chunkSize = options.slowDripChunkSize ?? 3;
  const minDelay = options.slowDripMinDelay ?? 100;
  const maxDelay = options.slowDripMaxDelay ?? 500;
  const mode = options.slowDripMode ?? "random";

  const encoder = new TextEncoder();
  const chunks: string[] = [];

  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.substring(i, i + chunkSize));
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Async IIFE to stream chunks sequentially with delays
  (async () => {
    try {
      let index = 0;
      for (const chunk of chunks) {
        await writer.write(encoder.encode(chunk));

        let delay = minDelay;
        if (mode === "random") {
          delay = minDelay + Math.random() * (maxDelay - minDelay);
        } else if (mode === "exponential") {
          // Progressively gets slower, simulating a degrading connection
          const baseDelay = minDelay + Math.random() * (maxDelay - minDelay);
          const multiplier = Math.min(1 + index * 0.01, 15); // Caps multiplier at 15x
          delay = baseDelay * multiplier;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        index++;
      }
    } catch {
      // Catch client disconnects or closed streams cleanly
    } finally {
      try {
        await writer.close();
      } catch {
        // Suppress errors if already closed
      }
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": contentType,
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Powered-By": "PHP/8.2.13",
      "Server": "Apache/2.4.57",
    },
  });
}
