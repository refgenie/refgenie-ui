import { validatePing } from './contract';
import type { PingResponse } from './contract';

/**
 * One probe of exactly one port — never a scan (D2): a public page
 * enumerating ports on the visitor's machine IS the attack this feature must
 * be distinguishable from, and Chrome's Local Network Access model multiplies
 * permission friction per distinct target.
 */

export const PROBE_TIMEOUT_MS = 1500;

export type ProbeResult =
  | { kind: 'connected'; ping: PingResponse; baseUrl: string }
  /** Something answered but it is not a refgenie we can talk to. */
  | { kind: 'unsupported'; reason: 'wrong-service' | 'unsupported-version' | 'missing-ping' }
  /**
   * The fetch rejected. Browsers collapse mixed-content blocks, LNA
   * permission denials, CORS rejections and connection-refused into an opaque
   * `TypeError: Failed to fetch` — the UI must present ALL real causes, not
   * pretend to know which one occurred.
   */
  | { kind: 'unreachable' };

export const localBaseUrl = (port: number): string => `http://localhost:${port}`;

export const probeLocal = async (
  port: number,
  fetchImpl: typeof fetch = fetch,
): Promise<ProbeResult> => {
  const baseUrl = localBaseUrl(port);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    // credentials omitted and NO custom headers: the probe must stay a CORS
    // *simple* request so detection never depends on a preflight succeeding.
    const response = await fetchImpl(`${baseUrl}/ping`, {
      credentials: 'omit',
      signal: controller.signal,
    });
    if (response.status === 404) {
      // A server without /ping: almost certainly a refgenie too old for the
      // bridge. No fallback sniffing of other endpoints — the clean answer
      // is "upgrade refgenie".
      return { kind: 'unsupported', reason: 'missing-ping' };
    }
    if (!response.ok) return { kind: 'unreachable' };
    const validation = validatePing(await response.json());
    if (!validation.ok) {
      return {
        kind: 'unsupported',
        reason: validation.reason === 'malformed' ? 'wrong-service' : validation.reason,
      };
    }
    return { kind: 'connected', ping: validation.ping, baseUrl };
  } catch {
    return { kind: 'unreachable' };
  } finally {
    clearTimeout(timer);
  }
};
