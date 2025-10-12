const fetch = require("node-fetch");

// Function to get image links from Google Custom Search
const getImgLink = async (query, count = 1) => {
  try {
    const apiKey = 'AIzaSyAkD0dWuBRTharsqXlhh-Bv05ek6AdzhlI'; // Your Google API Key
    const cx = '6606604e9a50d4c0d';                            // Your Custom Search Engine ID

    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&cx=${cx}&searchType=image&num=${count}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log("No images found for query:", query);
      return [];
    }

    // Filter out social media domains
    const blockedDomains = ["instagram.com", "facebook.com", "twitter.com", "pinterest.com"];
    const imgLinks = data.items
      .filter(item => !blockedDomains.some(domain => item.displayLink.includes(domain)))
      .map(item => item.link);

    if (imgLinks.length === 0) {
      console.log("No suitable web images found (social media filtered).");
      return [];
    }

    return imgLinks;
  } catch (err) {
    console.error("Error fetching image links:", err);
    return [];
  }
};

// Example usage
const query = "CISC vs RISC diagram";

getImgLink(query, 1).then((links) => {
  console.log("Image URLs for:", query);
  links.forEach((link, index) => {
    console.log(`${index + 1}: ${link}`);
  });
});
