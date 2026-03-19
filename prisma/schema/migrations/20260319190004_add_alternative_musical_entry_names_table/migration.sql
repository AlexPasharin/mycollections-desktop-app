-- CreateTable
CREATE TABLE "alternative_musical_entry_names" (
    "name_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "entry_id" UUID NOT NULL,

    CONSTRAINT "alternative_musical_entry_names_pkey" PRIMARY KEY ("name_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alternative_musical_entry_names_name_entry_id_key" ON "alternative_musical_entry_names"("name", "entry_id");

-- AddForeignKey
ALTER TABLE "alternative_musical_entry_names" ADD CONSTRAINT "alternative_musical_entry_names_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "musical_entries"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;
