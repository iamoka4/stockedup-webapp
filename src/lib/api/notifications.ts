import { apiRequest } from "./client";

// Same endpoints and response shape as the mobile NotificationsInbox screen:
//   GET  /get-notifications.php?page=N&limit=N  -> { notifications, unread_count, pagination }
//   POST /mark-notifications-read.php           -> { all: true } or { notification_id }

export interface VendorNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  reference_id: number | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsPage {
  notifications: VendorNotification[];
  unread_count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

type RawResponse = NotificationsPage | { data?: NotificationsPage };

// Mobile accepts the payload either at the top level or nested under `data`.
function unwrap(res: RawResponse): NotificationsPage | null {
  if (res && "notifications" in res && res.notifications) return res as NotificationsPage;
  const inner = (res as { data?: NotificationsPage } | null)?.data;
  return inner?.notifications ? inner : null;
}

export async function getNotifications(page = 1, limit = 20): Promise<NotificationsPage> {
  const res = await apiRequest<RawResponse>(`/get-notifications.php?page=${page}&limit=${limit}`);
  const payload = unwrap(res);
  if (!payload) throw new Error("Unexpected notifications response");
  return payload;
}

/** Number shown on the bell badge on the home screen. */
export async function getUnreadNotificationCount(): Promise<number> {
  const payload = await getNotifications(1, 1);
  return payload.unread_count ?? 0;
}

export function markNotificationRead(id: number): Promise<unknown> {
  return apiRequest("/mark-notifications-read.php", {
    method: "POST",
    body: { notification_id: id },
  });
}

export function markAllNotificationsRead(): Promise<unknown> {
  return apiRequest("/mark-notifications-read.php", {
    method: "POST",
    body: { all: true },
  });
}