import {strict as assert} from "node:assert";
import {nextOrderUpdate} from "./order_service.js";

assert.deepEqual(nextOrderUpdate(false, false), {status: "paid", message: "Payment captured; receipt upload pending"});
assert.deepEqual(nextOrderUpdate(true, false), {status: "paid", message: "Receipt stored; fulfillment queued"});
assert.deepEqual(nextOrderUpdate(true, true), {status: "fulfilled", message: "Order fulfilled; customer notified"});
console.log("order decision test passed");
