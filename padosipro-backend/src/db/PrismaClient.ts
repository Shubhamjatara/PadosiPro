import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";
import Environment from "../config/Enviroment";

const adapter = new PrismaPg({
  connectionString: Environment.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function testConnection() {

  try {
    await prisma.$connect();

    const result = await prisma.$queryRaw`
      SELECT current_database()
    `;

    console.log("Database connected:", result);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

export default prisma;
