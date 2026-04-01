import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const wines = [
  // Argentina - Mendoza
  { name: "DV Catena Adrianna Vineyard Malbec", producer: "Catena Zapata", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2021, type: "TINTO" as const, avgRating: 4.3, imageUrl: null },
  { name: "Angelica Zapata Malbec Alta", producer: "Catena Zapata", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2020, type: "TINTO" as const, avgRating: 4.2, imageUrl: null },
  { name: "Catena Malbec", producer: "Catena Zapata", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2022, type: "TINTO" as const, avgRating: 4.0, imageUrl: "https://images.vivino.com/thumbs/SPgFSZm0Tm-O-5xyyZel7A_pl_375x500.png" },
  { name: "Clos de los Siete", producer: "Michel Rolland", country: "Argentina", region: "Valle de Uco", grapes: ["Malbec", "Merlot", "Cabernet Sauvignon"], vintage: 2021, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  { name: "Luigi Bosca Malbec DOC", producer: "Luigi Bosca", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2021, type: "TINTO" as const, avgRating: 4.1, imageUrl: "https://images.vivino.com/thumbs/F7zv69HZS9OHt0UPrc6GRQ_pl_375x500.png" },
  { name: "Susana Balbo Signature Malbec", producer: "Susana Balbo", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2021, type: "TINTO" as const, avgRating: 4.2, imageUrl: null },
  { name: "Terrazas Reserva Malbec", producer: "Terrazas de los Andes", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2022, type: "TINTO" as const, avgRating: 3.9, imageUrl: null },
  { name: "Rutini Malbec", producer: "Rutini Wines", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2021, type: "TINTO" as const, avgRating: 4.1, imageUrl: "https://images.vivino.com/thumbs/AL7A6dlCTTSyYa-wR_Jxmw_pl_375x500.png" },
  { name: "Salentein Reserve Malbec", producer: "Bodegas Salentein", country: "Argentina", region: "Valle de Uco", grapes: ["Malbec"], vintage: 2022, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  { name: "Trapiche Gran Medalla Malbec", producer: "Trapiche", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2020, type: "TINTO" as const, avgRating: 4.1, imageUrl: "https://images.vivino.com/thumbs/vddmeJ1oSV2vNTxsZnrIfg_pl_375x500.png" },
  { name: "Zuccardi Valle de Uco Malbec", producer: "Familia Zuccardi", country: "Argentina", region: "Valle de Uco", grapes: ["Malbec"], vintage: 2022, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  { name: "Norton Reserva Malbec", producer: "Bodega Norton", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2022, type: "TINTO" as const, avgRating: 3.9, imageUrl: null },
  { name: "Alamos Malbec", producer: "Catena Zapata", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2023, type: "TINTO" as const, avgRating: 3.8, imageUrl: null },
  { name: "Kaiken Ultra Malbec", producer: "Kaiken", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2021, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  { name: "El Enemigo Malbec", producer: "El Enemigo", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2021, type: "TINTO" as const, avgRating: 4.3, imageUrl: "https://images.vivino.com/thumbs/S0m-9WKZRfKqjuvZbpy8Vg_pl_375x500.png" },
  { name: "Achaval-Ferrer Malbec", producer: "Achaval-Ferrer", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2021, type: "TINTO" as const, avgRating: 4.2, imageUrl: null },
  // Argentina - Cabernet Sauvignon
  { name: "Luigi Bosca Cabernet Sauvignon", producer: "Luigi Bosca", country: "Argentina", region: "Mendoza", grapes: ["Cabernet Sauvignon"], vintage: 2021, type: "TINTO" as const, avgRating: 3.9, imageUrl: null },
  { name: "Catena Cabernet Sauvignon", producer: "Catena Zapata", country: "Argentina", region: "Mendoza", grapes: ["Cabernet Sauvignon"], vintage: 2021, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  // Argentina - White
  { name: "Catena Chardonnay", producer: "Catena Zapata", country: "Argentina", region: "Mendoza", grapes: ["Chardonnay"], vintage: 2023, type: "BRANCO" as const, avgRating: 3.9, imageUrl: null },
  { name: "Susana Balbo Torrontés", producer: "Susana Balbo", country: "Argentina", region: "Salta", grapes: ["Torrontés"], vintage: 2023, type: "BRANCO" as const, avgRating: 3.8, imageUrl: null },

  // Chile
  { name: "Don Melchor Cabernet Sauvignon", producer: "Concha y Toro", country: "Chile", region: "Puente Alto", grapes: ["Cabernet Sauvignon"], vintage: 2020, type: "TINTO" as const, avgRating: 4.5, imageUrl: null },
  { name: "Casillero del Diablo Cabernet Sauvignon", producer: "Concha y Toro", country: "Chile", region: "Valle Central", grapes: ["Cabernet Sauvignon"], vintage: 2023, type: "TINTO" as const, avgRating: 3.6, imageUrl: null },
  { name: "Montes Alpha Cabernet Sauvignon", producer: "Montes", country: "Chile", region: "Colchagua", grapes: ["Cabernet Sauvignon"], vintage: 2021, type: "TINTO" as const, avgRating: 4.1, imageUrl: null },
  { name: "Montes Alpha M", producer: "Montes", country: "Chile", region: "Apalta", grapes: ["Cabernet Sauvignon", "Merlot", "Cabernet Franc"], vintage: 2019, type: "TINTO" as const, avgRating: 4.4, imageUrl: null },
  { name: "Santa Rita Medalla Real Cabernet Sauvignon", producer: "Santa Rita", country: "Chile", region: "Maipo", grapes: ["Cabernet Sauvignon"], vintage: 2020, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  { name: "Errazuriz Max Reserva Carmenere", producer: "Viña Errazuriz", country: "Chile", region: "Aconcagua", grapes: ["Carmenère"], vintage: 2022, type: "TINTO" as const, avgRating: 3.9, imageUrl: null },
  { name: "Almaviva", producer: "Almaviva", country: "Chile", region: "Puente Alto", grapes: ["Cabernet Sauvignon", "Carmenère", "Cabernet Franc"], vintage: 2020, type: "TINTO" as const, avgRating: 4.5, imageUrl: null },
  { name: "Cono Sur 20 Barrels Pinot Noir", producer: "Cono Sur", country: "Chile", region: "Casablanca", grapes: ["Pinot Noir"], vintage: 2021, type: "TINTO" as const, avgRating: 4.1, imageUrl: null },
  { name: "Ventisquero Grey Carmenere", producer: "Ventisquero", country: "Chile", region: "Maipo", grapes: ["Carmenère"], vintage: 2021, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  { name: "Undurraga T.H. Carignan", producer: "Undurraga", country: "Chile", region: "Maule", grapes: ["Carignan"], vintage: 2021, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  { name: "Lapostolle Cuvée Alexandre Merlot", producer: "Casa Lapostolle", country: "Chile", region: "Colchagua", grapes: ["Merlot"], vintage: 2020, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  // Chile - White
  { name: "Concha y Toro Amelia Chardonnay", producer: "Concha y Toro", country: "Chile", region: "Casablanca", grapes: ["Chardonnay"], vintage: 2022, type: "BRANCO" as const, avgRating: 4.1, imageUrl: null },
  { name: "Montes Alpha Sauvignon Blanc", producer: "Montes", country: "Chile", region: "Leyda", grapes: ["Sauvignon Blanc"], vintage: 2023, type: "BRANCO" as const, avgRating: 3.9, imageUrl: null },
  // Chile - Sparkling
  { name: "Undurraga Extra Brut", producer: "Undurraga", country: "Chile", region: "Leyda", grapes: ["Chardonnay", "Pinot Noir"], vintage: 2021, type: "ESPUMANTE" as const, avgRating: 3.8, imageUrl: null },

  // Uruguay
  { name: "Garzón Reserva Tannat", producer: "Bodega Garzón", country: "Uruguay", region: "Maldonado", grapes: ["Tannat"], vintage: 2021, type: "TINTO" as const, avgRating: 4.1, imageUrl: null },
  { name: "Garzón Single Vineyard Tannat", producer: "Bodega Garzón", country: "Uruguay", region: "Maldonado", grapes: ["Tannat"], vintage: 2020, type: "TINTO" as const, avgRating: 4.3, imageUrl: null },
  { name: "Bouza Tannat", producer: "Bodega Bouza", country: "Uruguay", region: "Canelones", grapes: ["Tannat"], vintage: 2020, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  { name: "Pizzorno Reserva Tannat", producer: "Pizzorno", country: "Uruguay", region: "Canelones", grapes: ["Tannat"], vintage: 2021, type: "TINTO" as const, avgRating: 3.8, imageUrl: null },
  { name: "Familia Deicas Preludio", producer: "Familia Deicas", country: "Uruguay", region: "Juanicó", grapes: ["Tannat", "Merlot", "Cabernet Franc"], vintage: 2019, type: "TINTO" as const, avgRating: 4.2, imageUrl: null },
  { name: "Garzón Albariño", producer: "Bodega Garzón", country: "Uruguay", region: "Maldonado", grapes: ["Albariño"], vintage: 2023, type: "BRANCO" as const, avgRating: 4.0, imageUrl: null },

  // Brazil
  { name: "Miolo Lote 43", producer: "Miolo", country: "Brazil", region: "Vale dos Vinhedos", grapes: ["Merlot", "Cabernet Sauvignon"], vintage: 2020, type: "TINTO" as const, avgRating: 3.9, imageUrl: null },
  { name: "Casa Valduga Raízes Merlot", producer: "Casa Valduga", country: "Brazil", region: "Vale dos Vinhedos", grapes: ["Merlot"], vintage: 2021, type: "TINTO" as const, avgRating: 3.7, imageUrl: null },
  { name: "Salton Intenso Cabernet Sauvignon", producer: "Vinícola Salton", country: "Brazil", region: "Serra Gaúcha", grapes: ["Cabernet Sauvignon"], vintage: 2021, type: "TINTO" as const, avgRating: 3.6, imageUrl: null },
  { name: "Lidio Carraro Grande Vindima Merlot", producer: "Lidio Carraro", country: "Brazil", region: "Serra Gaúcha", grapes: ["Merlot"], vintage: 2019, type: "TINTO" as const, avgRating: 4.0, imageUrl: null },
  { name: "Casa Valduga 130 Brut", producer: "Casa Valduga", country: "Brazil", region: "Vale dos Vinhedos", grapes: ["Chardonnay", "Pinot Noir"], vintage: 2020, type: "ESPUMANTE" as const, avgRating: 3.9, imageUrl: null },
  // Rosé
  { name: "Salentein Portillo Rosé", producer: "Bodegas Salentein", country: "Argentina", region: "Valle de Uco", grapes: ["Malbec"], vintage: 2023, type: "ROSE" as const, avgRating: 3.7, imageUrl: null },
  { name: "Concha y Toro Casillero del Diablo Rosé", producer: "Concha y Toro", country: "Chile", region: "Valle Central", grapes: ["Shiraz"], vintage: 2023, type: "ROSE" as const, avgRating: 3.5, imageUrl: null },
  // Dessert
  { name: "Luigi Bosca Gewürztraminer Late Harvest", producer: "Luigi Bosca", country: "Argentina", region: "Mendoza", grapes: ["Gewürztraminer"], vintage: 2022, type: "SOBREMESA" as const, avgRating: 4.0, imageUrl: null },
  { name: "Norton Cosecha Tardía Chardonnay", producer: "Bodega Norton", country: "Argentina", region: "Mendoza", grapes: ["Chardonnay"], vintage: 2022, type: "SOBREMESA" as const, avgRating: 3.9, imageUrl: null },
  { name: "Zuccardi Malamado Malbec Fortified", producer: "Familia Zuccardi", country: "Argentina", region: "Mendoza", grapes: ["Malbec"], vintage: 2020, type: "SOBREMESA" as const, avgRating: 4.1, imageUrl: null },
];

const stores = ["evino", "wine", "vivino", "divvino"];

function randomPrice(base: number): number {
  const variation = base * 0.15;
  return Math.round((base + (Math.random() * 2 - 1) * variation) * 100) / 100;
}

function getBasePrice(rating: number): number {
  if (rating >= 4.4) return 350 + Math.random() * 200;
  if (rating >= 4.1) return 150 + Math.random() * 150;
  if (rating >= 3.8) return 80 + Math.random() * 80;
  return 40 + Math.random() * 50;
}

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.pledge.deleteMany();
  await prisma.collectiveRound.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.priceSnapshot.deleteMany();
  await prisma.wine.deleteMany();

  for (const w of wines) {
    const slug = slugify(`${w.name}${w.vintage ? `-${w.vintage}` : ""}`);
    const basePrice = getBasePrice(w.avgRating);

    const wine = await prisma.wine.create({
      data: {
        name: w.name,
        producer: w.producer,
        country: w.country,
        region: w.region,
        grapes: w.grapes,
        vintage: w.vintage,
        type: w.type,
        avgRating: w.avgRating,
        imageUrl: w.imageUrl,
        slug,
      },
    });

    // Create 30 days of price snapshots for 2-3 random stores
    const wineStores = stores
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 2));

    for (const store of wineStores) {
      const storeMarkup = 1 + Math.random() * 0.2;

      for (let day = 29; day >= 0; day--) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        date.setHours(6 + Math.floor(Math.random() * 12));

        // Price trends: slight downward trend with noise
        const dayFactor = 1 + (day / 29) * 0.05;
        const price = randomPrice(basePrice * storeMarkup * dayFactor);

        await prisma.priceSnapshot.create({
          data: {
            wineId: wine.id,
            store,
            priceBrl: price,
            inStock: Math.random() > 0.05,
            scrapedAt: date,
          },
        });
      }
    }

    console.log(`  ✓ ${wine.name} (${wineStores.length} stores, 30 days)`);
  }

  console.log(`\nSeeded ${wines.length} wines with price history.`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
