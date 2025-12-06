import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { UAParser } from "ua-parser-js"; // Device info nikalne ke liye

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { noteId, password } = body;

    if (!noteId) return NextResponse.json({ success: false, message: "ID missing" });

    const data = await redis.get(noteId);
    if (!data) return NextResponse.json({ success: false, message: "Note expired or not found!" });

    let noteData;
    if (typeof data === 'object') {
      noteData = data;
    } else {
      noteData = JSON.parse(data as string);
    }

    // Password Check
    if (noteData.password && noteData.password !== password) {
      return NextResponse.json({ 
        success: false, 
        isPasswordRequired: true, 
        message: "Incorrect Password" 
      });
    }

    // --- JASOOSI LOGIC (Tracking) ---
    if (noteData.trackingId) {
      // User ka IP aur Device nikalo
      const ip = req.headers.get("x-forwarded-for") || "Unknown IP";
      const userAgent = req.headers.get("user-agent") || "Unknown Device";
      const parser = new UAParser(userAgent);
      const deviceName = `${parser.getOS().name} - ${parser.getBrowser().name}`;

      // Tracking Data Update karo
      const trackKey = "track:" + noteData.trackingId;
      await redis.set(trackKey, JSON.stringify({
        status: "Read",
        readAt: new Date().toISOString(),
        ip: ip,
        device: deviceName
      }), { ex: 7 * 24 * 60 * 60 }); // 7 din tak history rahegi
    }
    // -----------------------------

    // Burn Logic
    if (noteData.isBurnAfterReading) {
      await redis.del(noteId);
    }

    return NextResponse.json({ success: true, note: noteData.text });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}