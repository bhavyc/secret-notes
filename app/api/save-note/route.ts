import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, expiryMode, password } = body;

    if (!text) return NextResponse.json({ success: false, message: "Empty Note" }, { status: 400 });

    const noteId = Math.random().toString(36).substring(2, 8);
    const trackingId = Math.random().toString(36).substring(2, 8); // Naya ID Tracking ke liye

    let ttl = 24 * 60 * 60; // Default 24 hours
    let isBurnAfterReading = true;

    if (expiryMode === "1hour") {
      ttl = 60 * 60;
      isBurnAfterReading = false;
    } else if (expiryMode === "24hours") {
      ttl = 24 * 60 * 60;
      isBurnAfterReading = false;
    }

    // 1. Secret Note Save karo
    const noteData = {
      text,
      isBurnAfterReading,
      password: password || null,
      trackingId: trackingId // Note ke andar tracking ID chupaya hai
    };
    await redis.set(noteId, JSON.stringify(noteData), { ex: ttl });

    // 2. Tracking Info Save karo (Shuru mein status: Unread)
    // Iski life thodi zyada rakhte hain (e.g., 7 days) taaki sender baad mein bhi check kar sake
    const trackingData = {
      createdAt: new Date().toISOString(),
      status: "Unread",
      readAt: null,
      ip: null,
      device: null
    };
    await redis.set("track:" + trackingId, JSON.stringify(trackingData), { ex: 7 * 24 * 60 * 60 });

    // Frontend ko dono IDs wapis bhejo
    return NextResponse.json({ success: true, noteId, trackingId });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}