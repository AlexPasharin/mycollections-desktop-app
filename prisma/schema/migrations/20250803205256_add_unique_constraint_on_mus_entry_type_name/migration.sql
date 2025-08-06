/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `musical_entry_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "musical_entry_types_name_key" ON "musical_entry_types"("name");
