import { readFile, writeFile } from 'fs/promises';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../src/data/data.json');

async function extractAmazonId(url) {
  const match = url.match(/\/([A-Z0-9]{10})(?:\/|\?|$)/);
  return match ? match[1] : null;
}

async function getProductPrice(amazonId) {
  const url = "https://amazon-data-scraper-api3.p.rapidapi.com/queries";
  
  const options = {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'amazon-data-scraper-api3.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: "amazon_product",
      query: amazonId,
      domain: "es",
      geo_location: "28001",
      parse: true
    })
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.results && data.results[0]?.content) {
      const content = data.results[0].content;
      const buybox = content.buybox?.[0] || {};
      const discountPercentage = parseInt(content.discount_percentage) || 0;
      
      // Get the current price from buybox
      const currentPrice = parseFloat(buybox.price) || null;
      
      // If there's a discount, calculate the original price
      const originalPrice = discountPercentage > 0 
        ? currentPrice / (1 - discountPercentage / 100)
        : currentPrice;
      
      return {
        price: originalPrice,
        discount: {
          percentage: discountPercentage
        },
        stock: buybox.stock || "N/A",
        lastUpdated: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error(`Error fetching price for ${amazonId}:`, error);
  }

  return null;
}

async function updatePrices() {
  try {
    // Read the data file
    const data = JSON.parse(await readFile(DATA_FILE, 'utf8'));
    let updatesCount = 0;

    // Update each product
    for (const product of data.products) {
      const amazonId = await extractAmazonId(product.affiliateUrl);
      if (!amazonId) {
        console.warn(`Could not extract Amazon ID from URL: ${product.affiliateUrl}`);
        continue;
      }

      console.log(`Updating price for ${product.title} (${amazonId})...`);
      
      const priceData = await getProductPrice(amazonId);
      if (priceData) {
        product.price = priceData.price || product.price;
        product.discount = priceData.discount;
        product.stock = priceData.stock;
        product.lastUpdated = priceData.lastUpdated;
        updatesCount++;
      }

      // Wait 1 second between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save the updated data
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`Successfully updated ${updatesCount} products`);

  } catch (error) {
    console.error('Error updating prices:', error);
  }
}

// Run the update
updatePrices();