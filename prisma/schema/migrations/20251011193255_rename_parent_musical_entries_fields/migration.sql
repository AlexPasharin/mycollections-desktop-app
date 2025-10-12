/*
  Warnings:

  - The primary key for the `parent_musical_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `child_artist_id` on the `parent_musical_entries` table. All the data in the column will be lost.
  - You are about to drop the column `parent_artist_id` on the `parent_musical_entries` table. All the data in the column will be lost.
  - Added the required column `child_entry_id` to the `parent_musical_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parent_entry_id` to the `parent_musical_entries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "parent_musical_entries" DROP CONSTRAINT "parent_musical_entries_child_artist_id_fkey";

-- DropForeignKey
ALTER TABLE "parent_musical_entries" DROP CONSTRAINT "parent_musical_entries_parent_artist_id_fkey";

-- AlterTable
ALTER TABLE "parent_musical_entries" DROP CONSTRAINT "parent_musical_entries_pkey",
DROP COLUMN "child_artist_id",
DROP COLUMN "parent_artist_id",
ADD COLUMN     "child_entry_id" UUID NOT NULL,
ADD COLUMN     "parent_entry_id" UUID NOT NULL,
ADD CONSTRAINT "parent_musical_entries_pkey" PRIMARY KEY ("parent_entry_id", "child_entry_id");

-- AddForeignKey
ALTER TABLE "parent_musical_entries" ADD CONSTRAINT "parent_musical_entries_parent_entry_id_fkey" FOREIGN KEY ("parent_entry_id") REFERENCES "musical_entries"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_musical_entries" ADD CONSTRAINT "parent_musical_entries_child_entry_id_fkey" FOREIGN KEY ("child_entry_id") REFERENCES "musical_entries"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;
