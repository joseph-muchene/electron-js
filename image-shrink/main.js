const { app, BrowserWindow } = require("electron");

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "ImageShrink",
    width: 500,
    height: 600,
  });
  // loading a local file
  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}

app.on("ready", createMainWindow);
