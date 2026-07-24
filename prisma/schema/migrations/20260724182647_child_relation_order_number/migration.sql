-- AlterTable
ALTER TABLE "parent_musical_entries" ADD COLUMN     "child_entry_order_number" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "parent_musical_releases" ADD COLUMN     "child_release_order_number" INTEGER NOT NULL DEFAULT 1;
