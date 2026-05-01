import { Redis } from "@upstash/redis";
import { Receiver } from "@upstash/qstash";
import webPush from "web-push";

interface StoredSub {
  subscription: PushSubscriptionJSON;
}

const redis = Redis.fromEnv();

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(request: Request): Promise<Response> {
  try {
    const subject = process.env.VAPID_SUBJECT;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!subject || !publicKey || !privateKey) {
      console.error("Missing VAPID environment variables");
      return Response.json({ error: "Server configuration error" }, { status: 500 });
    }

    const cleanSubject = subject.trim().replace(/^["']|["']$/g, "");
    const cleanPublicKey = publicKey.trim().replace(/^["']|["']$/g, "");
    const cleanPrivateKey = privateKey.trim().replace(/^["']|["']$/g, "");

    webPush.setVapidDetails(cleanSubject, cleanPublicKey, cleanPrivateKey);

    const body = await request.text();

  const signature = request.headers.get("upstash-signature") ?? "";
  const isValid = await receiver.verify({ signature, body }).catch(() => false);
  if (!isValid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { deviceId }: { deviceId: string } = JSON.parse(body);
  const stored = await redis.get<StoredSub>(`push:sub:${deviceId}`);
  if (!stored?.subscription) {
    return Response.json({ ok: true });
  }

  const { endpoint, keys, expirationTime } = stored.subscription;
  if (!endpoint || !keys?.auth || !keys?.p256dh) {
    return Response.json({ ok: true });
  }

  try {
    await webPush.sendNotification(
      {
        endpoint,
        keys: { auth: keys.auth, p256dh: keys.p256dh },
        expirationTime: expirationTime ?? null,
      },
      JSON.stringify({ title: "93 HABITS", body: "Don't break the streak! Log your habits for today." }),
    );
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    if (status === 404 || status === 410) {
      await redis.del(`push:sub:${deviceId}`);
    }
  }

  return Response.json({ ok: true });
  } catch (error) {
    console.error("Error in push send POST:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
