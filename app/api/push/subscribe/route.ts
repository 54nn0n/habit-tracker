import { Redis } from "@upstash/redis";
import { Client } from "@upstash/qstash";

interface SubscribeBody {
  subscription: PushSubscriptionJSON;
  cron: string;
  deviceId: string;
}

interface StoredSub {
  subscription: PushSubscriptionJSON;
  scheduleId: string;
}

const redis = Redis.fromEnv();
const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

function getOrigin(request: Request): string {
  // Vercel sets x-forwarded-proto and x-forwarded-host for the public URL
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  return `${proto}://${host}`;
}

export async function GET(request: Request): Promise<Response> {
  const deviceId = new URL(request.url).searchParams.get("deviceId");
  if (!deviceId) return Response.json({ active: false });
  const stored = await redis.get<StoredSub>(`push:sub:${deviceId}`);
  return Response.json({ active: !!stored?.scheduleId });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    console.log("Subscribe POST body:", JSON.stringify(body, null, 2));
    const { subscription, cron, deviceId }: SubscribeBody = body;

    if (!subscription || !cron || !deviceId) {
      console.error("Missing required fields:", { subscription: !!subscription, cron, deviceId });
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await redis.get<StoredSub>(`push:sub:${deviceId}`);
    console.log("Existing sub for device:", deviceId, !!existing);

    const destination = `${getOrigin(request)}/api/push/send`;
    console.log("QStash destination:", destination);

    // Create new schedule before deleting old — avoids a gap if create fails
    const { scheduleId } = await qstash.schedules.create({
      destination,
      cron,
      body: JSON.stringify({ deviceId }),
      headers: { "Content-Type": "application/json" },
    });
    console.log("Created QStash schedule:", scheduleId);

    await redis.set<StoredSub>(`push:sub:${deviceId}`, {
      subscription,
      scheduleId,
    });
    console.log("Stored sub in Redis for device:", deviceId);

    if (existing?.scheduleId) {
      await qstash.schedules.delete(existing.scheduleId).catch((err) => {
        console.warn("Failed to delete existing schedule:", existing.scheduleId, err);
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error in subscribe POST:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
