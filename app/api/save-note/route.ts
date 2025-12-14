import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      text,            // Content (Text/Base64)
      type,            // 'text' | 'image' | 'audio'
      expiryMode, 
      password,
      decoyPassword,   // Fake password
      decoyMessage,    // Fake message
      allowedCountry   // Geo-fencing
    } = body;

    // Validation: Agar content nahi hai toh error do
    if (!text) {
      return NextResponse.json({ success: false, message: "Content missing" }, { status: 400 });
    }

    // Unique IDs generate karo
    const noteId = Math.random().toString(36).substring(2, 8);
    const trackingId = Math.random().toString(36).substring(2, 8);

    // Expiry Logic Set Karo
    let ttl = 24 * 60 * 60; // Default: 24 Hours
    let isBurnAfterReading = true;

    if (expiryMode === "1hour") {
      ttl = 60 * 60;
      isBurnAfterReading = false;
    } else if (expiryMode === "24hours") {
      ttl = 24 * 60 * 60;
      isBurnAfterReading = false;
    }

    // Main Data Object
    const noteData = {
      text,
      type: type || 'text',
      isBurnAfterReading,
      password: password || null,
      decoyPassword: decoyPassword || null,
      decoyMessage: decoyMessage || null,
      allowedCountry: allowedCountry || 'Global',
      trackingId
    };

    // Tracking Initial Data
    const trackingData = {
      createdAt: new Date().toISOString(),
      status: "Unread"
    };

    // --- PRO MOVE: Promise.all ---
    // Hum teeno kaam (Save Note, Init Tracking, Count Stats) ek saath karenge
    // Isse server ka response time fast ho jayega
    await Promise.all([
      // 1. Note Save karo
      redis.set(noteId, JSON.stringify(noteData), { ex: ttl }),
      
      // 2. Tracking Start karo (7 din tak rahega record)
      redis.set("track:" + trackingId, JSON.stringify(trackingData), { ex: 7 * 24 * 60 * 60 }),

      // 3. GLOBAL COUNTER (Growth Hack) 🚀
      // Ye count karega ki total kitne notes bane aaj tak
      redis.incr("stats:total_notes_created")
    ]);

    return NextResponse.json({ success: true, noteId, trackingId });

  } catch (error) {
    console.error("Save Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}