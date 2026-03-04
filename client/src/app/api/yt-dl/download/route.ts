import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get("url");
  const filename = searchParams.get("filename") ?? "download";

  if (!videoUrl) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    const upstream = await fetch(videoUrl, {
      headers: {
        // Mimic a normal browser request so Google CDN accepts it
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.youtube.com/",
        "Origin": "https://www.youtube.com",
      },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const contentLength = upstream.headers.get("content-length");

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Content-Type", contentType);
    if (contentLength) headers.set("Content-Length", contentLength);
    // Allow streaming
    headers.set("Cache-Control", "no-store");

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch (e) {
    console.error("[yt-dl/download] Error:", e);
    return NextResponse.json({ error: "Download proxy failed" }, { status: 500 });
  }
}
