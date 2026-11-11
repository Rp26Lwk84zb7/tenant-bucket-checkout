import {beginCheckout} from "./order_service.js";

const input = {tenantId: process.env.TENANT_ID ?? "demo-shop", orderId: process.env.ORDER_ID ?? "order-1001", customerEmail: process.env.CUSTOMER_EMAIL ?? "buyer@example.com", totalCents: 2599};
const result = await beginCheckout(input);
console.log(JSON.stringify(result, null, 2));
