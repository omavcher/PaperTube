import type { Metadata } from "next";
import LeaderboardClient from "./LeaderboardClient";

// --- Types ---
interface BadgeItem {
  id: string;
  tier: "basic" | "master" | "legendary";
  name: string;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  avatarUrl: string;
  totalXP: number;
  badges: BadgeItem[];
  isCurrentUser?: boolean;
}

interface ApiUserResponse {
  position: number;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  xp: number;
  badge: string; 
}

interface ApiResponse {
  success: boolean;
  leaderboard: ApiUserResponse[];
  currentUserRank: ApiUserResponse | null;
}

// --- 1. Server-Side Fetch ---
async function getLeaderboardData(): Promise<LeaderboardUser[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";
  const endpoint = `${baseUrl}/api/users/get-groble-leaderboard`;

  try {
    // We pass a generic ID for the SEO/Public view
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "guest_seo_bot" }),
      cache: "no-store", // Real-time ranking
    });

    if (!res.ok) return [];

    const json: ApiResponse = await res.json();
    if (!json.success) return [];

    // Transform API Data to UI Data
    return json.leaderboard.map((user) => {
      const tier = ["basic", "master", "legendary"].includes(user.badge) 
        ? (user.badge as "basic" | "master" | "legendary") 
        : "basic";

      return {
        rank: user.position,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatar,
        totalXP: user.xp,
        badges: [{ 
            id: `badge-${user.userId}`, 
            tier: tier, 
            name: user.badge.charAt(0).toUpperCase() + user.badge.slice(1) 
        }],
        isCurrentUser: false // Server doesn't know the user
      };
    });

  } catch (error) {
    console.error("🚨 [LEADERBOARD FETCH ERROR]", error);
    return [];
  }
}

// --- 2. Metadata ---
export const metadata: Metadata = {
  title: "Global Leaderboard | Top Engineering Students | PaperTube",
  description: "Check the top-ranking engineering students on PaperTube. Earn XP, unlock badges, and compete globally.",
  openGraph: {
    title: "PaperTube Global Rankings",
    description: "Who is #1? Compete with thousands of students.",
    url: "https://papertube.in/leaderboard",
    siteName: "PaperTube",
    type: "website",
  },
};

// --- 3. Page Component ---
export default async function LeaderboardPage() {
  const initialLeaderboard = await getLeaderboardData();

  // JSON-LD Structured Data (Dataset/Table)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Table",
    "about": "Student Rankings",
    "name": "Global Leaderboard",
    "description": "Ranking of students based on XP and achievements."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LeaderboardClient initialData={initialLeaderboard} />
    </>
  );
}