import { logger } from '../utils/logger.js';

let keepAliveInterval: NodeJS.Timeout | null = null;

export function resolveKeepAliveUrl(): string {
  const explicit = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL;
  if (explicit && explicit.trim().length > 0) {
    return explicit.trim().replace(/\/+$/, '') + '/';
  }

  // If local development without an external URL, ping local health endpoint
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || '3001';
    return `http://127.0.0.1:${port}/`;
  }

  // Default production URL on Render
  return 'https://cricverse-7nuc.onrender.com/';
}

export async function pingHealthEndpoint(targetUrl: string): Promise<{ success: boolean; status: number; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'CricVerse-KeepAlive-Worker/1.0',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(15_000), // 15-second timeout
    });

    const latencyMs = Date.now() - start;
    if (response.ok) {
      return { success: true, status: response.status, latencyMs };
    }

    const text = await response.text().catch(() => '');
    return {
      success: false,
      status: response.status,
      latencyMs,
      error: `HTTP ${response.status}: ${text.slice(0, 150)}`,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    return {
      success: false,
      status: 0,
      latencyMs,
      error: err?.message || String(err),
    };
  }
}

/**
 * Starts the automated keep-alive self-ping loop.
 * Runs every 9 minutes (540,000 ms) to keep Render Web Service active and prevent sleeping.
 */
export function startKeepAliveWorker(intervalMs: number = 9 * 60 * 1000): void {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }

  const targetUrl = resolveKeepAliveUrl();
  logger.info({ targetUrl, intervalMinutes: Math.round(intervalMs / 60000) }, 'Starting CricVerse Keep-Alive self-pinger (9min interval)');

  // Perform initial ping 15 seconds after startup
  setTimeout(async () => {
    const res = await pingHealthEndpoint(targetUrl);
    if (res.success) {
      logger.info({ targetUrl, latencyMs: res.latencyMs }, 'Initial keep-alive health ping successful');
    } else {
      logger.warn({ targetUrl, error: res.error }, 'Initial keep-alive health ping encountered an issue');
    }
  }, 15_000);

  // Set recurring 9-minute interval
  keepAliveInterval = setInterval(async () => {
    const res = await pingHealthEndpoint(targetUrl);
    if (res.success) {
      logger.info({ targetUrl, latencyMs: res.latencyMs }, 'Keep-alive self-ping successful (Render active 24/7)');
    } else {
      logger.warn({ targetUrl, error: res.error }, 'Keep-alive self-ping failed');
    }
  }, intervalMs);
}

export function stopKeepAliveWorker(): void {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    logger.info('Keep-alive worker stopped');
  }
}
