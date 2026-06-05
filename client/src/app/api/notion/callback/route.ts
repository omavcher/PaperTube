import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('http://localhost:3000/youtube-to-notes?notion_error=missing_code');
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;
  const redirectUri = 'http://localhost:3000/api/notion/callback';

  if (!clientId || !clientSecret) {
    console.error('Notion client ID or client secret is not configured in env variables.');
    return NextResponse.redirect('http://localhost:3000/youtube-to-notes?notion_error=missing_credentials');
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('Notion token exchange error:', data);
      return NextResponse.redirect('http://localhost:3000/youtube-to-notes?notion_error=exchange_failed');
    }

    const notionToken = data.access_token;
    const workspaceName = data.workspace_name || 'Notion Workspace';

    // Return HTML script to store tokens in localStorage and redirect back
    return new NextResponse(`
      <html>
        <body>
          <script>
            localStorage.setItem("notion_token", "${notionToken}");
            localStorage.setItem("notion_workspace", "${workspaceName}");
            const redirectBack = localStorage.getItem("notion_redirect_back") || "/youtube-to-notes";
            localStorage.removeItem("notion_redirect_back");
            window.location.href = redirectBack + "?notion_connected=true";
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('Notion connection error:', error);
    return NextResponse.redirect('http://localhost:3000/youtube-to-notes?notion_error=server_error');
  }
}
