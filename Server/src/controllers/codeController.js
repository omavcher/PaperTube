const mongoose = require('mongoose');
const CodeSolution = require('../models/CodeSolution');
const User = require('../models/User');
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const FREE_MODELS = [
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openrouter/free",
  "nvidia/nemotron-nano-12b-v2-vl:free"
];
const PREMIUM_MODEL_ID = "x-ai/grok-4.1-fast";

async function generateWithOpenRouter(systemPrompt, userPrompt, model) {
    const isFreeModel = model === 'sankshipta' || model === 'bhashasetu';
    let targetModelId = isFreeModel ? FREE_MODELS[0] : PREMIUM_MODEL_ID;
    
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://paperxify.com",
            "X-Title": "Paperxify Code Gen"
        },
        body: JSON.stringify({ model: targetModelId, messages, temperature: 0.2, stream: false })
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: OpenRouter failed`);
    }
    const data = await res.json();
    return { response: data.choices[0].message.content, model: targetModelId };
}
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

const extractProblemInfo = (urlStr) => {
    try {
        let fullUrl = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
        const urlObj = new URL(fullUrl);
        const host = urlObj.hostname.replace('www.', '').toLowerCase();
        const segments = urlObj.pathname.split('/').filter(Boolean);
        
        let platform = host.split('.')[0];
        platform = platform.charAt(0).toUpperCase() + platform.slice(1);
        let title = null;

        if (host.includes('leetcode')) {
            platform = "LeetCode";
            const slug = segments[segments.indexOf('problems') + 1];
            if (slug) title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        } else if (host.includes('hackerrank')) {
            platform = "HackerRank";
            const slug = segments[segments.indexOf('challenges') + 1];
            if (slug) title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        } else if (host.includes('codeforces')) {
            platform = "Codeforces";
            if (segments.includes('problemset') && segments.includes('problem')) {
                const idx = segments.indexOf('problem');
                if (segments.length > idx + 2) title = `Problem ${segments[idx+2]} (Contest ${segments[idx+1]})`;
            } else if (segments.includes('contest') && segments.includes('problem')) {
                const cIdx = segments.indexOf('contest');
                const pIdx = segments.indexOf('problem');
                if (segments.length > pIdx + 1) title = `Problem ${segments[pIdx+1]} (Contest ${segments[cIdx+1]})`;
            }
        } else if (host.includes('geeksforgeeks')) {
            platform = "GeeksForGeeks";
            const slug = segments[segments.indexOf('problems') + 1];
            if (slug) {
                let clean = slug.replace(/\d+$/, '');
                title = clean.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').trim();
            }
        } else if (host.includes('codechef')) {
            platform = "CodeChef";
            const slug = segments[segments.indexOf('problems') + 1];
            if (slug) title = `${slug.toUpperCase()}`;
        } else if (host.includes('atcoder')) {
            platform = "AtCoder";
            const slug = segments[segments.indexOf('tasks') + 1];
            if (slug) title = slug.toUpperCase();
        } else if (host.includes('codingninjas')) {
            platform = "Coding Ninjas";
            if (segments.includes('problems')) title = segments[segments.indexOf('problems') + 1]?.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }

        if (!title) {
            const last = segments[segments.length - 1];
            if (last && last.length > 2 && !last.includes('.')) {
                title = last.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            } else {
                title = "Algorithm Activity"; 
            }
        }

        return { platform, title: title.substring(0, 80) };
    } catch(e) {
        return { platform: "Workspace", title: "Algorithm Source" };
    }
};

const fetchLeetcodeData = async (titleSlug) => {
    try {
        const query = `
            query questionData($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    title
                    content
                    difficulty
                }
            }
        `;
        const response = await axios.post('https://leetcode.com/graphql', {
            query,
            variables: { titleSlug }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': `https://leetcode.com/problems/${titleSlug}/`
            }
        });
        return response.data?.data?.question;
    } catch (e) {
        // Silently fail, handle later
        return null;
    }
};

const fetchGenericProblemData = async (url) => {
    try {
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        const response = await axios.get(fullUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 8000
        });
        const $ = cheerio.load(response.data);
        // Try to get title
        let title = $('title').text() || 'Coding Problem';
        title = title.replace(/\n/g, '').trim();
        // Try to extract body, but remove script/style tags
        $('script, style, noscript, iframe, img, svg, nav, footer, header').remove();
        let content = $('body').text().replace(/\s+/g, ' ').trim();
        // Truncate to avoid massive payloads
        if (content.length > 5000) {
            content = content.substring(0, 5000) + '...';
        }
        return { title, content, difficulty: 'Unknown' };
    } catch (e) {
        return null;
    }
};

exports.generateCodeSolution = async (req, res) => {
    try {
        const { problemUrl, prompt, model, settings } = req.body;
        const codeLanguage = settings?.codeLanguage || 'C++';
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!problemUrl) {
            return res.status(400).json({ success: false, message: "Problem URL is required" });
        }

        // Deduct Tokens for Free users (assumes same token deduction system as before)
        const isFreeModel = model === 'sankshipta' || model === 'bhashasetu';
        const cost = 8; // 8 tokens for code solution
        if (!user.isSubscribed && isFreeModel) {
            if (user.neuralTokens < cost) {
                return res.status(403).json({
                    success: false,
                    code: 'INSUFFICIENT_TOKENS',
                    message: `You need ${cost} tokens to generate a code solution, but you only have ${user.neuralTokens} left.`,
                    requiredTokens: cost,
                    currentTokens: user.neuralTokens,
                    canPurchase: true
                });
            }
        }

        // Intelligent Local Extraction
        let fullUrl = problemUrl.startsWith('http') ? problemUrl : `https://${problemUrl}`;
        const extracted = extractProblemInfo(fullUrl);
        platform = extracted.platform;
        problemTitle = extracted.title;
        problemDifficulty = 'Unknown';
        problemContent = `Please provide the optimal solution for the problem conceptually named "${problemTitle}" on ${platform}. Target URL: ${fullUrl}`;

        // Attempt HTTP scraping to augment context
        if (platform === "LeetCode") {
            const lcMatch = fullUrl.match(/leetcode\.com\/problems\/([^/]+)/);
            if (lcMatch) {
                const lcData = await fetchLeetcodeData(lcMatch[1]);
                if (lcData) {
                    problemTitle = lcData.title || problemTitle;
                    problemDifficulty = lcData.difficulty || 'Unknown';
                    if (lcData.content) {
                        const $ = cheerio.load(lcData.content);
                        problemContent = $.text().replace(/\s+/g, ' ').trim();
                    }
                }
            }
        } else {
            const genericData = await fetchGenericProblemData(fullUrl);
            if (genericData && genericData.content && genericData.content.length > 50) {
                // Ignore cloudflare/bot blocking titles that override our beautiful extracted titles
                const lowerTitle = (genericData.title || '').toLowerCase();
                if (!lowerTitle.includes('just a moment') && !lowerTitle.includes('attention')) {
                     problemTitle = genericData.title !== 'Coding Problem' ? genericData.title : problemTitle;
                }
                problemContent = genericData.content;
            }
        }

        // Construct Prompts
        const systemPrompt = `You are a senior competitive programmer and CS educator.
Given a coding problem, produce a STRUCTURED response in JSON. No markdown, no prose outside JSON.

Return ONLY a valid JSON object with this exact schema:
{
  "insight": "2-3 sentence core intuition / aha-moment for this problem. Plain English, beginner-friendly.",
  "steps": [
    { "n": 1, "title": "Step title", "body": "Clear explanation of this step in plain English. No code here." }
  ],
  "keyPoints": [
    { "label": "Short label", "value": "Brief value/description" }
  ],
  "code": "The complete, runnable, well-commented code solution.",
  "language": "The programming language used",
  "timeComplexity": "e.g. O(N log N)",
  "spaceComplexity": "e.g. O(N)"
}

Rules:
- steps: 3–5 steps. Each step title is action-oriented (e.g. "Sort the Array", "Use a Sliding Window").
- keyPoints: 2–4 bullet facts (e.g. {label: "Algorithm", value: "Two Pointers"}, {label: "Handles Duplicates", value: "Yes, via Set"}).
- code: Must be in ${codeLanguage || 'C++'}. Include comments explaining key lines.
- Do NOT wrap JSON in markdown fences. Return ONLY the raw JSON.`;

        const userPrompt = `Problem: ${problemTitle}
Platform: ${platform}
Difficulty: ${problemDifficulty}
Requested Language: ${codeLanguage || 'C++'}

Problem Description:
${problemContent}

Extra Request: ${prompt || 'Provide the optimal, production-quality solution.'}
`;

        const { response: openRouterRes } = await generateWithOpenRouter(systemPrompt, userPrompt, model);

        // Parse JSON output
        let parsedData;
        try {
            const cleanRes = openRouterRes.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            parsedData = JSON.parse(cleanRes);
        } catch (e) {
            console.error("Failed to parse JSON", e);
            return res.status(500).json({ success: false, message: "AI response parsing failed." });
        }

        // Save to DB
        const slug = crypto.randomUUID().split('-')[0] + '-' + problemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
        
        const newSolution = new CodeSolution({
            userId: user._id,
            slug,
            problemUrl,
            title: problemTitle,
            difficulty: problemDifficulty,
            platform,
            problemDescription: problemContent,
            solutionContent: parsedData.insight || parsedData.explanation || '',
            solutionSteps: parsedData.steps || [],
            keyPoints: parsedData.keyPoints || [],
            codeSnippet: parsedData.code,
            codeLanguage: parsedData.language || codeLanguage || 'C++',
            timeComplexity: parsedData.timeComplexity,
            spaceComplexity: parsedData.spaceComplexity,
            modelUsed: model,
        });

        await newSolution.save();

        if (!user.isSubscribed && isFreeModel) {
            user.neuralTokens -= cost;
            await user.save();
        }

        return res.status(200).json({
            success: true,
            newSolution,
            tokenInfo: {
                tokensRemaining: user.neuralTokens,
                tokensDeducted: cost,
            }
        });

    } catch (error) {
        console.error("Error generating code solution:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getCodeSolution = async (req, res) => {
    try {
        const solution = await CodeSolution.findOne({ slug: req.params.slug, userId: req.user.id });
        if (!solution) return res.status(404).json({ success: false, message: "Code solution not found." });
        res.status(200).json({ success: true, solution });
    } catch (e) {
        console.error("Get code solution error:", e);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.verifyProblemUrl = async (req, res) => {
    try {
        let { problemUrl } = req.body;
        if (!problemUrl) return res.status(400).json({ success: false, message: "URL required" });
        
        const { platform, title } = extractProblemInfo(problemUrl);
        return res.status(200).json({ success: true, title, platform });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
