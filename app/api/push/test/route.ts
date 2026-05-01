import { Redis } from "@upstash/redis";
import webPush from "web-push";

interface StoredSub {
  subscription: PushSubscriptionJSON;
}

const redis = Redis.fromEnv();

export async function POST(request: Request): Promise<Response> {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const { deviceId }: { deviceId: string } = await request.json();

  const stored = await redis.get<StoredSub>(`push:sub:${deviceId}`);
  if (!stored?.subscription) {
    return Response.json({ error: "No subscription found" }, { status: 404 });
  }

  const { endpoint, keys, expirationTime } = stored.subscription;
  if (!endpoint || !keys?.auth || !keys?.p256dh) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  try {
    await webPush.sendNotification(
      {
        endpoint,
        keys: { auth: keys.auth, p256dh: keys.p256dh },
        expirationTime: expirationTime ?? null,
      },
      JSON.stringify({ title: "93 HABITS", body: "Test notification." }),
    );
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    if (status === 404 || status === 410) {
      await redis.del(`push:sub:${deviceId}`);
      return Response.json({ error: "Subscription expired" }, { status: 410 });
    }
    return Response.json({ error: "Send failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
