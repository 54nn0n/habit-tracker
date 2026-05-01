import { Redis } from "@upstash/redis";
import webPush from "web-push";

interface StoredSub {
  subscription: PushSubscriptionJSON;
}

const redis = Redis.fromEnv();

export async function POST(request: Request): Promise<Response> {
  try {
    const subject = process.env.VAPID_SUBJECT;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!subject || !publicKey || !privateKey) {
      console.error("Missing VAPID environment variables:", {
        subject: !!subject,
        publicKey: !!publicKey,
        privateKey: !!privateKey,
      });
      return Response.json({ error: "Server configuration error" }, { status: 500 });
    }

    const cleanSubject = subject.trim().replace(/^["']|["']$/g, "");
    const cleanPublicKey = publicKey.trim().replace(/^["']|["']$/g, "");
    const cleanPrivateKey = privateKey.trim().replace(/^["']|["']$/g, "");

    webPush.setVapidDetails(cleanSubject, cleanPublicKey, cleanPrivateKey);

    const body = await request.json();
    const { deviceId }: { deviceId: string } = body;
    console.log("Test Push POST for device:", deviceId);

    if (!deviceId) {
      return Response.json({ error: "Missing deviceId" }, { status: 400 });
    }

    const stored = await redis.get<StoredSub>(`push:sub:${deviceId}`);
    console.log("Stored sub for test:", !!stored, !!stored?.subscription);

    if (!stored?.subscription) {
      return Response.json({ error: "No subscription found" }, { status: 404 });
    }

    const { endpoint, keys, expirationTime } = stored.subscription;
    if (!endpoint || !keys?.auth || !keys?.p256dh) {
      console.error("Invalid subscription object:", JSON.stringify(stored.subscription));
      return Response.json({ error: "Invalid subscription" }, { status: 400 });
    }

    try {
      console.log("Sending test notification to endpoint:", endpoint);
      const result = await webPush.sendNotification(
        {
          endpoint,
          keys: { auth: keys.auth, p256dh: keys.p256dh },
          expirationTime: expirationTime ?? null,
        },
        JSON.stringify({ title: "93 HABITS", body: "Don't break the streak! Log your habits for today." }),
      );
      console.log("WebPush result status:", result.statusCode);
    } catch (err: unknown) {
      console.error("WebPush send failed:", err);
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) {
        console.log("Subscription expired, deleting from Redis");
        await redis.del(`push:sub:${deviceId}`);
        return Response.json({ error: "Subscription expired" }, { status: 410 });
      }
      return Response.json(
        { error: "Send failed", details: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error in test push POST:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
