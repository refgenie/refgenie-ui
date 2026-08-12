import { useState } from 'react';

import {
  dismissSafariCard,
  isSafariCardDismissed,
  useLocalBridge,
} from '../../services/localBridge';
import ConnectDialog from './ConnectDialog';

/**
 * The first-class connect affordance on the Genomes page while disconnected
 * (bridge plan B4), and the Safari fallback card (B7) on WebKit-only
 * browsers, where the probe is never attempted because WebKit blocks
 * HTTPS-page-to-localhost fetches outright (WebKit bug 171934).
 */
function ConnectCard() {
  const bridge = useLocalBridge();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [safariDismissed, setSafariDismissed] = useState(isSafariCardDismissed());

  if (bridge.status === 'connected' || bridge.status === 'self') return null;

  if (bridge.status === 'blocked') {
    if (safariDismissed) return null;
    const localUrl = `http://localhost:${bridge.port}`;
    return (
      <div className='card bg-body-tertiary shadow-sm mt-4'>
        <div className='card-body text-ss'>
          <div className='d-flex align-items-start'>
            <div>
              <h6 className='fw-bold'>Using refgenie locally?</h6>
              <p className='mb-2'>
                Safari blocks pages served over HTTPS from talking to a server on
                your own computer (
                <a
                  href='https://bugs.webkit.org/show_bug.cgi?id=171934'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  WebKit bug 171934
                </a>
                ). Open your local refgenie directly — it runs the same interface:
              </p>
              <div className='d-flex align-items-center gap-2'>
                <code>{localUrl}</code>
                <button
                  className='btn btn-sm btn-outline-secondary'
                  onClick={() => navigator.clipboard.writeText(localUrl)}
                >
                  <i className='bi bi-clipboard me-1'></i>Copy
                </button>
              </div>
            </div>
            <button
              type='button'
              className='btn-close ms-auto'
              aria-label="Don't show again"
              onClick={() => {
                dismissSafariCard();
                setSafariDismissed(true);
              }}
            ></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='card bg-body-tertiary shadow-sm mt-4'>
        <div className='card-body text-ss d-flex align-items-center'>
          <div>
            <h6 className='fw-bold mb-1'>Using refgenie locally?</h6>
            <p className='mb-0'>
              Connect this page to your running <code>refgenie dash</code> to see
              which assets you already have and browse your local genomes.
            </p>
          </div>
          <button
            className='btn btn-sm btn-success ms-auto text-nowrap'
            onClick={() => setDialogOpen(true)}
          >
            <i className='bi bi-plug me-1'></i>Connect
          </button>
        </div>
      </div>
      <ConnectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}

export default ConnectCard;
