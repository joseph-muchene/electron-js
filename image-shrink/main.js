const dotenv = require("dotenv");
dotenv.config();
const { app, BrowserWindow } = require("electron");
const { Menu, globalShortcut, ipcMain } = require("electron/main");
let mainWindow;
let aboutWindow;

console.log(process.env.DEV);
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: "./assets/icon/Icon_256x256.png",
    backgroundColor: "white",
    // ability to use node on renderer script
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // open devtools automatically on development mode
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile("./app/index.html");
};
const createAboutWindow = () => {
  aboutWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "About ImageShrink",
    icon: "./assets/icons/Icon_256x256.png",
    resizable: false,
    backgroundColor: "white",
  });

  aboutWindow.loadFile("./app/about.html");
};

// receive data on the main process
ipcMain.on("image:minimize", (e, options) => {
  console.log(options);
});
app.whenReady().then(() => {
  createWindow();
  // createAboutWindow();

  //   creating our own menu
  const menu = [
    {
      label: "File",
      submenu: [
        {
          label: "Quit",
          //   add shortcut to menu
          accelerator:
            process.platform === "darwin" ? "Command + w" : "Ctrl + w",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: app.name,
      submenu: [
        {
          label: "About",
          //   add shortcut to menu
          click: createAboutWindow,
        },
      ],
    },
  ];

  // build the menu
  const mainMenu = Menu.buildFromTemplate(menu);
  //   set the application menu to the main menu
  Menu.setApplicationMenu(mainMenu);

  //   adding global shortcuts to the main window
  globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  globalShortcut.register(
    process.platform === "darwin" ? "Command+Alt+I" : "Ctrl+Shift + I",
    () => mainWindow.toggleDevTools()
  );

  mainWindow.on("ready", () => (createWindow = null));

  // configure menu on mac
  if (process.platform === "darwin") {
    menu.unshift({ role: "appMenu" });
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
