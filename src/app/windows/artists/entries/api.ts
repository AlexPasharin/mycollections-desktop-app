// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type API = {
  // Add IPC-backed API methods here as needed
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
