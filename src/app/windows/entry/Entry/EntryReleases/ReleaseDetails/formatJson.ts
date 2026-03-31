export const formatJson = (value: unknown): string => {
  switch (typeof value) {
    case "object":
      return JSON.stringify(value, null, 2);
    case "undefined":
      return "undefined";
    case "string":
    case "number":
    case "boolean":
    case "bigint":
    case "symbol":
    case "function":
      return value.toString();
  }
};
