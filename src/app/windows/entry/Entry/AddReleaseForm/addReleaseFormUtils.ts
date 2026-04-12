import { v4 as uuidv4 } from "uuid";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { GeneralizedDate } from "@/types/date";
import type { EntryByIdResult } from "@/types/entries";
import type { ValidationResultErrorMessages } from "@/utils/validation";

export type AddReleaseFormEntry = Omit<
  EntryByIdResult,
  "originalReleaseDate"
> & {
  originalReleaseDate: GeneralizedDate | null;
};

export type AddReleaseFormFormatInput = {
  id: string;
  formatId: string;
  shortName: string;
  amount: string;
  pictureSleeve: boolean;
  jukeboxHole: boolean;
};

export type FormatField =
  | "formatId"
  | "amount"
  | "pictureSleeve"
  | "jukeboxHole";

type ReleaseDateFieldErrorSource = keyof GeneralizedDateFormInputValue;

export type AddReleaseFormFieldError = {
  message: string;
  sources?: PropertyKey[] | undefined;
};

export type AddReleaseFormFieldErrors = {
  releaseVersion?: AddReleaseFormFieldError[] | undefined;
  releaseDate?: AddReleaseFormFieldError[] | undefined;
  formats?: Record<string, AddReleaseFormFieldError[] | undefined> | undefined;
};

export type AddReleaseFormInputFieldKey =
  | "releaseVersion"
  | ReleaseDateFieldErrorSource
  | { formatRowId: string; field: FormatField };

export const isReleaseDateInputFieldKey = (key: AddReleaseFormInputFieldKey) =>
  key === "year" || key === "month" || key === "day";

export const isFormatInputFieldKey = (key: AddReleaseFormInputFieldKey) =>
  typeof key === "object";

export const defaultFormatInputRow = (): AddReleaseFormFormatInput => ({
  id: uuidv4(),
  formatId: "",
  shortName: "",
  amount: "1",
  pictureSleeve: true,
  jukeboxHole: false,
});

export type AddReleaseFormDraft = {
  releaseVersion: string;
  releaseDate: GeneralizedDateFormInputValue;
  formats: AddReleaseFormFormatInput[];
};

export const initialAddReleaseFormDraftValue = (
  originalReleaseDate: GeneralizedDate | null,
): AddReleaseFormDraft => ({
  releaseVersion: "",
  releaseDate: {
    year: String(originalReleaseDate?.year ?? ""),
    month: String(originalReleaseDate?.month ?? ""),
    day: String(originalReleaseDate?.day ?? ""),
  },
  formats: [defaultFormatInputRow()],
});

export const getReleaseDateFormFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
) => {
  const errorMessagesMap: Record<string, PropertyKey[]> = {};

  for (const { message, path } of errorMessages) {
    const mapEntry = errorMessagesMap[message] ?? [];
    const source = path[1];

    if (source) {
      mapEntry.push(source);
    }

    errorMessagesMap[message] = mapEntry;
  }

  return Object.entries(errorMessagesMap).map(([message, sources]) => ({
    message,
    sources: sources.length > 0 ? sources : undefined,
  }));
};

export const getFormatsFormFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
  currentFormatInputValues: AddReleaseFormFormatInput[],
) => {
  const errorMessagesMap: Record<string, Record<string, PropertyKey[]>> = {};

  for (const { message, path } of errorMessages) {
    const rowIndex = path[1];
    const source = path[2];

    const filterRowById =
      typeof rowIndex === "number"
        ? currentFormatInputValues[rowIndex]
        : undefined;

    if (!filterRowById) {
      continue;
    }

    const mapEntry = errorMessagesMap[filterRowById.id] ?? {};
    const messageEntry = mapEntry[message] ?? [];

    if (source) {
      messageEntry.push(source);
    }

    mapEntry[message] = messageEntry;
    errorMessagesMap[filterRowById.id] = mapEntry;
  }

  const formatsErrorMessages: Exclude<
    AddReleaseFormFieldErrors["formats"],
    undefined
  > = {};

  for (const [rowId, messages] of Object.entries(errorMessagesMap)) {
    formatsErrorMessages[rowId] = Object.entries(messages).map(
      ([message, sources]) => ({
        message,
        sources: sources.length > 0 ? sources : undefined,
      }),
    );
  }

  return formatsErrorMessages;
};
