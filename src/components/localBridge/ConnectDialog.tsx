import { useEffect, useState } from 'react';

import { useLocalBridge } from '../../services/localBridge';

type ConnectDialogProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * The connect dialog (bridge plan B4). The probe fires only on the Connect
 * click — that is what makes Chrome's Local Network Access permission prompt
 * appear in a context where the user understands what is being asked. The
 * page never probes silently on a cold first visit.
 */
function ConnectDialog(props: ConnectDialogProps) {
  const { open, onClose } = props;
  const bridge = useLocalBridge();
  const [portText, setPortText] = useState(String(bridge.port));

  // Close automatically once connected.
  useEffect(() => {
    if (open && bridge.status === 'connected') onClose();
  }, [open, bridge.status, onClose]);

  if (!open) return null;

  const parsedPort = Number(portText);
  const portValid = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort < 65536;

  return (
    <>
      <div className='modal d-block' tabIndex={-1} role='dialog'>
        <div className='modal-dialog modal-dialog-centered' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h6 className='modal-title fw-bold'>Connect to my local refgenie</h6>
              <button
                type='button'
                className='btn-close'
                aria-label='Close'
                onClick={onClose}
              ></button>
            </div>
            <div className='modal-body text-ss'>
              <p>
                This page will talk to a refgenie running on <em>this computer</em>{' '}
                (via <code>refgenie dash</code>). No data leaves your machine, and
                your browser may ask permission to access a local network device.
              </p>
              <div className='input-group input-group-sm mb-2'>
                <span className='input-group-text'>Port</span>
                <input
                  type='text'
                  inputMode='numeric'
                  className={`form-control ${portValid ? '' : 'is-invalid'}`}
                  value={portText}
                  onChange={(e) => setPortText(e.target.value)}
                />
              </div>

              {bridge.status === 'unsupported' && (
                <div className='alert alert-warning py-2 mb-2'>
                  {bridge.unsupportedReason === 'unsupported-version' &&
                    'Your local refgenie speaks a newer bridge protocol than this page expects. Open it directly instead.'}
                  {bridge.unsupportedReason === 'missing-ping' &&
                    'Something answered on that port, but it does not support the bridge. If it is refgenie, upgrade it to a version with bridge support.'}
                  {bridge.unsupportedReason === 'wrong-service' &&
                    'Something answered on that port, but it does not look like refgenie.'}
                </div>
              )}

              {bridge.status === 'absent' && bridge.showTroubleshooting && (
                <div className='alert alert-warning py-2 mb-2'>
                  <p className='mb-1 fw-bold'>Could not reach a local refgenie. Check:</p>
                  <ul className='mb-0 ps-3'>
                    <li>
                      Is it running? Start it with <code>refgenie dash</code>.
                    </li>
                    <li>
                      Did your browser ask to allow local network access? A denied
                      prompt can be re-granted from the site settings icon in the
                      address bar.
                    </li>
                    <li>Is it on a different port? Adjust the port field above.</li>
                    <li>
                      Is your refgenie too old to support the bridge? Upgrade it.
                    </li>
                    <li>
                      Is the bridge disabled? Restart with{' '}
                      <code>refgenie dash --bridge read</code> (or check{' '}
                      <code>REFGENIE_BRIDGE_MODE</code>).
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className='modal-footer py-2'>
              <button type='button' className='btn btn-sm btn-outline-secondary' onClick={onClose}>
                Cancel
              </button>
              <button
                type='button'
                className='btn btn-sm btn-success'
                disabled={!portValid || bridge.status === 'connecting'}
                onClick={() => void bridge.connect(parsedPort)}
              >
                {bridge.status === 'connecting' ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-2'
                      aria-hidden='true'
                    ></span>
                    Connecting
                  </>
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop show'></div>
    </>
  );
}

export default ConnectDialog;
