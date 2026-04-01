/**
 * Script to fetch wine bottle image URLs from Vivino and update the database.
 *
 * Usage: npx tsx scripts/fetch-wine-images.ts
 *
 * This script searches Vivino for each wine in the database that doesn't have
 * an image URL, extracts the bottle thumbnail URL, and updates the wine record.
 *
 * NOTE: Run this on your local machine (not in CI/CD). Vivino may block
 * server-side requests from cloud environments.
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const VIVINO_API_URL = "https://www.vivino.com/api/explore/explore";

interface VivinoWine {
  vintage: {
    wine: {
      name: string;
      id: number;
    };
    image: {
      location: string;
    };
  };
}

interface VivinoResponse {
  explore_vintage: {
    matches: VivinoWine[];
  };
}

async function searchVivino(wineName: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      "q": wineName,
      "page": "1",
      "per_page": "5",
      "min_rating": "1",
      "currency_code": "BRL",
    });

    const response = await fetch(`${VIVINO_API_URL}?${params}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.log(`  HTTP ${response.status}`);
      return null;
    }

    const data = await response.json() as VivinoResponse;
    const matches = data?.explore_vintage?.matches;

    if (!matches?.length) {
      console.log(`  No results`);
      return null;
    }

    // Use the first match's image
    const imageLocation = matches[0].vintage?.image?.location;
    if (imageLocation) {
      // Vivino returns relative paths like "//images.vivino.com/thumbs/..."
      const url = imageLocation.startsWith("//")
        ? `https:${imageLocation}`
        : imageLocation.startsWith("http")
        ? imageLocation
        : `https://images.vivino.com/thumbs/${imageLocation}_pl_375x500.png`;
      return url;
    }

    return null;
  } catch (error) {
    console.log(`  Error: ${error}`);
    return null;
  }
}

async function main() {
  console.log("Fetching wine images from Vivino...\n");

  const wines = await prisma.wine.findMany({
    where: { imageUrl: null },
    orderBy: { name: "asc" },
  });

  console.log(`Found ${wines.length} wines without images.\n`);

  let updated = 0;
  let failed = 0;

  for (const wine of wines) {
    process.stdout.write(`[${updated + failed + 1}/${wines.length}] ${wine.name}...`);

    const imageUrl = await searchVivino(wine.name);

    if (imageUrl) {
      await prisma.wine.update({
        where: { id: wine.id },
        data: { imageUrl },
      });
      console.log(` OK -> ${imageUrl}`);
      updated++;
    } else {
      console.log(` SKIP`);
      failed++;
    }

    // Rate limit: wait 3 seconds between requests to avoid being blocked
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${failed}`);

  if (failed > 0) {
    console.log("\nWines without images:");
    const remaining = await prisma.wine.findMany({
      where: { imageUrl: null },
      select: { name: true },
    });
    remaining.forEach((w) => console.log(`  - ${w.name}`));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
