const { marked } = require('c:/Users/Om Awchar/Documents/paperxify/Server/node_modules/marked') || require('marked');

const markdownContent = `# Title
This is **bold** text.
<div style="color:red">HTML div block</div>
* List item
`;

const pureHtmlContent = `<div style="background:blue;padding:10px">
  <h1>Title</h1>
  <p>Some paragraph text here.</p>
</div>`;

const mixedContent = `**Human Reproduction and Reproductive Health**
**Subject Domain:** Biology

<div style="border: 1px solid black">
  <h3>Section 1</h3>
  <p>Inside div text</p>
</div>`;

console.log("--- PARSING MARKDOWN ---");
console.log(marked.parse(markdownContent));

console.log("--- PARSING PURE HTML ---");
console.log(marked.parse(pureHtmlContent));

console.log("--- PARSING MIXED ---");
console.log(marked.parse(mixedContent));
