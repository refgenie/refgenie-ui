import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { ApiClientContext, createApiClient } from '../../services/api';
import { useLocalBridge } from '../../services/localBridge';
import ConnectDialog from './ConnectDialog';

/**
 * The `/local/*` route branch's scope (bridge plan B5): provides an API
 * client pointed at the connected local refgenie so the existing browse
 * components (Genomes / Genome / Asset) render local data unchanged — they
 * are client-parameterized through `ApiClientContext`, never special-cased.
 *
 * Local data is always visually segregated (banner + `/local` routes) and
 * never merged into remote result sets without a badge: a rogue process on
 * the bridge port could feed fabricated data, and presentation is the only
 * available mitigation (threat T7).
 */
function LocalScope({ children }: { children: ReactNode }) {
  const bridge = useLocalBridge();
  const [dialogOpen, setDialogOpen] = useState(false);

  const localApi = useMemo(
    () =>
      bridge.baseUrl
        ? createApiClient(`${bridge.baseUrl}/v4`, {
            routeBase: '/local',
            capabilities: bridge.ping?.capabilities ?? {},
          })
        : null,
    [bridge.baseUrl, bridge.ping],
  );

  if (bridge.status !== 'connected' || !localApi) {
    return (
      <div className='row p-2 p-lg-4 mt-4 mt-lg-0'>
        <div className='col-12'>
          <div className='card bg-body-tertiary shadow-sm'>
            <div className='card-body text-ss'>
              <h6 className='fw-bold'>Not connected to a local refgenie</h6>
              <p className='mb-2'>
                {bridge.status === 'connecting'
                  ? 'Connecting…'
                  : 'Connect to your running refgenie dash to browse your local genomes here.'}
              </p>
              {bridge.status !== 'connecting' && (
                <button
                  className='btn btn-sm btn-success'
                  onClick={() => setDialogOpen(true)}
                >
                  <i className='bi bi-plug me-1'></i>Connect
                </button>
              )}
            </div>
          </div>
        </div>
        <ConnectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      </div>
    );
  }

  return (
    <ApiClientContext.Provider value={localApi}>
      <div className='row px-2 px-lg-4 pt-2'>
        <div className='col-12'>
          <div className='alert alert-success py-1 px-2 mb-0 text-ss d-flex align-items-center'>
            <i className='bi bi-hdd me-2'></i>
            Browsing your <strong className='mx-1'>local refgenie</strong> (
            {bridge.ping?.instance_label}) — this data lives on your computer.
          </div>
        </div>
      </div>
      {children}
    </ApiClientContext.Provider>
  );
}

export default LocalScope;
