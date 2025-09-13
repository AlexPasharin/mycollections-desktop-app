/*
  Warnings:

  - You are about to drop the `alternative_musical_entry_names` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "alternative_musical_entry_names" DROP CONSTRAINT "alternative_musical_entry_names_entry_id_fkey";

-- AlterTable
ALTER TABLE "musical_entries" ADD COLUMN     "alternative_names" TEXT[];

-- DropTable
DROP TABLE "alternative_musical_entry_names";
