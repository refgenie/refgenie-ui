import { useState } from 'react';

import { useApiClient } from '../../services/api';
import {
  LocalPullError,
  submitLocalPull,
  useInvalidateLocalDigestIndex,
  useLocalBridge,
  waitForJob,
} from '../../services/localBridge';
import { useToasts } from '../toast/ToastProvider';

type PullButtonProps = {
  genomeDigest: string;
  assetGroupName: string;
  assetName?: string;
};

/** The remote server root for `server_url`: the API base minus its version
 * suffix (`https://api.refgenie.org/v4` -> `https://api.refgenie.org`). */
const serverRoot = (apiBase: string) => apiBase.replace(/\/v\d+$/, '');

/**
 * "Pull to my refgenie" (bridge plan B6). Rendered only on the remote branch
 * with the bridge connected. When cross-origin actions are disabled on the
 * local side (`bridge.actions_cross_origin` false — the default), the button
 * is disabled with the remedy and a deep link into the local SPA's prefilled,
 * unsubmitted pull page (which never auto-executes). Never auto-pulls from a
 * URL parameter or on page load.
 */
function PullButton(props: PullButtonProps) {
  const { genomeDigest, assetGroupName, assetName } = props;
  const api = useApiClient();
  const bridge = useLocalBridge();
  const toasts = useToasts();
  const invalidateLocalIndex = useInvalidateLocalDigestIndex();
  const [pulling, setPulling] = useState(false);

  if (
    bridge.status !== 'connected' ||
    !bridge.baseUrl ||
    api.routeBase !== '' ||
    bridge.ping?.capabilities.pull !== true
  ) {
    return null;
  }

  const remoteBase = serverRoot(api.baseUrl);
  const registryLabel = `${assetGroupName}${assetName ? `/${assetName}` : ''}`;
  const deepLink =
    `${bridge.baseUrl}/pull?server=${encodeURIComponent(remoteBase)}` +
    `&genome=${encodeURIComponent(genomeDigest)}` +
    `&asset_group=${encodeURIComponent(assetGroupName)}`;

  const crossOriginEnabled = bridge.ping?.bridge.actions_cross_origin === true;

  const startPull = async () => {
    if (!bridge.baseUrl) return;
    setPulling(true);
    const toastId = toasts.push({
      title: 'Pulling to local refgenie',
      message: `${registryLabel}: submitting…`,
      sticky: true,
    });
    try {
      const ref = await submitLocalPull(bridge.baseUrl, {
        genome_digest: genomeDigest,
        asset_group: assetGroupName,
        asset: assetName,
        server_url: remoteBase,
      });
      const record = await waitForJob(bridge.baseUrl, ref.job_id, (update) => {
        const progress =
          update.progress?.percent !== null && update.progress?.percent !== undefined
            ? ` (${Math.round(update.progress.percent)}%)`
            : '';
        toasts.update(toastId, {
          title: 'Pulling to local refgenie',
          message: `${registryLabel}: ${update.status}${progress}`,
          sticky: true,
        });
      });
      if (record.status === 'succeeded') {
        toasts.update(toastId, {
          title: 'Pull complete',
          message: `${registryLabel} is now on your local refgenie.`,
          variant: 'success',
        });
        void invalidateLocalIndex();
      } else {
        toasts.update(toastId, {
          title: 'Pull did not complete',
          message: record.error?.message ?? `Job ended with status '${record.status}'.`,
          variant: 'error',
        });
      }
    } catch (error) {
      toasts.update(toastId, {
        title: 'Pull failed',
        message:
          error instanceof LocalPullError ? error.message : 'Could not reach the local refgenie.',
        variant: 'error',
      });
    } finally {
      setPulling(false);
    }
  };

  return (
    <span className='ms-1 d-inline-flex align-items-center'>
      <button
        className='btn btn-success btn-sm'
        disabled={!crossOriginEnabled || pulling}
        title={
          crossOriginEnabled
            ? undefined
            : `Cross-origin actions are disabled on this refgenie (bridge mode is '${bridge.ping?.bridge_mode}'). Restart with \`refgenie dash --bridge full\` to enable them.`
        }
        onClick={() => void startPull()}
      >
        {pulling ? (
          <>
            <span className='spinner-border spinner-border-sm me-2' aria-hidden='true'></span>
            Pulling
          </>
        ) : (
          <>
            <i className='bi bi-download me-2' />
            Pull to my refgenie
          </>
        )}
      </button>
      {!crossOriginEnabled && (
        <a
          className='btn btn-outline-success btn-sm ms-1'
          href={deepLink}
          target='_blank'
          rel='noopener noreferrer'
          title='Opens your local refgenie with this pull prefilled (nothing runs until you confirm there).'
        >
          <i className='bi bi-box-arrow-up-right me-2' />
          Open in local refgenie
        </a>
      )}
    </span>
  );
}

export default PullButton;
