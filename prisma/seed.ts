import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

/**
 * Booth Types:
 * - Standard  : 6 m²
 * - Premium   : 18 m²
 * - Silver    : 18 m²
 * - Elite     : 36 m²
 * - Gold      : 36 m²
 * - Platinum  : 54 m²
 */

const boothTypeData = [
  { name: "Standard", size: 6, price: 5000000 },
  { name: "Premium", size: 18, price: 15000000 },
  { name: "Silver", size: 18, price: 18000000 },
  { name: "Elite", size: 36, price: 30000000 },
  { name: "Gold", size: 36, price: 35000000 },
  { name: "Platinum", size: 54, price: 50000000 },
];

async function main() {
  console.log("🌱 Seeding...\n");

  // Hapus data lama (urutan penting karena FK)
  await prisma.exhibitors.deleteMany();
  await prisma.booths.deleteMany();
  await prisma.boothTypes.deleteMany();

  let boothNumber = 1;

  for (const typeData of boothTypeData) {
    // Buat BoothType
    const boothType = await prisma.boothTypes.create({
      data: {
        name: typeData.name,
        size: typeData.size,
        price: typeData.price,
        isActive: true,
      },
    });

    console.log(
      `  📦 Tipe: ${typeData.name} (${typeData.size} m², Rp ${typeData.price.toLocaleString("id-ID")})`,
    );
  }

  console.log(`\n🎉 Seeding selesai!`);
  console.log(`   - ${boothTypeData.length} tipe booth`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
