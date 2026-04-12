import { v4 as uuidv4 } from "uuid";

export type LabelSlotState = {
  id: string;
  name: string;
};

export type CatalogueNumberSlotState = {
  id: string;
  value: string;
};

export type CatalogueNumberRowState = {
  id: string;
  labelSlots: LabelSlotState[];
  catalogueNumberSlots: CatalogueNumberSlotState[];
};

export const emptyLabelSlot = (): LabelSlotState => ({
  id: uuidv4(),
  name: "",
});

export const emptyCatalogueNumberSlot = (): CatalogueNumberSlotState => ({
  id: uuidv4(),
  value: "",
});

export const defaultCatalogueNumberRow = (): CatalogueNumberRowState => ({
  id: uuidv4(),
  labelSlots: [emptyLabelSlot()],
  catalogueNumberSlots: [emptyCatalogueNumberSlot()],
});
