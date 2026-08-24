import { apiGet } from "./client";
import type { Order } from "./types";

export type { Order };

export function getOrders(): Promise<{ orders: Order[] }> {
  return apiGet("/get-orders.php");
}