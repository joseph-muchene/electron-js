const { app, BrowserWindow } = require("electron");
const { Menu, globalShortcut } = require("electron/main");
let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  mainWindow.loadFile("./app/index.html");
};

app.whenReady().then(() => {
  createWindow();

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
