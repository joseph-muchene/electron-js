const path = require("path");
const os = require("os");
const dotenv = require("dotenv");
const imageMin = require("imagemin");
// allows access to folder
const { shell } = require("electron");
const imageMinMozJpeg = require("imagemin-mozjpeg");
const imageMinQuant = require("imagemin-pngquant");
const slash = require("slash");
dotenv.config();

// show logs package
const log = require("electron-log");
const { app, BrowserWindow } = require("electron");
const { Menu, globalShortcut, ipcMain } = require("electron/main");
let mainWindow;
let aboutWindow;

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
  options.dest = path.join(os.homedir(), "imageshrink");

  shrinkImage(options);
});

// handle shrink image
async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;
    const files = await imageMin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageMinMozJpeg({ quality }),
        imageMinQuant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    log.info(files);
    shell.openPath(dest);

    // send to the renderer (main process to the renderer)
    mainWindow.webContents.send("image:done");
  } catch (err) {
    log.error(err);
  }
}

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
