import { useRef, useState, type FC } from "react";
import { validate as isValidUuid } from "uuid";

import api from "@/app/windows/entry/api";
import type { DbSource } from "@/db/db-source";
import type { ReleaseByIdResult } from "@/types/releases";

type ReleaseFormBlueprintLoaderProps = {
  primaryDbSource: DbSource;
  onReleaseFetched: (release: ReleaseByIdResult) => void;
};

const RELEASE_ID_INPUT_ID = "add-release-blueprint-release-id";
const RELEASE_ID_ERROR_ID = "add-release-blueprint-release-id-error";

const ReleaseFormBlueprintLoader: FC<ReleaseFormBlueprintLoaderProps> = ({
  primaryDbSource,
  onReleaseFetched,
}) => {
  const [releaseIdInput, setReleaseIdInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const fetchTokenRef = useRef(0);

  const trimmedReleaseId = releaseIdInput.trim();
  const canPopulate = trimmedReleaseId.length > 0 && !isLoading;

  const handlePopulate = () => {
    if (!canPopulate) {
      return;
    }

    if (!isValidUuid(trimmedReleaseId)) {
      setErrorMessage("Release ID must be a valid UUID.");

      return;
    }

    const token = ++fetchTokenRef.current;
    setIsLoading(true);
    setErrorMessage(undefined);

    api
      .getReleaseById(trimmedReleaseId, primaryDbSource)
      .then((release) => {
        if (token !== fetchTokenRef.current) {
          return;
        }

        if (release) {
          onReleaseFetched(release);
        } else {
          setErrorMessage("No release found for that ID.");
        }
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch the release.";

        console.error("Failed to fetch release to populate the form", message);

        if (token !== fetchTokenRef.current) {
          return;
        }

        setErrorMessage("Failed to fetch the release.");
      })
      .finally(() => {
        if (token !== fetchTokenRef.current) {
          return;
        }

        setIsLoading(false);
      });
  };

  const hasError = errorMessage !== undefined;

  return (
    <div className="mb-[0.65rem] flex flex-col gap-[0.35rem]">
      <label
        className="m-0 text-[1em] leading-[1.35] font-semibold"
        htmlFor={RELEASE_ID_INPUT_ID}
      >
        Populate from an existing release
      </label>
      <p className="m-0 text-[0.9em] text-[#555]">
        Paste a release ID to fill the form with that release&apos;s data. Name
        and Discogs URL are not copied.
      </p>
      <div className="mt-[0.15rem] flex flex-wrap items-center gap-2">
        <input
          id={RELEASE_ID_INPUT_ID}
          className="min-w-0 flex-[1_1_16rem] px-2 py-[0.35rem] text-[1em]"
          type="text"
          value={releaseIdInput}
          onChange={(e) => {
            setReleaseIdInput(e.target.value);
            setErrorMessage(undefined);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handlePopulate();
            }
          }}
          placeholder="Release ID"
          aria-invalid={hasError}
          aria-describedby={hasError ? RELEASE_ID_ERROR_ID : undefined}
          autoComplete="off"
        />
        <button
          type="button"
          className="cursor-pointer rounded-md border border-[#bcbcbc] bg-white px-[0.9rem] py-[0.35rem] font-medium text-[#333] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a5fb4] hover:enabled:border-[#9a9a9a] hover:enabled:bg-[#f1f1f1] disabled:cursor-not-allowed disabled:border-[#bcbcbc] disabled:bg-[#d6d6d6] disabled:text-[#6b6b6b]"
          onClick={handlePopulate}
          disabled={!canPopulate}
        >
          {isLoading ? "Loading\u2026" : "Populate from release"}
        </button>
      </div>
      {hasError && (
        <p
          id={RELEASE_ID_ERROR_ID}
          className="mt-[0.35rem] mb-0 text-[0.9em] text-[#b42318]"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default ReleaseFormBlueprintLoader;
