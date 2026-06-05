import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { noteTitle, noteContent, notionToken } = await request.json();

    if (!noteTitle || !noteContent || !notionToken) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }

    // 1. Search for available parent pages in Notion
    const searchResponse = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        filter: {
          property: 'object',
          value: 'page'
        },
        page_size: 1
      })
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Notion search error:', searchData);
      return NextResponse.json({ success: false, message: 'Failed to access Notion pages' }, { status: 500 });
    }

    const parentPage = searchData.results?.[0];
    if (!parentPage) {
      return NextResponse.json({ 
        success: false, 
        message: 'No shared pages found. Please share at least one page with your Notion connection.' 
      }, { status: 400 });
    }

    // 2. Convert markdown/html content to Notion blocks
    const childrenBlocks = markdownToNotionBlocks(noteContent);

    // 3. Create page in Notion
    const createResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { page_id: parentPage.id },
        properties: {
          title: [
            {
              text: {
                content: noteTitle
              }
            }
          ]
        },
        children: childrenBlocks
      })
    });

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      console.error('Notion page creation error:', createData);
      return NextResponse.json({ success: false, message: 'Failed to create page in Notion' }, { status: 500 });
    }

    return NextResponse.json({ success: true, pageUrl: createData.url });
  } catch (error: any) {
    console.error('Notion sync error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}

function markdownToNotionBlocks(markdown: string) {
  // Strip HTML tags if present, or just split by lines
  const cleanMarkdown = markdown.replace(/<[^>]*>/g, '');
  const lines = cleanMarkdown.split('\n');
  const blocks = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: trimmed.substring(2) } }]
        }
      });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: trimmed.substring(3) } }]
        }
      });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: trimmed.substring(4) } }]
        }
      });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: trimmed.replace(/^[-*]\s+/, '') } }]
        }
      });
    } else {
      const content = trimmed.substring(0, 1900);
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content } }]
        }
      });
    }
  }
  
  return blocks.slice(0, 95);
}
