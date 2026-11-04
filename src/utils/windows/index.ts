import { app, BrowserWindow, shell } from "electron";

import appWindows from "@/app/windows";
import type { AppWindowName } from "@/appConstants/appWindows";

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

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (/^https?:\/\//.test(url)) {
        void shell.openExternal(url);
      }

      return { action: "deny" };
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
