import { TarpitOptions } from "../types.js";

/**
 * Checks if the client request accepts compressed responses.
 */
export function acceptsCompression(request: Request): "gzip" | "deflate" | null {
  const acceptEncoding = request.headers.get("Accept-Encoding") || "";
  if (acceptEncoding.includes("gzip")) return "gzip";
  if (acceptEncoding.includes("deflate")) return "deflate";
  return null;
}

/**
 * Creates an on-the-fly generated compression bomb using minimal Worker RAM.
 * Generates an endless stream of zero bytes and pipes it through a native CompressionStream.
 * If a client decompresses it, it will expand to massive proportions in their local memory.
 */
export function compressionBombResponse(
  request: Request,
  options: TarpitOptions = {}
): Response {
  const method = acceptsCompression(request);
  if (!method) {
    // If client doesn't support compression, fall back to a simple slow-drip response.
    return new Response("Access denied.\n", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const targetSizeMb = options.gzipBombSizeMb ?? 10; // Default 10MB bomb
  const targetSizeBytes = targetSizeMb * 1024 * 1024;
  const chunkSize = 64 * 1024; // 64KB generator chunk

  let bytesSent = 0;

  // Stream generator: generates zeros chunk by chunk to avoid allocating 10MB in memory
  const stream = new ReadableStream({
    pull(controller) {
      if (bytesSent >= targetSizeBytes) {
        controller.close();
        return;
      }

      const remaining = targetSizeBytes - bytesSent;
      const currentChunkSize = Math.min(chunkSize, remaining);
      const chunk = new Uint8Array(currentChunkSize); // Array is automatically initialized to 0
      controller.enqueue(chunk);
      bytesSent += currentChunkSize;
    },
  });

  // Pipe the raw zeros through native Cloudflare compression
  const compressionStream = new CompressionStream(method);
  const compressedStream = stream.pipeThrough(compressionStream);

  return new Response(compressedStream, {
    status: 200,
    headers: {
      "Content-Encoding": method,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Powered-By": "PHP/8.2.13",
      "Server": "Apache/2.4.57",
    },
  });
}
