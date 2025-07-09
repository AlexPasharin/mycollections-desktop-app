declare global {
  interface Window {
    data: { getArtists: () => Promise<{ name: string; id: string }[][]> };
  }
}

export {};
