import * as fs from "fs";
import * as path from "path";
import axios from "axios";

// Interface matching backlink-data.json structure
interface BacklinkItem {
  id: string;
  domain: string;
  url: string;
  da: number;
  type: string;
  status: "Active" | "Missing" | "No-Follow";
  anchorText: string;
  dateDiscovered: string;
  lastChecked: string;
  notes: string;
}

const DATA_PATH = path.join(__dirname, "../src/data/backlink-data.json");

// Simple user agent to avoid bot blocks
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function verifyBacklink(item: BacklinkItem): Promise<Partial<BacklinkItem>> {
  console.log(`Checking link ID: ${item.id} - ${item.url}...`);
  try {
    const response = await axios.get(item.url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 8000,
      validateStatus: () => true, // resolve promise for any status code
    });

    if (response.status !== 200) {
      console.warn(`  [Warning] HTTP status ${response.status} returned for ${item.url}`);
      return { status: "Missing", lastChecked: new Date().toISOString() };
    }

    const html = response.data;
    if (typeof html !== "string") {
      console.warn(`  [Warning] Response data is not string for ${item.url}`);
      return { status: "Missing", lastChecked: new Date().toISOString() };
    }

    // RegEx to find links pointing to paperxify.com
    // Matches href="https://paperxify.com", href="http://www.paperxify.com/resources", etc.
    const linkRegex = /<a\s+[^>]*href=["'](https?:\/\/(?:[a-zA-Z0-9-]+\.)*paperxify\.com[^"']*)["'][^>]*>(.*?)<\/a>/gi;

    let match;
    let found = false;
    let isNoFollow = false;
    let extractedAnchor = "";

    // Loop through all matches in the HTML source
    while ((match = linkRegex.exec(html)) !== null) {
      found = true;
      const fullLinkTag = match[0];
      const anchorContent = match[2];

      // Clean anchor tag content (strip HTML tags)
      extractedAnchor = anchorContent.replace(/<[^>]*>/g, "").trim();

      // Check for nofollow rel attribute
      if (/rel=["'][^"']*nofollow[^"']*["']/i.test(fullLinkTag)) {
        isNoFollow = true;
      }
    }

    if (found) {
      const finalStatus = isNoFollow ? "No-Follow" : "Active";
      console.log(`  [Success] Link found! Status: ${finalStatus}, Anchor: "${extractedAnchor}"`);
      return {
        status: finalStatus,
        anchorText: extractedAnchor || item.anchorText || "Paperxify",
        lastChecked: new Date().toISOString(),
      };
    } else {
      console.log(`  [Missing] Link to paperxify.com was not found in page body.`);
      return { status: "Missing", lastChecked: new Date().toISOString() };
    }
  } catch (error: any) {
    console.error(`  [Error] Failed to fetch target URL: ${error.message}`);
    return { status: "Missing", lastChecked: new Date().toISOString() };
  }
}

async function run() {
  console.log("=========================================");
  console.log("  Paperxify Backlink Verifier Script");
  console.log("=========================================");

  if (!fs.existsSync(DATA_PATH)) {
    console.error(`Error: Backlink database not found at ${DATA_PATH}`);
    process.exit(1);
  }

  const fileContents = fs.readFileSync(DATA_PATH, "utf-8");
  let backlinks: BacklinkItem[] = [];

  try {
    backlinks = JSON.parse(fileContents);
  } catch (e: any) {
    console.error(`Error parsing JSON data: ${e.message}`);
    process.exit(1);
  }

  console.log(`Loaded ${backlinks.length} backlink records.`);

  const updatedBacklinks: BacklinkItem[] = [];

  for (const item of backlinks) {
    // For local test/demonstration cases where URLs are dummy/external and might reject bots, 
    // we only attempt actual pings for real URLs. If the domain is localhost or mock, we simulate check.
    if (item.url.includes("mock") || item.url.includes("example.com")) {
      console.log(`Simulating check for mock URL: ${item.url}`);
      updatedBacklinks.push({
        ...item,
        lastChecked: new Date().toISOString(),
      });
    } else {
      const updates = await verifyBacklink(item);
      updatedBacklinks.push({
        ...item,
        ...updates,
      } as BacklinkItem);
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(updatedBacklinks, null, 2), "utf-8");
  console.log("=========================================");
  console.log("Database updated successfully.");
  console.log("=========================================");
}

run();
