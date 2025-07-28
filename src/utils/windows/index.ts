import { app, BrowserWindow } from "electron";

import type { AppWindowName } from "constants/appWindows";

import appWindows from "@/app/appWindows";

const createWindow = (appWindowName: AppWindowName) => async () => {
  const { html, preload } = appWindows[appWindowName];

  const mainWindow = new BrowserWindow({
    height: 1000,
    width: 1000,
    webPreferences: {
      preload,
    },
  });

  await mainWindow.loadURL(html);

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
};

export default createWindow;
