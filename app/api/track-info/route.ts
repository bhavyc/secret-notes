import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trackingId } = body;

    // Tracking info fetch karo
    const data = await redis.get("track:" + trackingId);

    if (!data) {
      return NextResponse.json({ success: false, message: "Not found" });
    }

    return NextResponse.json({ success: true, info: data });

  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}