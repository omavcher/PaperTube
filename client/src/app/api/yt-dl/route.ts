import { NextRequest, NextResponse } from "next/server";

const API_AUTH = "20250901majwlqo";
const API_DOMAIN = "api-ak.vidssave.com";
const API_BASE = "https://api.vidssave.com/api/contentsite_api/media/parse";

export async function POST(req: NextRequest) {
  try {
    const { link } = await req.json();
    if (!link) {
      return NextResponse.json({ error: "No link provided" }, { status: 400 });
    }

    const formData = new URLSearchParams();
    formData.append("auth", API_AUTH);
    formData.append("domain", API_DOMAIN);
    formData.append("origin", "source");
    formData.append("link", link);

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Upstream API error" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("[yt-dl] Error:", e);
    return NextResponse.json({ error: "Failed to fetch video info" }, { status: 500 });
  }
}
