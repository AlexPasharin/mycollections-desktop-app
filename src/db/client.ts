import { PrismaClient } from "@/prisma/generated";

const client = new PrismaClient({
  datasources: {
    db: {
      url: process.env["DATABASE_URL"] ?? "", // "make" process does not pick up the environment variable otherwise
    },
  },
});

export default client;
