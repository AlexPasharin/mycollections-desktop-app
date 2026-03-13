import { app, BrowserWindow } from "electron";

import type { AppWindowName } from "constants/appWindows";

import appWindows from "@/app/windows";

const createWindow =
  (appWindowName: AppWindowName) =>
  async (urlParams?: Record<string, string>) => {
    const { html, preload } = appWindows[appWindowName];

    const mainWindow = new BrowserWindow({
      height: 1000,
      width: 1000,
      webPreferences: {
        preload,
      },
    });

    const url =
      urlParams && Object.keys(urlParams).length > 0
        ? `${html}${html.includes("?") ? "&" : "?"}${new URLSearchParams(urlParams).toString()}`
        : html;
    await mainWindow.loadURL(url);

    const isDev = !app.isPackaged;

    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  };

export default createWindow;
