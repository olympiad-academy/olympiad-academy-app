// No starter seed rows are shipped into generated products. Domain data is
// created through generated CRUD flows and verified by product-mode gates.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$connect();
} finally {
  await prisma.$disconnect();
}
