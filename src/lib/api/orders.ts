import { apiRequest } from "./client";
import type { Order } from "./types";

export function getOrders(): Promise<{ orders: Order[] }> {
  return apiRequest("/get-orders.php", { method: "GET" });
}
