export type NotificationKey = "newOrder" | "lowStock" | "shippingDelay";
export type NotificationPreferences = Record<NotificationKey, boolean>;

const STORAGE_KEY = "admin-notification-preferences";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  newOrder: true,
  lowStock: true,
  shippingDelay: false,
};

export function getInitialNotificationPreferences(): NotificationPreferences {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_PREFERENCES;
  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveNotificationPreferences(prefs: NotificationPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
