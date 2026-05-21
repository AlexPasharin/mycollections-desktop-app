import { PrismaClient } from "@/prisma/generated";

// // not used at the moment
const client = (dbUrl: string) =>
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

export default client;
