import {z} from "zod";
import {infrai} from "./infrai_client.js";

export const checkoutRequest = z.object({tenantId: z.string().min(1), orderId: z.string().min(1), customerEmail: z.string().email(), totalCents: z.number().int().nonnegative()});
export type CheckoutRequest = z.infer<typeof checkoutRequest>;
export type OrderUpdate = {status: "paid" | "fulfilled"; message: string};

export function nextOrderUpdate(hasReceipt: boolean, fulfilled: boolean): OrderUpdate {
  if (!hasReceipt) return {status: "paid", message: "Payment captured; receipt upload pending"};
  if (!fulfilled) return {status: "paid", message: "Receipt stored; fulfillment queued"};
  return {status: "fulfilled", message: "Order fulfilled; customer notified"};
}

export async function beginCheckout(input: unknown) {
  const request = checkoutRequest.parse(input);
  const bucket = `tenant-${request.tenantId}`;
  await infrai.storage.bucket.create({name: bucket});
  const key = `receipts/${request.orderId}.json`;
  const receiptUpload = await infrai.storage.object.presign(bucket, key, {op: "put", content_type: "application/json", expires_seconds: 600, idempotency_key: `checkout-${request.orderId}`});
  return {bucket, key, receiptUpload, update: nextOrderUpdate(false, false)};
}
