/*
  Warnings:

  - The primary key for the `parent_musical_releases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `child_entry_id` on the `parent_musical_releases` table. All the data in the column will be lost.
  - You are about to drop the column `parent_entry_id` on the `parent_musical_releases` table. All the data in the column will be lost.
  - Added the required column `child_release_id` to the `parent_musical_releases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parent_release_id` to the `parent_musical_releases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."parent_musical_releases" DROP CONSTRAINT "parent_musical_releases_child_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."parent_musical_releases" DROP CONSTRAINT "parent_musical_releases_parent_entry_id_fkey";

-- AlterTable
ALTER TABLE "parent_musical_releases" DROP CONSTRAINT "parent_musical_releases_pkey",
DROP COLUMN "child_entry_id",
DROP COLUMN "parent_entry_id",
ADD COLUMN     "child_release_id" UUID NOT NULL,
ADD COLUMN     "parent_release_id" UUID NOT NULL,
ADD CONSTRAINT "parent_musical_releases_pkey" PRIMARY KEY ("parent_release_id", "child_release_id");

-- AddForeignKey
ALTER TABLE "parent_musical_releases" ADD CONSTRAINT "parent_musical_releases_parent_release_id_fkey" FOREIGN KEY ("parent_release_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_musical_releases" ADD CONSTRAINT "parent_musical_releases_child_release_id_fkey" FOREIGN KEY ("child_release_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;
