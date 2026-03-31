export const formatJson = (value: unknown): string | null => {
  switch (typeof value) {
    case "object":
      return value === null ? null : JSON.stringify(value, null, 2);
    case "undefined":
      return null;
    case "string":
    case "number":
    case "boolean":
    case "bigint":
    case "symbol":
    case "function":
      return value.toString();
  }
};
