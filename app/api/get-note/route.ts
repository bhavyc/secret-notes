import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { UAParser } from "ua-parser-js";

// Type Definition for better code safety
interface NoteData {
  text: string;
  type: 'text' | 'image' | 'audio';
  isBurnAfterReading: boolean;
  password?: string | null;
  decoyPassword?: string | null;
  decoyMessage?: string | null;
  allowedCountry?: string;
  trackingId?: string;
}

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { noteId, password } = body;

    // Validation: Early return if ID is missing
    if (!noteId) {
      return NextResponse.json({ success: false, message: "Note ID is required." }, { status: 400 });
    }

    // Fetch Note from Database
    const rawData = await redis.get(noteId);

    if (!rawData) {
      return NextResponse.json({ success: false, message: "This note has expired or does not exist." });
    }

    // Handle Upstash response type (Object or String)
    const noteData: NoteData = typeof rawData === 'object' ? (rawData as NoteData) : JSON.parse(rawData as string);

    // ---------------------------------------------------------
    // SECURITY LAYER 1: Geo-Fencing (Location Lock)
    // ---------------------------------------------------------
    const userCountry = req.headers.get("x-vercel-ip-country");
    
    if (noteData.allowedCountry && noteData.allowedCountry !== 'Global') {
      if (userCountry && userCountry !== noteData.allowedCountry) {
        return NextResponse.json({ 
          success: false, 
          message: `Access Denied. This note is restricted to: ${noteData.allowedCountry}` 
        });
      }
    }

    // ---------------------------------------------------------
    // SECURITY LAYER 2: Decoy Mode (Honeypot)
    // ---------------------------------------------------------
    // Agar user ne Decoy Password dala hai, toh Fake content dikhao
    // IMPORTANT: Is case mein note delete (burn) nahi karna hai.
    if (noteData.decoyPassword && password === noteData.decoyPassword) {
      return NextResponse.json({ 
        success: true, 
        note: noteData.decoyMessage || "Decoy Message", 
        type: 'text',
        isDecoy: true 
      });
    }

    // ---------------------------------------------------------
    // SECURITY LAYER 3: Real Password Check
    // ---------------------------------------------------------
    if (noteData.password && noteData.password !== password) {
      return NextResponse.json({ 
        success: false, 
        isPasswordRequired: true, 
        message: "Incorrect Password." 
      });
    }

    // ---------------------------------------------------------
    // ACTION: Tracking & Analytics (Update Spy Dashboard)
    // ---------------------------------------------------------
    if (noteData.trackingId) {
      const forwardedFor = req.headers.get("x-forwarded-for");
      const ip = forwardedFor ? forwardedFor.split(',')[0] : "Unknown IP";
      
      const userAgent = req.headers.get("user-agent") || "Unknown Device";
      const parser = new UAParser(userAgent);
      const deviceName = `${parser.getOS().name || 'Unknown OS'} - ${parser.getBrowser().name || 'Browser'}`;

      // Tracking info ko update karo (Async, wait karne ki zaroorat nahi)
      redis.set(`track:${noteData.trackingId}`, JSON.stringify({
        status: "Read",
        readAt: new Date().toISOString(),
        ip: ip,
        device: deviceName
      }), { ex: 7 * 24 * 60 * 60 }); // Keep history for 7 days
    }

    // ---------------------------------------------------------
    // FINAL ACTION: Burn Logic (Self-Destruct)
    // ---------------------------------------------------------
    if (noteData.isBurnAfterReading) {
      await redis.del(noteId);
    }

    // Success Response
    return NextResponse.json({ 
      success: true, 
      note: noteData.text, 
      type: noteData.type 
    });

  } catch (error) {
    console.error("Get Note API Error:", error); // Production logging
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}