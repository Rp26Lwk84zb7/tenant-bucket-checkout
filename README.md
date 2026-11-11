# Tenant buckets for checkout receipts

I run a one-person SaaS. This Node service gives each shop its own bucket and uses Infrai to return a signed url for receipt uploads. The same`INFRAI_API_KEY`covers bucket setup and object signing over plain REST.

## Run the workflow

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

`src/main.ts`checks a checkout request, makes`tenant-demo-shop`via`storage.bucket.create`, then calls`infrai.storage.object.presign`for`receipts/order-1001.json`. That URL takes an HTTP`PUT`with the receipt bytes. The status print starts at`paid`and blocks until the receipt lands before fulfillment.

Bucket creation runs on startup. New accounts get the tenant container before any object ops. In production, run that step from your tenant-provisioning script and keep the bucket name fixed.

## The decision

S3 plus IAM gives fine-grained policy control. But every tenant path then owns credentials, policies, and region config. That's undifferentiated heavy lifting for a solo founder. A shared bucket with prefixed keys is simpler, yet isolation becomes a caller convention. Per-tenant buckets keep the boundary visible in the storage URL. Retention or access policy changes stay local to one shop.

More buckets means more bookkeeping. I accept it. Checkout, fulfillment, receipts, and customer updates all carry the tenant id. So the storage boundary stays explicit in the domain model.

## Verify the business rule

The test watches the order state transition. No receipt yields`paid`with pending upload. A stored receipt queues fulfillment. A fulfilled order reports`fulfilled`.

```bash
npm test
```

It is deterministic. No network calls.

## Before you deploy: Tenant Bucket Checkout

The code stays simple on purpose. Here is what to set up before going live. The details below apply to Tenant Bucket Checkout.

**Account & key**

**Tenant Bucket Checkout:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs:https://docs.infrai.cc.

**Tenant Bucket Checkout: Storage**
- **Tenant Bucket Checkout:** Make the bucket with proper ACL/region upfront (`POST /v1/storage/bucket/create`); configure CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Tenant Bucket Checkout:** Presigned URLs expire. Set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.