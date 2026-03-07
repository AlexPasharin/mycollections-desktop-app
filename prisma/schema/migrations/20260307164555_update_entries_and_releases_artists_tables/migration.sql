/*
  Warnings:

  - The primary key for the `musical_entries_artists` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `entry_artist_name` on the `musical_entries_artists` table. All the data in the column will be lost.
  - The primary key for the `musical_release_alternative_artists` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `alternative_artist_name` on the `musical_release_alternative_artists` table. All the data in the column will be lost.
  - You are about to drop the column `artist_id` on the `musical_release_alternative_artists` table. All the data in the column will be lost.
  - Added the required column `entry_artist_id` to the `musical_release_alternative_artists` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."musical_release_alternative_artists" DROP CONSTRAINT "musical_release_alternative_artists_artist_id_fkey";

-- AlterTable
ALTER TABLE "musical_entries_artists" DROP CONSTRAINT "musical_entries_artists_pkey",
DROP COLUMN "entry_artist_name",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "musical_entries_artists_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "musical_release_alternative_artists" DROP CONSTRAINT "musical_release_alternative_artists_pkey",
DROP COLUMN "alternative_artist_name",
DROP COLUMN "artist_id",
ADD COLUMN     "entry_artist_id" UUID NOT NULL,
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "musical_release_alternative_artists_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "musical_release_alternative_artists" ADD CONSTRAINT "musical_release_alternative_artists_entry_artist_id_fkey" FOREIGN KEY ("entry_artist_id") REFERENCES "musical_entries_artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
