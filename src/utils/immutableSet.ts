/** Curried `setState` updater for `ReadonlySet` / `Set` state (add or remove one value). */
export const updateImmutableSet =
  <T>(value: T, operation: "add" | "remove") =>
  (prev: ReadonlySet<T>): ReadonlySet<T> => {
    const next = new Set(prev);

    if (operation === "add") {
      next.add(value);
    } else {
      next.delete(value);
    }

    return next;
  };
