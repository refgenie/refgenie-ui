import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

/**
 * Small in-house toast system (Bootstrap toast markup, no external toast
 * library) used by the localhost-bridge pull flow. `push` returns an id that
 * `update` can re-render in place, which is what a long-running pull's
 * progress toast needs.
 */

export type ToastVariant = 'info' | 'success' | 'error';

export type ToastInput = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  /** Sticky toasts stay until dismissed/updated (progress toasts). */
  sticky?: boolean;
};

type ToastItem = ToastInput & { id: number };

type ToastApi = {
  push: (toast: ToastInput) => number;
  update: (id: number, toast: ToastInput) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export const useToasts = (): ToastApi => {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToasts must be used inside <ToastProvider>');
  return api;
};

const AUTO_DISMISS_MS = 6000;

const variantClasses: Record<ToastVariant, string> = {
  info: 'text-bg-light border',
  success: 'text-bg-success',
  error: 'text-bg-danger',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { ...toast, id }]);
      if (!toast.sticky) {
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      }
      return id;
    },
    [dismiss],
  );

  const update = useCallback(
    (id: number, toast: ToastInput) => {
      setToasts((current) =>
        current.map((item) => (item.id === id ? { ...toast, id } : item)),
      );
      if (!toast.sticky) {
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      }
    },
    [dismiss],
  );

  const api = useMemo(() => ({ push, update, dismiss }), [push, update, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className='toast-container position-fixed bottom-0 end-0 p-3'
        aria-live='polite'
        aria-atomic='true'
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast show ${variantClasses[toast.variant ?? 'info']}`}
            role='status'
          >
            <div className='d-flex'>
              <div className='toast-body'>
                {toast.title && <strong className='d-block'>{toast.title}</strong>}
                {toast.message}
              </div>
              <button
                type='button'
                className={`btn-close me-2 m-auto ${
                  toast.variant && toast.variant !== 'info' ? 'btn-close-white' : ''
                }`}
                aria-label='Close'
                onClick={() => dismiss(toast.id)}
              ></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
