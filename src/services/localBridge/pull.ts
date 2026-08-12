/**
 * Cross-origin pull against a connected local refgenie: submit the job with
 * the `X-Refgenie-Action` header (its presence is the anti-CSRF signal; the
 * value is ignored), then poll the job record until it reaches a terminal
 * status. `fetch` rather than axios so `credentials: 'omit'` is explicit and
 * the request carries nothing but what the contract requires.
 */

export type JobRef = {
  job_id: string;
  kind: string;
  status: string;
  duplicate?: boolean;
  links?: { self?: string; events?: string; cancel?: string };
};

export type JobRecord = {
  id: string;
  kind: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | string;
  error?: { code?: string; message?: string } | null;
  progress?: { current?: number; total?: number } | null;
};

export type PullRequestBody = {
  genome_digest?: string;
  genome?: string;
  asset_group: string;
  asset?: string;
  /** The remote server this pull should come from — the server root of the
   * API base the page is currently browsing. */
  server_url?: string;
};

const TERMINAL_STATUSES = new Set(['succeeded', 'failed', 'cancelled']);

const envelopeMessage = async (response: Response): Promise<string> => {
  try {
    const body = await response.json();
    if (body?.error?.message) return String(body.error.message);
  } catch {
    // Not an envelope; fall through.
  }
  return `Request failed (HTTP ${response.status})`;
};

export class LocalPullError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const submitLocalPull = async (
  baseUrl: string,
  body: PullRequestBody,
): Promise<JobRef> => {
  const response = await fetch(`${baseUrl}/v1/actions/pull`, {
    method: 'POST',
    credentials: 'omit',
    headers: {
      'content-type': 'application/json',
      'x-refgenie-action': '1',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new LocalPullError(await envelopeMessage(response), response.status);
  }
  return (await response.json()) as JobRef;
};

export const getJob = async (baseUrl: string, jobId: string): Promise<JobRecord> => {
  const response = await fetch(`${baseUrl}/v1/jobs/${jobId}`, { credentials: 'omit' });
  if (!response.ok) {
    throw new LocalPullError(await envelopeMessage(response), response.status);
  }
  return (await response.json()) as JobRecord;
};

/** Poll until the job is terminal; `onUpdate` fires on every poll. */
export const waitForJob = async (
  baseUrl: string,
  jobId: string,
  onUpdate?: (record: JobRecord) => void,
  intervalMs = 1000,
): Promise<JobRecord> => {
  for (;;) {
    const record = await getJob(baseUrl, jobId);
    onUpdate?.(record);
    if (TERMINAL_STATUSES.has(record.status)) return record;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
};
