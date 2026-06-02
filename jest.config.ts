import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
    "^@/constants$": "<rootDir>/src/constants.ts",
    "^@/appConstants/(.*)$": "<rootDir>/appConstants/$1",
    "^@/config/(.*)$": "<rootDir>/src/config/$1",
    "^@/db/(.*)$": "<rootDir>/src/db/$1",
    "^@/hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@/prisma/(.*)$": "<rootDir>/prisma/$1",
    "^@/styles/(.*)$": "<rootDir>/src/styles/$1",
    "^@/types/(.*)$": "<rootDir>/src/types/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/validation$": "<rootDir>/src/validation/index.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
};

export default config;
