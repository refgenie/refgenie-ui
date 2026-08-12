import { createContext, useContext } from 'react';

/**
 * The injectable API base. One client instance per backend: the default
 * (remote) client points at the public refgenie server; the localhost bridge
 * instantiates a second client from this same factory pointed at the user's
 * local `refgenie dash`.
 *
 * Query modules read the current client from React context (`useApiClient`),
 * so the same page components render against either backend depending on
 * which provider wraps them — this is the shared service layer the bridge
 * plan requires, and it must stay free of page-component imports.
 */

export const REMOTE_API_BASE = 'https://api.refgenie.org/v4';

/** Capability flags served by /service-info and /ping (shared vocabulary).
 * A missing key always reads as `false` — never gate on version numbers. */
export type Capabilities = {
  pull?: boolean;
  build?: boolean;
  delete?: boolean;
  aliases_write?: boolean;
  subscriptions?: boolean;
  recipes_write?: boolean;
  asset_classes_write?: boolean;
  remote_browse?: boolean;
  genome_init?: boolean;
  jobs?: boolean;
  jobs_cancel?: boolean;
  downloads?: boolean;
  archives?: boolean;
  seqcol?: boolean;
  drs?: boolean;
};

export type ApiClient = {
  /** v4 API base, no trailing slash, e.g. `https://api.refgenie.org/v4`. */
  baseUrl: string;
  /** Route prefix pages should navigate under ('' remote, '/local' bridge). */
  routeBase: string;
  /** Capability flags of this backend; undefined means "assume the public
   * server surface" (archives/downloads available, no writes). */
  capabilities?: Capabilities;
};

export const createApiClient = (
  baseUrl: string,
  options?: { routeBase?: string; capabilities?: Capabilities },
): ApiClient => ({
  baseUrl: baseUrl.replace(/\/+$/, ''),
  routeBase: options?.routeBase ?? '',
  capabilities: options?.capabilities,
});

/** Whether `capability` is available on this client's backend. The remote
 * public server predates capability flags, so an absent capabilities object
 * falls back to the server-mode defaults. */
export const hasCapability = (
  api: ApiClient,
  capability: keyof Capabilities,
): boolean => {
  if (api.capabilities === undefined) {
    return capability === 'archives' || capability === 'downloads';
  }
  return api.capabilities[capability] === true;
};

export const remoteApi: ApiClient = createApiClient(REMOTE_API_BASE);

export const ApiClientContext = createContext<ApiClient>(remoteApi);

/** The API client for the backend this part of the tree renders against. */
export const useApiClient = (): ApiClient => useContext(ApiClientContext);
