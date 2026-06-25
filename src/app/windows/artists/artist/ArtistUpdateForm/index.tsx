import { type FC, type FormEvent, useEffect, useState } from "react";

import api from "../api";

import ErrorMessages from "@/app/components/ErrorMessages";
import type { DbSource } from "@/db/db-source";
import type {
  ArtistAltNameInput,
  ArtistByIdResult,
  UpdateArtistInput,
} from "@/types/artists";
import { ArtistType } from "@/types/db/database";
import type { FormFeedback } from "@/types/form";
import { withNewId } from "@/utils/id";
import {
  validateOptionalTrimmedText,
  validateRequiredTrimmedText,
} from "@/validation";

type ArtistUpdateFormProps = {
  artist: ArtistByIdResult;
  primaryDbSource: DbSource;
  onClearFeedback: () => void;
  onArtistUpdated: (result: {
    artist: ArtistByIdResult;
    feedback: FormFeedback;
  }) => void;
};

type AltNameRow = {
  id: string;
  nameId?: string;
  name: string;
};

type AltNameRowErrors = Record<string, { message: string }[] | undefined>;

const ArtistUpdateForm: FC<ArtistUpdateFormProps> = ({
  artist,
  primaryDbSource,
  onClearFeedback,
  onArtistUpdated,
}) => {
  const [name, setName] = useState(artist.name);
  const [nameForSorting, setNameForSorting] = useState(
    artist.nameForSorting ?? "",
  );
  const [type, setType] = useState(artist.type);
  const [partOfQueenFamily, setPartOfQueenFamily] = useState(
    artist.partOfQueenFamily,
  );
  const [altNameRows, setAltNameRows] = useState<AltNameRow[]>(() =>
    toAltNameRows(artist),
  );
  const [nameError, setNameError] = useState<string>();
  const [altNameErrors, setAltNameErrors] = useState<AltNameRowErrors>({});

  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(artist.name);
    setNameForSorting(artist.nameForSorting ?? "");
    setType(artist.type);
    setPartOfQueenFamily(artist.partOfQueenFamily);
    setAltNameRows(toAltNameRows(artist));
    setNameError(undefined);
    setAltNameErrors({});
    setSubmitError(undefined);
  }, [artist, primaryDbSource]);

  const handleAddAltNameRow = () => {
    setAltNameRows((rows) => [...rows, withNewId({ name: "" })]);
  };

  const handleRemoveAltNameRow = (rowId: string) => {
    setAltNameRows((rows) => rows.filter((row) => row.id !== rowId));
    setAltNameErrors((errors) => omitProperty(errors, rowId));
  };

  const handleAltNameChange = (rowId: string, value: string) => {
    setAltNameRows((rows) =>
      rows.map((row) => (row.id === rowId ? { ...row, name: value } : row)),
    );
    setAltNameErrors((errors) => omitProperty(errors, rowId));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nameValidation = validateRequiredTrimmedText(
      "Artist name is required",
    )(name);
    const nameForSortingValidation =
      validateOptionalTrimmedText(nameForSorting);
    const altNamesValidation = validateAltNames(
      nameValidation.value,
      altNameRows,
    );

    setNameError(
      nameValidation.valid
        ? undefined
        : nameValidation.errorMessages[0]?.message,
    );
    setAltNameErrors(
      altNamesValidation.valid ? {} : altNamesValidation.errorMessages,
    );

    if (!nameValidation.valid || !altNamesValidation.valid) {
      return;
    }

    onClearFeedback();
    setSubmitError(undefined);
    setIsSubmitting(true);

    const input = buildUpdateArtistInput(
      artist.artistId,
      nameValidation.value,
      toNullableTrimmedText(nameForSortingValidation.value),
      type,
      partOfQueenFamily,
      altNamesValidation.value,
    );

    api
      .updateArtist(input, primaryDbSource)
      .then(({ artist: updatedArtist, notifications }) => {
        onArtistUpdated({
          artist: updatedArtist,
          feedback: {
            notifications: [
              ...(nameValidation.notifications ?? []),
              ...(nameForSortingValidation.notifications ?? []),
              ...(altNamesValidation.notifications ?? []),
              ...notifications.map((notification) => ({ notification })),
            ],
            errors: [],
          },
        });
      })
      .catch((error: unknown) => {
        console.error("Error updating artist", error);
        setSubmitError(formatUpdateArtistError(error));
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <form className="flex max-w-2xl flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <label htmlFor="update-artist-name" className="font-medium">
          Name
        </label>
        <input
          id="update-artist-name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setNameError(undefined);
            setSubmitError(undefined);
          }}
          disabled={isSubmitting}
          aria-invalid={nameError !== undefined}
          aria-describedby={nameError ? "update-artist-name-error" : undefined}
          className="px-2 py-[0.35rem] text-base"
          autoComplete="off"
        />
        {nameError && (
          <p
            id="update-artist-name-error"
            className="m-0 text-[0.85em] text-[#b42318]"
            role="alert"
          >
            {nameError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="update-artist-name-for-sorting" className="font-medium">
          Name used for sorting
        </label>
        <input
          id="update-artist-name-for-sorting"
          type="text"
          value={nameForSorting}
          onChange={(event) => {
            setNameForSorting(event.target.value);
            setSubmitError(undefined);
          }}
          disabled={isSubmitting}
          className="px-2 py-[0.35rem] text-base"
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="update-artist-type" className="font-medium">
          Type
        </label>
        <select
          id="update-artist-type"
          value={type}
          onChange={(event) => {
            const nextType = parseArtistType(event.target.value);

            if (nextType !== undefined) {
              setType(nextType);
              setSubmitError(undefined);
            }
          }}
          disabled={isSubmitting}
          className="box-border w-full max-w-96 px-2 py-[0.35rem] text-base"
        >
          {ARTIST_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={partOfQueenFamily}
          onChange={(event) => {
            setPartOfQueenFamily(event.target.checked);
            setSubmitError(undefined);
          }}
          disabled={isSubmitting}
        />
        <span>Part of Queen family</span>
      </label>

      <div>
        <h2 className="mb-3 text-base leading-snug font-semibold">
          Alternative names
        </h2>

        {altNameRows.length > 0 && (
          <ul
            className="mb-3 flex flex-col gap-[0.55rem]"
            aria-label="Alternative names"
          >
            {altNameRows.map((row, index) => {
              const rowErrors = altNameErrors[row.id];
              const hasErrors = rowErrors !== undefined && rowErrors.length > 0;
              const errorId = `update-artist-alt-name-error-${row.id}`;
              const inputId = `update-artist-alt-name-${row.id}`;

              return (
                <li key={row.id} className="flex flex-wrap items-start gap-2">
                  <label
                    className="min-w-28 pt-[0.35rem] text-[0.92em] font-semibold"
                    htmlFor={inputId}
                  >
                    Alt name {index + 1}
                  </label>
                  <input
                    id={inputId}
                    className="min-w-40 flex-[1_1_14rem] px-2 py-[0.35rem] text-base"
                    type="text"
                    value={row.name}
                    onChange={(event) => {
                      handleAltNameChange(row.id, event.target.value);
                    }}
                    disabled={isSubmitting}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? errorId : undefined}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="cursor-pointer rounded-md border border-[#bcbcbc] bg-white px-[0.6rem] py-[0.35rem] text-[0.92em] text-[#333] hover:bg-[#f1f1f1] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => {
                      handleRemoveAltNameRow(row.id);
                    }}
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                  <ErrorMessages id={errorId} messages={rowErrors} />
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          className="inline-block cursor-pointer border-none bg-transparent px-0 py-1 text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleAddAltNameRow}
          disabled={isSubmitting}
        >
          Add alternative name
        </button>
      </div>

      {submitError && (
        <p className="m-0 text-[0.85em] text-[#b42318]" role="alert">
          {submitError}
        </p>
      )}

      <div>
        <button
          type="submit"
          className="cursor-pointer rounded-md border border-indigo-600 bg-indigo-600 px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium text-white transition-[background,border-color] duration-150 ease-in-out hover:enabled:border-indigo-700 hover:enabled:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving\u2026" : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default ArtistUpdateForm;

const formatArtistTypeLabel = (type: ArtistByIdResult["type"]): string =>
  type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

const ARTIST_TYPE_VALUES = Object.values(ArtistType);

const ARTIST_TYPE_OPTIONS = ARTIST_TYPE_VALUES.map((value) => ({
  value,
  label: formatArtistTypeLabel(value),
}));

const isArtistType = (value: string): value is ArtistType =>
  ARTIST_TYPE_VALUES.some((type) => type === value);

const parseArtistType = (value: string): ArtistType | undefined =>
  isArtistType(value) ? value : undefined;

const toAltNameRows = (artist: ArtistByIdResult): AltNameRow[] =>
  artist.altNames.map((altName) => ({
    id: altName.nameId,
    nameId: altName.nameId,
    name: altName.name,
  }));

const buildUpdateArtistInput = (
  artistId: string,
  name: string,
  nameForSorting: string | null,
  type: ArtistByIdResult["type"],
  partOfQueenFamily: boolean,
  altNameRows: AltNameRow[],
): UpdateArtistInput => ({
  artistId,
  artist: {
    name,
    nameForSorting,
    type,
    partOfQueenFamily,
  },
  altNames: altNameRows.map(toAltNameInput),
});

const toNullableTrimmedText = (value: string): string | null =>
  value === "" ? null : value;

const toAltNameInput = (row: AltNameRow): ArtistAltNameInput => ({
  ...(row.nameId === undefined ? {} : { nameId: row.nameId }),
  name: row.name,
});

const validateAltNames = (
  mainName: string,
  rows: AltNameRow[],
):
  | {
      valid: true;
      value: AltNameRow[];
      notifications?: FormFeedback["notifications"];
    }
  | {
      valid: false;
      value: AltNameRow[];
      errorMessages: AltNameRowErrors;
    } => {
  const normalizedMainName = mainName.trim().toLowerCase();
  const seenNames = new Set<string>();
  const errors: AltNameRowErrors = {};
  let valid = true;

  const normalizedRows = rows.map((row) => ({
    ...row,
    name: row.name.trim(),
  }));

  for (const row of normalizedRows) {
    const rowErrors = [];

    if (row.name === "") {
      rowErrors.push({ message: "Alternative name cannot be empty." });
    } else if (row.name.toLowerCase() === normalizedMainName) {
      rowErrors.push({
        message: "Alternative name cannot match the artist's main name.",
      });
    } else {
      const normalized = row.name.toLowerCase();

      if (seenNames.has(normalized)) {
        rowErrors.push({ message: "Duplicate alternative name." });
      } else {
        seenNames.add(normalized);
      }
    }

    if (rowErrors.length > 0) {
      valid = false;
      errors[row.id] = rowErrors;
    }
  }

  if (!valid) {
    return {
      valid: false,
      value: rows,
      errorMessages: errors,
    };
  }

  const hasTrimNotifications = rows.some((row) => row.name !== row.name.trim());

  if (hasTrimNotifications) {
    return {
      valid: true,
      value: normalizedRows,
      notifications: [
        { notification: "Note: alternative names have been trimmed" },
      ],
    };
  }

  return {
    valid: true,
    value: normalizedRows,
  };
};

const omitProperty = <T extends Record<string, unknown>, K extends keyof T>(
  record: T,
  key: K,
): Omit<T, K> => {
  const { [key]: _removed, ...rest } = record;

  return rest;
};

const formatUpdateArtistError = (reason: unknown): string =>
  reason instanceof Error ? reason.message : "Failed to update artist";
