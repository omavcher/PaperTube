const axios = require('axios');

const urls = {
  'PRO_MONTHLY': 'https://paperxify.lemonsqueezy.com/checkout/buy/787000c3-f098-48ab-af0d-9f74bed921fb',
  'PRO_YEARLY': 'https://paperxify.lemonsqueezy.com/checkout/buy/aa97d797-00c5-4901-be35-a436f67682ca',
  'POWER_YEARLY': 'https://paperxify.lemonsqueezy.com/checkout/buy/59b780c4-81e0-4c16-8ea5-f56175b2f954',
  'POWER_MONTHLY': 'https://paperxify.lemonsqueezy.com/checkout/buy/b6d2742e-bc6b-49f9-8450-a78062da73a9'
};

async function parseVariantId(name, url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    
    const html = response.data;
    
    // Search for pattern: &quot;variant_id&quot;:1760970 or &quot;variant_id&quot;:&quot;1760970&quot;
    // or variant_id: 1760970
    const variantMatch = html.match(/variant_id&quot;\s*:\s*(\d+)/i) || 
                         html.match(/variant_id["']?\s*:\s*["']?(\d+)/i) ||
                         html.match(/&quot;variant&quot;:\s*\{\s*&quot;id&quot;:\s*(\d+)/i);
                         
    const productMatch = html.match(/product_id&quot;\s*:\s*(\d+)/i) ||
                         html.match(/product_id["']?\s*:\s*["']?(\d+)/i);

    const variantId = variantMatch ? variantMatch[1] : null;
    const productId = productMatch ? productMatch[1] : null;
    
    console.log(`✅ ${name}:`);
    console.log(`   - Product ID: ${productId || 'Not found'}`);
    console.log(`   - Variant ID: ${variantId || 'Not found'}`);
    return { name, variantId, productId };
  } catch (err) {
    console.error(`❌ Failed to parse ${name}: ${err.message}`);
    return { name, variantId: null, productId: null };
  }
}

async function run() {
  console.log("Downloading and parsing checkout pages...\n");
  const results = {};
  for (const [name, url] of Object.entries(urls)) {
    const data = await parseVariantId(name, url);
    results[name] = data.variantId;
  }
  
  console.log("\n=== FOR YOUR .env FILE ===");
  console.log(`LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=${results['PRO_MONTHLY'] || ''}`);
  console.log(`LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID=${results['PRO_YEARLY'] || ''}`);
  console.log(`LEMONSQUEEZY_POWER_MONTHLY_VARIANT_ID=${results['POWER_MONTHLY'] || ''}`);
  console.log(`LEMONSQUEEZY_POWER_YEARLY_VARIANT_ID=${results['POWER_YEARLY'] || ''}`);
  console.log("==========================\n");
}

run();
