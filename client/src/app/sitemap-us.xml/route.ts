import { generateRegionalSitemapXml } from "@/lib/sitemap-helper";
import { NextResponse } from "next/server";

export async function GET() {
  const xml = await generateRegionalSitemapXml("us");
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
