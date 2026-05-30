import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/variables.css';
import './Notification.css';
import { cn } from '../../utils/cn';

// ─── Public types ──────────────────────────────────────────────────────────

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type NotificationPlacement =
  | 'topLeft' | 'topCenter' | 'topRight'
  | 'bottomLeft' | 'bottomCenter' | 'bottomRight';

export interface NotificationConfig {
  /** Unique key — reuse to update an existing notification instead of creating a new one */
  key?: string;
  type?: NotificationType;
  /** Title text (bold) */
  message?: ReactNode;
  /** Secondary body text */
  description?: ReactNode;
  /** Auto-dismiss delay in ms. 0 = no auto-dismiss. Default: 4500 */
  duration?: number;
  /** Show the × close button. Default: true */
  closable?: boolean;
  /** Called when the notification is dismissed */
  onClose?: () => void;
  /** Custom icon — replaces the default type icon */
  icon?: ReactNode;
  /** Action button rendered below the description */
  btn?: ReactNode;
  placement?: NotificationPlacement;
}

export interface NotificationInstance {
  open: (config: NotificationConfig) => void;
  success: (config: Omit<NotificationConfig, 'type'>) => void;
  error: (config: Omit<NotificationConfig, 'type'>) => void;
  warning: (config: Omit<NotificationConfig, 'type'>) => void;
  info: (config: Omit<NotificationConfig, 'type'>) => void;
  /** Dismiss a notification by key, or dismiss all if no key is given */
  destroy: (key?: string) => void;
}

export interface UseNotificationConfig {
  /** Default placement. Default: 'topRight' */
  placement?: NotificationPlacement;
  /** Default auto-dismiss duration in ms. Default: 4500 */
  duration?: number;
  /** Maximum number of notifications shown simultaneously */
  maxCount?: number;
}

// ─── Internal type ─────────────────────────────────────────────────────────

interface InternalItem {
  key: string;
  type: NotificationType;
  message?: ReactNode;
  description?: ReactNode;
  duration: number;
  closable: boolean;
  onClose?: () => void;
  icon?: ReactNode;
  btn?: ReactNode;
  placement: NotificationPlacement;
  leaving: boolean;
}

// ─── Icons ─────────────────────────────────────────────────────────────────

const SuccessIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="var(--dsg-success)" />
    <path d="M5.5 10.5l3 3 6-6.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="var(--dsg-danger)" />
    <path d="M6.5 6.5l7 7M13.5 6.5l-7 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const WarningIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 1.5L19 18H1L10 1.5z" fill="var(--dsg-warning)" />
    <path d="M10 8v4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10" cy="15" r="1" fill="#fff" />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="var(--dsg-primary)" />
    <path d="M10 9v5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10" cy="6" r="1" fill="#fff" />
  </svg>
);

const TYPE_ICONS: Record<NotificationType, React.FC> = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function getDirection(placement: NotificationPlacement) {
  if (placement.endsWith('Right')) return 'right';
  if (placement.endsWith('Left')) return 'left';
  if (placement.startsWith('top')) return 'top';
  return 'bottom';
}

// ─── NotifItemView ─────────────────────────────────────────────────────────

interface NotifItemViewProps {
  item: InternalItem;
  onClose: (key: string) => void;
}

const NotifItemView: React.FC<NotifItemViewProps> = ({ item, onClose }) => {
  const Icon = TYPE_ICONS[item.type];
  const dir = getDirection(item.placement);

  return (
    <div
      role={item.type === 'error' || item.type === 'warning' ? 'alert' : 'status'}
      aria-live={item.type === 'error' || item.type === 'warning' ? 'assertive' : 'polite'}
      className={cn(
        'dsg-notif-item',
        `dsg-notif-item--${item.type}`,
        item.leaving ? `dsg-notif-item--leave-${dir}` : `dsg-notif-item--enter-${dir}`,
      )}
    >
      <div className="dsg-notif-item__icon">
        {item.icon ?? <Icon />}
      </div>
      <div className="dsg-notif-item__body">
        {item.message && (
          <div className="dsg-notif-item__message">{item.message}</div>
        )}
        {item.description && (
          <div className="dsg-notif-item__description">{item.description}</div>
        )}
        {item.btn && (
          <div className="dsg-notif-item__btn">{item.btn}</div>
        )}
      </div>
      {item.closable && (
        <button
          type="button"
          className="dsg-notif-item__close"
          onClick={() => onClose(item.key)}
          aria-label="Close notification"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ─── NotifContainer (one per active placement) ─────────────────────────────

interface NotifContainerProps {
  placement: NotificationPlacement;
  items: InternalItem[];
  onClose: (key: string) => void;
}

const NotifContainer: React.FC<NotifContainerProps> = ({ placement, items, onClose }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className={cn('dsg-notif-container', `dsg-notif-container--${placement}`)}>
      {items.map(item => (
        <NotifItemView key={item.key} item={item} onClose={onClose} />
      ))}
    </div>,
    document.body,
  );
};

// ─── ContextHolder ─────────────────────────────────────────────────────────

interface ContextHolderProps {
  placements: Partial<Record<NotificationPlacement, InternalItem[]>>;
  onClose: (key: string) => void;
}

const ContextHolder: React.FC<ContextHolderProps> = ({ placements, onClose }) => (
  <>
    {(Object.entries(placements) as [NotificationPlacement, InternalItem[]][]).map(
      ([placement, items]) => (
        <NotifContainer key={placement} placement={placement} items={items} onClose={onClose} />
      )
    )}
  </>
);

// ─── useNotification ───────────────────────────────────────────────────────

export function useNotification(
  config?: UseNotificationConfig,
): [NotificationInstance, React.ReactElement] {
  const defaultPlacement = config?.placement ?? 'topRight';
  const defaultDuration = config?.duration ?? 4500;
  const maxCount = config?.maxCount;

  const [items, setItems] = useState<InternalItem[]>([]);
  const counterRef = useRef(0);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Clear all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const clearTimer = useCallback((key: string) => {
    const t = timersRef.current.get(key);
    if (t !== undefined) {
      clearTimeout(t);
      timersRef.current.delete(key);
    }
  }, []);

  const remove = useCallback((key: string) => {
    clearTimer(key);
    setItems(prev => {
      const item = prev.find(it => it.key === key);
      if (!item || item.leaving) return prev;
      item.onClose?.();
      return prev.map(it => it.key === key ? { ...it, leaving: true } : it);
    });
    setTimeout(() => {
      setItems(prev => prev.filter(it => it.key !== key));
    }, 320);
  }, [clearTimer]);

  const open = useCallback((notifConfig: NotificationConfig) => {
    const key = notifConfig.key ?? `notif-${++counterRef.current}`;
    const duration = notifConfig.duration ?? defaultDuration;

    // Clear any pre-existing timer so we don't double-dismiss on update
    clearTimer(key);

    const newItem: InternalItem = {
      key,
      type: notifConfig.type ?? 'info',
      message: notifConfig.message,
      description: notifConfig.description,
      duration,
      closable: notifConfig.closable ?? true,
      onClose: notifConfig.onClose,
      icon: notifConfig.icon,
      btn: notifConfig.btn,
      placement: notifConfig.placement ?? defaultPlacement,
      leaving: false,
    };

    setItems(prev => {
      if (prev.some(it => it.key === key)) {
        return prev.map(it => it.key === key ? newItem : it);
      }
      let next = [...prev, newItem];
      if (maxCount && next.length > maxCount) {
        next = next.slice(next.length - maxCount);
      }
      return next;
    });

    if (duration > 0) {
      const t = setTimeout(() => remove(key), duration);
      timersRef.current.set(key, t);
    }
  }, [defaultPlacement, defaultDuration, maxCount, clearTimer, remove]);

  const api = useMemo<NotificationInstance>(() => ({
    open,
    success: cfg => open({ ...cfg, type: 'success' }),
    error:   cfg => open({ ...cfg, type: 'error' }),
    warning: cfg => open({ ...cfg, type: 'warning' }),
    info:    cfg => open({ ...cfg, type: 'info' }),
    destroy: key => {
      if (key !== undefined) {
        remove(key);
      } else {
        timersRef.current.forEach(clearTimeout);
        timersRef.current.clear();
        setItems([]);
      }
    },
  }), [open, remove]);

  const placements = useMemo(() => {
    const grouped: Partial<Record<NotificationPlacement, InternalItem[]>> = {};
    for (const item of items) {
      if (!grouped[item.placement]) grouped[item.placement] = [];
      grouped[item.placement]!.push(item);
    }
    return grouped;
  }, [items]);

  const contextHolder = useMemo(
    () => <ContextHolder placements={placements} onClose={remove} />,
    [placements, remove],
  );

  return [api, contextHolder];
}
