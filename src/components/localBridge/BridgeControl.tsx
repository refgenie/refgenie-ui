import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useLocalBridge } from '../../services/localBridge';
import ConnectDialog from './ConnectDialog';

/**
 * The navbar's bridge surface: a connect control while disconnected, a
 * connection pill (with local-browse link and disconnect) once connected.
 * Suppressed entirely when the page itself is the local dash (`self`, D7)
 * and replaced by nothing on WebKit (`blocked` — the Genomes-page card
 * carries the full explanation there).
 */
function BridgeControl() {
  const bridge = useLocalBridge();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (bridge.status === 'self') return null;

  return (
    <>
      <p className='fst-condensed mt-3 mb-0'>Local</p>
      <div>
        {bridge.status === 'connected' ? (
          <>
            <p className='mb-0 ps-2 text-ss'>
              <span className='badge text-bg-success me-1'>
                <i className='bi bi-hdd me-1'></i>connected
              </span>
              <span className='text-black-50'>{bridge.ping?.instance_label}</span>
              {bridge.ping?.counts && (
                <span className='text-black-50'>
                  {' '}
                  · {bridge.ping.counts.genomes} genomes, {bridge.ping.counts.assets}{' '}
                  assets
                </span>
              )}
            </p>
            <p className='mb-0 nav-hover ps-2 cursor-pointer rounded-2'>
              <Link
                className='fst-condensed text-decoration-none text-black-50 fw-lighter'
                to='/local/genomes'
              >
                Browse local
              </Link>
            </p>
            <p className='mb-0 nav-hover ps-2 cursor-pointer rounded-2'>
              <a
                className='fst-condensed text-decoration-none text-black-50 fw-lighter cursor-pointer'
                onClick={() => bridge.disconnect()}
              >
                Disconnect
              </a>
            </p>
          </>
        ) : bridge.status === 'blocked' ? (
          <p className='mb-0 ps-2 text-ss text-black-50'>
            Not available in Safari —{' '}
            <a
              href={`http://localhost:${bridge.port}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              open local refgenie
            </a>
          </p>
        ) : (
          <p className='mb-0 nav-hover ps-2 cursor-pointer rounded-2'>
            <a
              className='fst-condensed text-decoration-none text-black-50 fw-lighter cursor-pointer'
              onClick={() => setDialogOpen(true)}
            >
              <i className='bi bi-plug me-1'></i>Connect local refgenie
            </a>
          </p>
        )}
      </div>
      <ConnectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}

export default BridgeControl;
