import { useCallback, useEffect, useRef } from 'react';

import { isSelfLocal, isWebKitOnly } from './environment';
import { forget, recall, remember } from './persistence';
import { probeLocal } from './probe';
import { useLocalBridgeStore } from './store';

/**
 * The bridge orchestration hook. Detection is user-initiated on first
 * connect and remembered afterward (D3): no silent probe on a cold visit —
 * that is both the Chrome-LNA-prompt-friendly behavior and the honest one.
 * Once a connection succeeded, the remembered `{port, instanceId}` licenses
 * an automatic, silent re-probe on later visits.
 */
export const useLocalBridge = () => {
  const store = useLocalBridgeStore();
  const autoProbeAttempted = useRef(false);

  const connect = useCallback(
    async (port: number, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      const state = useLocalBridgeStore.getState();
      if (isSelfLocal(port)) {
        // D7: this page IS the local dash; never offer to connect to itself.
        state.setStatus('self');
        return;
      }
      if (isWebKitOnly()) {
        // Skip the doomed request: WebKit blocks it outright, and this is
        // the one failure cause identifiable with confidence.
        state.setStatus('blocked');
        return;
      }
      state.setPort(port);
      state.setConnecting();
      const result = await probeLocal(port);
      const current = useLocalBridgeStore.getState();
      if (result.kind === 'connected') {
        current.setConnected(result.ping, port, result.baseUrl);
        remember({
          port,
          instanceId: result.ping.instance_id,
          connectedAt: new Date().toISOString(),
        });
      } else if (result.kind === 'unsupported') {
        current.setUnsupported(result.reason);
      } else {
        // Never nag on a normal page load: the troubleshooting panel renders
        // only after an explicit click.
        current.setAbsent(!silent);
      }
    },
    [],
  );

  const disconnect = useCallback(() => {
    forget();
    useLocalBridgeStore.getState().reset();
  }, []);

  // A remembered prior connection licenses one silent re-probe per page load.
  useEffect(() => {
    if (autoProbeAttempted.current) return;
    autoProbeAttempted.current = true;
    const remembered = recall();
    if (remembered && useLocalBridgeStore.getState().status === 'idle') {
      void connect(remembered.port, { silent: true });
    } else if (isSelfLocal(useLocalBridgeStore.getState().port)) {
      useLocalBridgeStore.getState().setStatus('self');
    }
  }, [connect]);

  return { ...store, connect, disconnect };
};
