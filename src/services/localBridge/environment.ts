/**
 * Browser/host environment detectors for the localhost bridge.
 *
 * Parameterized on the pieces of `navigator` / `location` they read so the
 * vitest suite can exercise them in a plain node environment.
 */

export type NavigatorLike = { vendor?: string; userAgent?: string };
export type LocationLike = { origin: string };

/**
 * WebKit-but-not-Chromium (i.e. Safari, or any iOS browser shell). WebKit
 * blocks HTTPS pages from fetching http://localhost outright (WebKit bug
 * 171934, open since 2017), so the probe is skipped entirely there and the
 * user gets the documented fallback — not a workaround, because there is no
 * correct one.
 */
export const isWebKitOnly = (
  nav: NavigatorLike = typeof navigator !== 'undefined' ? navigator : {},
): boolean => {
  const userAgent = nav.userAgent ?? '';
  const chromiumMarkers = /Chrome|Chromium|CriOS|Edg\/|OPR\//;
  return nav.vendor === 'Apple Computer, Inc.' && !chromiumMarkers.test(userAgent);
};

/**
 * D7: whether this page IS the local dash (same origin as the probe target).
 * In that case "local" is simply the primary client — the bridge must
 * short-circuit and hide every connect surface, or the local SPA would offer
 * to connect to itself.
 */
export const isSelfLocal = (
  port: number,
  loc: LocationLike = typeof window !== 'undefined' ? window.location : { origin: '' },
): boolean =>
  loc.origin === `http://localhost:${port}` || loc.origin === `http://127.0.0.1:${port}`;
