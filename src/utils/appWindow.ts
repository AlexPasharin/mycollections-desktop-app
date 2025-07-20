import { app, BrowserWindow } from "electron";

type CreateWindowParams = {
  preload: string;
  html: string;
};

export const createWindow = async ({
  preload,
  html,
}: CreateWindowParams): Promise<void> => {
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
