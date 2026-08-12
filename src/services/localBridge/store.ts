import { create } from 'zustand';

import type { PingResponse } from './contract';
import { DEFAULT_LOCAL_PORT } from './persistence';

/**
 * The bridge connection state, shared by the navbar pill, the connect
 * dialog/card, the presence badges and the pull affordance.
 *
 * - `idle`        — never probed this visit, no remembered connection tried
 * - `connecting`  — a probe is in flight
 * - `connected`   — a supported local refgenie answered
 * - `absent`      — the probe failed (any of: not running, LNA denied,
 *                   wrong port, bridge off — indistinguishable from a page)
 * - `blocked`     — WebKit-only browser; the probe is never attempted
 * - `unsupported` — something answered but is not a bridge we can speak to
 * - `self`        — this page IS the local dash (D7); hide all connect UI
 */
export type BridgeStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'absent'
  | 'blocked'
  | 'unsupported'
  | 'self';

export type UnsupportedReason = 'wrong-service' | 'unsupported-version' | 'missing-ping' | null;

type LocalBridgeStore = {
  status: BridgeStatus;
  port: number;
  /** `http://localhost:{port}` while connected, else null. */
  baseUrl: string | null;
  ping: PingResponse | null;
  unsupportedReason: UnsupportedReason;
  /** True when the last failed probe was an explicit user click (render the
   * troubleshooting panel); false for silent remembered re-probes. */
  showTroubleshooting: boolean;
  setPort: (port: number) => void;
  setStatus: (status: BridgeStatus) => void;
  setConnecting: () => void;
  setConnected: (ping: PingResponse, port: number, baseUrl: string) => void;
  setAbsent: (explicit: boolean) => void;
  setUnsupported: (reason: Exclude<UnsupportedReason, null>) => void;
  reset: () => void;
};

export const useLocalBridgeStore = create<LocalBridgeStore>((set) => ({
  status: 'idle',
  port: DEFAULT_LOCAL_PORT,
  baseUrl: null,
  ping: null,
  unsupportedReason: null,
  showTroubleshooting: false,
  setPort: (port: number) => set({ port }),
  setStatus: (status: BridgeStatus) => set({ status }),
  setConnecting: () => set({ status: 'connecting', showTroubleshooting: false }),
  setConnected: (ping: PingResponse, port: number, baseUrl: string) =>
    set({
      status: 'connected',
      ping,
      port,
      baseUrl,
      unsupportedReason: null,
      showTroubleshooting: false,
    }),
  setAbsent: (explicit: boolean) =>
    set({
      status: 'absent',
      baseUrl: null,
      ping: null,
      showTroubleshooting: explicit,
    }),
  setUnsupported: (reason: Exclude<UnsupportedReason, null>) =>
    set({
      status: 'unsupported',
      baseUrl: null,
      ping: null,
      unsupportedReason: reason,
    }),
  reset: () =>
    set({
      status: 'idle',
      baseUrl: null,
      ping: null,
      unsupportedReason: null,
      showTroubleshooting: false,
    }),
}));
