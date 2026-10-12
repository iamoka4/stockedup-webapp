// Notification preferences for the vendor web app.
//
// Same three preference keys as the mobile app's save-push-token.php payload:
//   order_updates, promotions, new_products
//
// ⚠ For now these are saved in THIS BROWSER ONLY (localStorage). On mobile the
// preferences are stored on the backend against each device's push token, and the
// web app has no push token, so nothing here changes what the backend sends yet.
// To make them real, saveNotificationPreferences() needs to call a backend
// endpoint (see the TODO below).

export interface NotificationPreferences {
  order_updates: boolean;
  promotions: boolean;
  new_products: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  order_updates: true,
  promotions: true,
  new_products: true,
};

const STORAGE_KEY = "stockedup:vendor-notification-preferences";

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      order_updates: parsed.order_updates ?? DEFAULT_PREFERENCES.order_updates,
      promotions: parsed.promotions ?? DEFAULT_PREFERENCES.promotions,
      new_products: parsed.new_products ?? DEFAULT_PREFERENCES.new_products,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function saveNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
  // TODO: persist on the backend so it actually controls what is sent, e.g.
  //   await apiRequest("/<endpoint>.php", { method: "POST", body: prefs });
  // The endpoint should update the preferences for the logged-in vendor
  // (the mobile app stores them per push token in save-push-token.php).
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}